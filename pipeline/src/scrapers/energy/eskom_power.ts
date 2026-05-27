/**
 * eskom_power.ts — Eskom power supply & demand scraper
 *
 * Source: Eskom Data Portal (www.eskom.co.za/dataportal)
 * Method: cheerio page scrape → direct CSV download (no Playwright needed)
 *
 * Pages scraped (each embeds a Power BI visual + a direct CSV download link):
 *   /demand-side/weekly-energy-demand/          → Weekly_Energy_Demand_Financial_Year.csv
 *   /demand-side/weekly-peak-demand/            → Weekly_Peak_Demand_Financial_Year.csv
 *   /outage-performance/weekly-unplanned-outages/ → Weekly_unplanned_outages.csv
 *   /outage-performance/monthly-eskom-generation-capacity-breakdown/ → Monthly_Eskom_generation_capacity_breakdown.csv
 *
 * CSV URL pattern: wp-content/uploads/YYYY/MM/<filename>.csv
 * — the year/month prefix rotates monthly, so we scrape the page to find it.
 *
 * Output (long format): Date, Metric, Value, Unit, Source_File
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
  { slug: "demand-side/weekly-energy-demand",                                    label: "Weekly_Energy_Demand"       },
  { slug: "demand-side/weekly-peak-demand",                                      label: "Weekly_Peak_Demand"         },
  { slug: "outage-performance/weekly-unplanned-outages",                         label: "Weekly_Unplanned_Outages"   },
  { slug: "outage-performance/monthly-eskom-generation-capacity-breakdown",      label: "Monthly_Capacity_Breakdown" },
];

interface PowerRow {
  Date:        string;
  Metric:      string;
  Value:       string;
  Unit:        string;
  Source_File: string;
}

/** Scrape a portal page and return the first .csv href found */
async function findCsvUrl(slug: string): Promise<string | null> {
  const pageUrl = `${BASE}/${slug}/`;
  const buf = await downloadBuffer(pageUrl, 30000);
  const html = buf.toString("utf8");
  const $ = cheerio.load(html);
  let csvUrl: string | null = null;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (href.endsWith(".csv") && href.includes("wp-content/uploads")) {
      csvUrl = href;
      return false; // break
    }
  });
  return csvUrl;
}

/** Parse Weekly_Energy_Demand / Weekly_Peak_Demand CSVs
 *  Columns: WeekStartDate, Forecast_Or_Actual_Value, Forecast_Or_Actual_Value_Legend
 */
function parseWeeklyDemand(raw: string, sourceFile: string): PowerRow[] {
  const rows: PowerRow[] = [];
  const lines = raw.trim().split(/\r?\n/).slice(1); // skip header
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 3) continue;
    const dateRaw = parts[0].trim().replace(/"/g, "");
    const valueRaw = parts[1].trim().replace(/"/g, "");
    const legend = parts.slice(2).join(",").trim().replace(/"/g, "");
    if (!valueRaw || !dateRaw) continue;
    const value = parseFloat(valueRaw);
    if (isNaN(value)) continue;
    // Normalise date: "28-Dec-2026" → "2026-12-28", "2026-03-30 12:00:00 AM" → "2026-03-30"
    const date = normaliseDate(dateRaw);
    if (!date) continue;
    rows.push({
      Date:        date,
      Metric:      legend || sourceFile,
      Value:       value.toFixed(2),
      Unit:        sourceFile.includes("Energy") ? "GWh" : "MW",
      Source_File: sourceFile,
    });
  }
  return rows;
}

/** Parse Weekly_unplanned_outages CSV
 *  Columns: Week_min_DateKey, Min of UCLF+OCLF, Average of UCLF+OCLF, Max of UCLF+OCLF
 */
function parseWeeklyOutages(raw: string, sourceFile: string): PowerRow[] {
  const rows: PowerRow[] = [];
  const lines = raw.trim().split(/\r?\n/).slice(1);
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 4) continue;
    const date = normaliseDate(parts[0].trim().replace(/"/g, ""));
    if (!date) continue;
    const metrics: [string, string][] = [
      ["Unplanned_Outages_Min_MW",  parts[1]],
      ["Unplanned_Outages_Avg_MW",  parts[2]],
      ["Unplanned_Outages_Max_MW",  parts[3]],
    ];
    for (const [metric, raw] of metrics) {
      const value = parseFloat(raw.trim());
      if (isNaN(value)) continue;
      rows.push({ Date: date, Metric: metric, Value: value.toFixed(0), Unit: "MW", Source_File: sourceFile });
    }
  }
  return rows;
}

/** Parse Monthly_Eskom_generation_capacity_breakdown CSV
 *  Columns: YEAR_MONTH, EAF, PCLF, UCLF, OCLF  (values in %)
 */
function parseMonthlyCapacity(raw: string, sourceFile: string): PowerRow[] {
  const rows: PowerRow[] = [];
  const lines = raw.trim().split(/\r?\n/).slice(1);
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 5) continue;
    const ymRaw = parts[0].trim().replace(/"/g, ""); // e.g. "202503"
    if (!/^\d{6}$/.test(ymRaw)) continue;
    const year = ymRaw.slice(0, 4);
    const month = ymRaw.slice(4, 6);
    const date = `${year}-${month}`;
    const metrics: [string, string][] = [
      ["EAF_Pct",  parts[1]],
      ["PCLF_Pct", parts[2]],
      ["UCLF_Pct", parts[3]],
      ["OCLF_Pct", parts[4]],
    ];
    for (const [metric, raw] of metrics) {
      const value = parseFloat(raw.trim());
      if (isNaN(value)) continue;
      rows.push({ Date: date, Metric: metric, Value: value.toFixed(2), Unit: "%", Source_File: sourceFile });
    }
  }
  return rows;
}

function normaliseDate(raw: string): string | null {
  raw = raw.trim();
  // "2026-03-30 12:00:00 AM" → "2026-03-30"
  const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  // "28-Dec-2026" → "2026-12-28"
  const dmyMatch = raw.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dmyMatch) {
    const months: Record<string, string> = {
      Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",
      Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12",
    };
    const m = months[dmyMatch[2]];
    if (!m) return null;
    return `${dmyMatch[3]}-${m}-${dmyMatch[1].padStart(2,"0")}`;
  }
  return null;
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;

  try {
    const allRows: PowerRow[] = [];

    for (const { slug, label } of SOURCE_PAGES) {
      log.info(`  Scraping ${label}…`);
      let csvUrl: string | null = null;
      try {
        csvUrl = await findCsvUrl(slug);
      } catch (e) {
        log.warn(`  Failed to scrape ${slug}: ${e instanceof Error ? e.message : e}`);
        continue;
      }
      if (!csvUrl) { log.warn(`  No CSV link found on ${slug}`); continue; }

      log.info(`  Downloading ${csvUrl.split("/").pop()}`);
      const buf = await downloadBuffer(csvUrl, 60000);
      const raw = buf.toString("utf8");

      let parsed: PowerRow[] = [];
      const fname = csvUrl.split("/").pop() ?? "";
      if (fname.toLowerCase().includes("unplanned")) {
        parsed = parseWeeklyOutages(raw, label);
      } else if (fname.toLowerCase().includes("capacity_breakdown")) {
        parsed = parseMonthlyCapacity(raw, label);
      } else {
        parsed = parseWeeklyDemand(raw, label);
      }

      log.info(`  ${label}: ${parsed.length} rows`);
      allRows.push(...parsed);
    }

    if (allRows.length === 0) throw new Error("Parsed 0 rows — all Eskom pages failed");

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
