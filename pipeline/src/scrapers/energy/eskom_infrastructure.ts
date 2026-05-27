/**
 * eskom_infrastructure.ts — Eskom generation infrastructure scraper
 *
 * Source: Eskom Data Portal (www.eskom.co.za/dataportal)
 * Method: cheerio page scrape → direct CSV download (no Playwright needed)
 *
 * Pages scraped:
 *   /outage-performance/monthly-eskom-generation-unavailability/ → Monthly_Eskom_generation_unavailability.csv
 *   /supply-side/station-build-up-for-the-last-7-days/           → Station_Build_Up.csv
 *   /renewables-performance/renewable-statistics/                → RE_*.csv (4 files)
 *   /ocgt-usage/total-monthly-ocgt-eskom-ipp-and-gt-energy-utilization/ → Total_monthly_OCGT_*.csv
 *
 * Output (long format): Date, Station_Or_Type, Metric, Value, Unit, Source_File
 */

import path from "path";
import * as cheerio from "cheerio";
import { downloadBuffer } from "../../lib/http.js";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

const BASE = "https://www.eskom.co.za/dataportal";

const SOURCE_PAGES = [
  { slug: "outage-performance/monthly-eskom-generation-unavailability",                    label: "Monthly_Unavailability"   },
  { slug: "supply-side/station-build-up-for-the-last-7-days",                             label: "Station_Build_Up"          },
  { slug: "renewables-performance/renewable-statistics",                                   label: "Renewables_Statistics"     },
  { slug: "ocgt-usage/total-monthly-ocgt-eskom-ipp-and-gt-energy-utilization",            label: "OCGT_Utilisation"          },
];

interface InfraRow {
  Date:             string;
  Station_Or_Type:  string;
  Metric:           string;
  Value:            string;
  Unit:             string;
  Source_File:      string;
}

async function findAllCsvUrls(slug: string): Promise<string[]> {
  const pageUrl = `${BASE}/${slug}/`;
  const buf = await downloadBuffer(pageUrl, 30000);
  const html = buf.toString("utf8");
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (href.endsWith(".csv") && href.includes("wp-content/uploads")) {
      if (!urls.includes(href)) urls.push(href);
    }
  });
  return urls;
}

/** Monthly_Eskom_generation_unavailability: YEAR_MONTH, PCLF, UCLF, OCLF */
function parseMonthlyUnavailability(raw: string, sourceFile: string): InfraRow[] {
  const rows: InfraRow[] = [];
  const lines = raw.trim().split(/\r?\n/).slice(1);
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 4) continue;
    const ymRaw = parts[0].trim().replace(/"/g, "");
    if (!/^\d{6}$/.test(ymRaw)) continue;
    const date = `${ymRaw.slice(0, 4)}-${ymRaw.slice(4, 6)}`;
    const metrics: [string, string][] = [
      ["PCLF_Pct", parts[1]],
      ["UCLF_Pct", parts[2]],
      ["OCLF_Pct", parts[3]],
    ];
    for (const [metric, raw] of metrics) {
      const value = parseFloat(raw.trim());
      if (isNaN(value)) continue;
      rows.push({ Date: date, Station_Or_Type: "National", Metric: metric, Value: value.toFixed(2), Unit: "%", Source_File: sourceFile });
    }
  }
  return rows;
}

/** Station_Build_Up: Date_Time_Hour_Beginning, Thermal_Gen, OCGT, Gas, Hydro, ... (many cols)
 *  Keep: date (day), Thermal_Gen, Nuclear, Pumped_Storage, Wind, PV, total
 */
function parseStationBuildUp(raw: string, sourceFile: string): InfraRow[] {
  const rows: InfraRow[] = [];
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length < 2) return rows;
  const header = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));

  // Find column indices for key generation types
  const colMap: Record<string, number> = {};
  for (let i = 0; i < header.length; i++) {
    const h = header[i].toLowerCase();
    if (h.includes("thermal_gen") && !h.includes("ocgt")) colMap["Thermal_Gen_MW"] = i;
    if (h.includes("nuclear"))          colMap["Nuclear_MW"] = i;
    if (h.includes("pumped_storage") && h.includes("generation")) colMap["Pumped_Storage_Gen_MW"] = i;
    if (h.includes("wind"))             colMap["Wind_MW"] = i;
    if (h.includes("photovoltaic") || h.includes("pv")) colMap["PV_MW"] = i;
    if (h.includes("international"))    colMap["International_MW"] = i;
    if (h.includes("ipp_pp"))           colMap["IPP_MW"] = i;
  }

  // Aggregate to daily averages (many hourly rows per day)
  const dailyMap = new Map<string, Map<string, number[]>>();
  for (const line of lines.slice(1)) {
    const parts = line.split(",");
    const dateRaw = parts[0]?.trim().replace(/"/g, "") ?? "";
    const dateMatch = dateRaw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) continue;
    const date = dateMatch[1];
    if (!dailyMap.has(date)) dailyMap.set(date, new Map());
    const dayMap = dailyMap.get(date)!;
    for (const [metric, col] of Object.entries(colMap)) {
      const v = parseFloat(parts[col]?.trim() ?? "");
      if (isNaN(v)) continue;
      if (!dayMap.has(metric)) dayMap.set(metric, []);
      dayMap.get(metric)!.push(v);
    }
  }

  for (const [date, metricMap] of dailyMap) {
    for (const [metric, values] of metricMap) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      rows.push({ Date: date, Station_Or_Type: "National", Metric: metric, Value: avg.toFixed(0), Unit: "MW", Source_File: sourceFile });
    }
  }
  return rows;
}

/** RE CSV dispatcher — routes to the right parser by filename */
function parseRenewables(raw: string, filename: string, sourceFile: string): InfraRow[] {
  const fn = filename.toLowerCase();
  if (fn.includes("current_installed"))     return parseREInstalledCapacity(raw, sourceFile);
  if (fn.includes("maximum_contribution"))  return parseREMaxContribution(raw, sourceFile);
  if (fn.includes("maximum_peak"))          return parseREPeakDiff(raw, sourceFile);
  if (fn.includes("annual_energy"))         return parseREAnnualEnergy(raw, sourceFile);
  return [];
}

/** RE_Current_Installed_Capacity: Date_Time_Hour_Beginning, Date, DateKey, Time, DateTimeKey, MW, Description, ... */
function parseREInstalledCapacity(raw: string, sourceFile: string): InfraRow[] {
  const rows: InfraRow[] = [];
  for (const line of raw.trim().split(/\r?\n/).slice(1)) {
    const parts = line.split(",");
    if (parts.length < 7) continue;
    const date = parts[2]?.trim().replace(/"/g, "") ?? ""; // DateKey = YYYY-MM-DD
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) continue;
    const value = parseFloat(parts[5]?.trim() ?? "");
    const tech = parts[6]?.trim().replace(/"/g, "") ?? "Unknown";
    if (isNaN(value)) continue;
    rows.push({ Date: date, Station_Or_Type: tech, Metric: "Installed_Capacity_MW", Value: value.toFixed(0), Unit: "MW", Source_File: sourceFile });
  }
  return rows;
}

/** RE_Maximum_Contribution: Fin_Year, Value, DESCR, MaximumDate, Title_Desc */
function parseREMaxContribution(raw: string, sourceFile: string): InfraRow[] {
  const rows: InfraRow[] = [];
  for (const line of raw.trim().split(/\r?\n/).slice(1)) {
    const parts = line.split(",");
    if (parts.length < 3) continue;
    const date = parts[0]?.trim().replace(/"/g, "").replace(/\s+/g, "") || "All_Time";
    const value = parseFloat(parts[1]?.trim() ?? "");
    const tech = parts[2]?.trim().replace(/"/g, "").trim() ?? "Unknown";
    if (isNaN(value) || !tech) continue;
    rows.push({ Date: date, Station_Or_Type: tech, Metric: "Max_Contribution_MW", Value: value.toFixed(0), Unit: "MW", Source_File: sourceFile });
  }
  return rows;
}

/** RE_Maximum_Peak_Difference: Cal Year, Max Date, Max Peak to Peak Difference */
function parseREPeakDiff(raw: string, sourceFile: string): InfraRow[] {
  const rows: InfraRow[] = [];
  for (const line of raw.trim().split(/\r?\n/).slice(1)) {
    const parts = line.split(",");
    if (parts.length < 3) continue;
    const date = parts[0]?.trim().replace(/"/g, "").replace(/\s+/g, "") || "All_Time";
    const value = parseFloat(parts[2]?.trim() ?? "");
    if (isNaN(value)) continue;
    rows.push({ Date: date, Station_Or_Type: "All_RE", Metric: "Max_Peak_Difference_MW", Value: value.toFixed(0), Unit: "MW", Source_File: sourceFile });
  }
  return rows;
}

/** RE_Annual_Energy_Contribution: Cal Year, Indicator, CSP, PV, Wind, Total RE */
function parseREAnnualEnergy(raw: string, sourceFile: string): InfraRow[] {
  const rows: InfraRow[] = [];
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length < 2) return rows;
  const header = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  for (const line of lines.slice(1)) {
    const parts = line.split(",");
    const date = parts[0]?.trim().replace(/"/g, "").replace(/\s+/g, "") || "";
    if (!date) continue;
    const indicator = parts[1]?.trim().replace(/"/g, "") ?? "Energy";
    for (let i = 2; i < header.length; i++) {
      const value = parseFloat(parts[i]?.trim() ?? "");
      if (isNaN(value)) continue;
      rows.push({ Date: date, Station_Or_Type: header[i] ?? `Col_${i}`, Metric: `Annual_${indicator.replace(/\s+/g,"_")}_MWh`, Value: value.toFixed(0), Unit: "MWh", Source_File: sourceFile });
    }
  }
  return rows;
}

/** OCGT: FIN_YEARS_DESCR, Legend_Descr, ESKOM_OCGT_IPP
 *  e.g. "202504 / 202604", "2025-26 Total (Eskom+IPP)", 462.2
 */
function parseOcgt(raw: string, sourceFile: string): InfraRow[] {
  const rows: InfraRow[] = [];
  const lines = raw.trim().split(/\r?\n/).slice(1);
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 3) continue;
    const dateRaw = parts[0]?.trim().replace(/"/g, "") ?? "";
    // "202504 / 202604" → use start month "2025-04"
    const dateMatch = dateRaw.match(/^(\d{4})(\d{2})/);
    if (!dateMatch) continue;
    const date = `${dateMatch[1]}-${dateMatch[2]}`;
    const legend = parts[1]?.trim().replace(/"/g, "") ?? "OCGT";
    const value = parseFloat(parts[2]?.trim() ?? "");
    if (isNaN(value)) continue;
    rows.push({
      Date: date,
      Station_Or_Type: "OCGT",
      Metric: `OCGT_Energy_GWh_${legend.replace(/[^A-Za-z0-9]/g, "_")}`,
      Value: value.toFixed(2),
      Unit: "GWh",
      Source_File: sourceFile,
    });
  }
  return rows;
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;

  try {
    const allRows: InfraRow[] = [];

    for (const { slug, label } of SOURCE_PAGES) {
      log.info(`  Scraping ${label}…`);
      let csvUrls: string[] = [];
      try {
        csvUrls = await findAllCsvUrls(slug);
      } catch (e) {
        log.warn(`  Failed to scrape ${slug}: ${e instanceof Error ? e.message : e}`);
        continue;
      }
      if (csvUrls.length === 0) { log.warn(`  No CSV links on ${slug}`); continue; }

      for (const csvUrl of csvUrls) {
        const fname = csvUrl.split("/").pop() ?? "";
        log.info(`  Downloading ${fname}`);
        try {
          const buf = await downloadBuffer(csvUrl, 60000);
          const raw = buf.toString("utf8");
          let parsed: InfraRow[] = [];

          if (fname.toLowerCase().includes("unavailability")) {
            parsed = parseMonthlyUnavailability(raw, label);
          } else if (fname.toLowerCase().includes("station_build")) {
            parsed = parseStationBuildUp(raw, label);
          } else if (fname.toLowerCase().startsWith("re_")) {
            parsed = parseRenewables(raw, fname, label);
          } else if (fname.toLowerCase().includes("ocgt")) {
            parsed = parseOcgt(raw, label);
          }

          log.info(`    ${fname}: ${parsed.length} rows`);
          allRows.push(...parsed);
        } catch (e) {
          log.warn(`    Failed ${fname}: ${e instanceof Error ? e.message : e}`);
        }
      }
    }

    if (allRows.length === 0) throw new Error("Parsed 0 rows — all Eskom infrastructure pages failed");

    allRows.sort((a, b) => b.Date.localeCompare(a.Date) || a.Metric.localeCompare(b.Metric));

    const historyPath = path.join(dataDir, `${spec.id}_history.csv`);
    writeCsv(historyPath, allRows as unknown as Record<string, unknown>[]);
    const rowCount = countCsvRows(historyPath);
    const rel = relPath(dataRoot, historyPath);
    log.info(`Wrote ${rowCount} rows → ${rel}`);

    return {
      id: spec.id, success: true, rowsWritten: rowCount,
      filesWritten: [rel], skipped: false, error: null, lastUpdated: today(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Failed: ${msg}`);
    return {
      id: spec.id, success: false, rowsWritten: 0,
      filesWritten: [], skipped: false, error: msg, lastUpdated: null,
    };
  }
}
