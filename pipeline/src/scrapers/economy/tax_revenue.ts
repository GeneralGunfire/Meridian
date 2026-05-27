/**
 * tax_revenue.ts — SARS Tax Statistics scraper
 *
 * Source: SARS Tax Statistics annual publication (sars.gov.za/tax-statistics/)
 * Each year publishes a Chapter 1 ZIP containing an Excel workbook.
 * Sheet "A1.3.1" has tax revenue by major category across fiscal years.
 *
 * Strategy: download each year's ZIP (2010–2025), parse A1.3.1, extract the
 * latest fiscal year row in that publication → one row per tax_type per year.
 * This avoids double-counting (each publication's bottom row = that year's final).
 *
 * Output columns: Fiscal_Year, Tax_Type, Amount_ZAR_Millions, YoY_Change_Pct, Share_of_Total_Pct
 */

import path from "path";
import AdmZip from "adm-zip";
import ExcelJS from "exceljs";
import "../../lib/http.js"; // TLS dispatcher
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

// ── URL table for Chapter 1 ZIPs (2010–2025) ──────────────────────────────────
// Confirmed live from sars.gov.za/about/sars-tax-and-customs-system/tax-statistics/
const CHAPTER1_URLS: { year: number; url: string }[] = [
  { year: 2025, url: "https://www.sars.gov.za/wp-content/uploads/2025taxstats/2025-Tax-Statistics-Chapter-1-Revenue-collections.zip" },
  { year: 2024, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2024/2024-Tax-Statistics-Chapter-1-Revenue-collections.zip" },
  { year: 2023, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2023/2023-Tax-Statistics-Chapter-1-Revenue-collections.zip" },
  { year: 2022, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2022/2022-Tax-Statistics-Chapter-1-Revenue-collections-STATIC.zip" },
  { year: 2021, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2021/2021-Tax-Statistics-Revenue-collections-Chapter-1.zip" },
  { year: 2020, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2020/2020-Tax-Statistics-Chapter-1-Revenue-collections.zip" },
  { year: 2019, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2019/2019-Tax-Statistics-Revenue-collections-Chapter-1-Final.zip" },
  { year: 2018, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2018/2018-Tax-Statistics-Revenue-collections.zip" },
  { year: 2017, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2017/2017-Tax-Statistics-Revenue-collections.zip" },
  { year: 2016, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2016/2016-Tax-Statistics-Chapter-1-Revenue-collections-Tables.zip" },
  { year: 2015, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2015/2015-Tax-Statistics-1-Revenue-Collections-Tables.zip" },
  { year: 2014, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2014/2014-Tax-Statistics-Chapter-1-Revenue-CollectionsTables.zip" },
  { year: 2013, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2013/2013-Tax-Statistics-1-Revenue-collections_tables.zip" },
  { year: 2012, url: "https://www.sars.gov.za/wp-content/uploads/Supp/Reports/SARS-Stats-2012-03-Tax-Statistics-Overview-of-revenue-collections.zip" },
  { year: 2011, url: "https://www.sars.gov.za/wp-content/uploads/Supp/Reports/SARS-Stats-2011-03-Tax-Statistics-Overview-of-revenue-collections.zip" },
  { year: 2010, url: "https://www.sars.gov.za/wp-content/uploads/Supp/Reports/SARS-Stats-2010-03-Tax-Statistics-Overview-of-revenue-collections.zip" },
];

// Tax category columns in A1.3.1 (confirmed from 2025 & 2020 peeks)
// col3=fiscal_year label, col4=income&profits, col5=payroll, col6=property,
// col7=domestic goods/services, col8=international trade, col9=misc, col10=total
const TAX_CATEGORIES: { col: number; label: string }[] = [
  { col: 4,  label: "Taxes on income and profits" },
  { col: 5,  label: "Taxes on payroll and workforce" },
  { col: 6,  label: "Taxes on property" },
  { col: 7,  label: "Domestic taxes on goods and services" },
  { col: 8,  label: "Taxes on international trade and transactions" },
  { col: 9,  label: "State miscellaneous revenue" },
  { col: 10, label: "Total tax revenue" },
];

interface TaxRow {
  Fiscal_Year: string;
  Tax_Type: string;
  Amount_ZAR_Millions: string;
  YoY_Change_Pct: string;
  Share_of_Total_Pct: string;
}

function cellNum(v: ExcelJS.CellValue): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "object" && "result" in v) {
    const r = (v as { result: unknown }).result;
    return typeof r === "number" ? r : null;
  }
  return typeof v === "number" ? v : null;
}

function cellStr(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && "result" in v) return String((v as { result: unknown }).result ?? "");
  return String(v);
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Meridian-Pipeline/1.0" },
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Parse one year's ZIP. Returns an array of TaxRow (one per tax category)
 * representing the *most recent* fiscal year row in that publication.
 * Returns empty array on failure (caller logs and continues).
 */
async function parseYearZip(
  pubYear: number,
  url: string,
  log: { info: (m: string) => void; warn: (m: string) => void }
): Promise<TaxRow[]> {
  const buf = await downloadBuffer(url);
  const zip = new AdmZip(buf);
  const xlsxEntry = zip.getEntries().find(
    (e) => e.entryName.endsWith(".xlsx") || e.entryName.endsWith(".xls")
  );
  if (!xlsxEntry) throw new Error(`No Excel in ZIP for ${pubYear}`);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(xlsxEntry.getData());

  // Try A1.3.1 first (modern layout), fall back to first non-CONTENTS sheet
  let ws = wb.getWorksheet("A1.3.1");
  if (!ws) {
    // Older publications (2010-2012) may have different sheet names
    ws = wb.worksheets.find((s) => s.name !== "CONTENTS") ?? wb.worksheets[0];
    if (!ws) throw new Error(`No usable sheet in ZIP for ${pubYear}`);
    log.warn(`${pubYear}: A1.3.1 not found, using sheet "${ws.name}"`);
  }

  // Find data rows: look for rows where col3 matches a fiscal-year pattern like "YYYY/YY"
  // and col4 is a large positive number (revenue in R millions)
  const dataRows: { fiscalYear: string; rowIdx: number }[] = [];
  for (let r = 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const col3 = cellStr(row.getCell(3).value);
    const col4 = cellNum(row.getCell(4).value);
    // Fiscal year label pattern: "2024/25", "2019/20", etc.
    if (/^\d{4}\/\d{2}$/.test(col3.trim()) && col4 !== null && col4 > 1000) {
      dataRows.push({ fiscalYear: col3.trim(), rowIdx: r });
    }
  }

  if (dataRows.length === 0) {
    throw new Error(`No data rows found in A1.3.1 for ${pubYear}`);
  }

  // The most recent fiscal year = last data row before "Percentage of total" section
  // Take the last dataRow that has amount > 1000 in the income col
  const latestDataRow = dataRows[dataRows.length - 1];
  const dataRowIdx = latestDataRow.rowIdx;
  const fiscalYear = latestDataRow.fiscalYear;

  // Find YoY and share rows for the same fiscal year
  const yoyRow = findSectionRow(ws, "Percentage change year-on-year", fiscalYear);
  const shareRow = findSectionRow(ws, "Percentage of total", fiscalYear);

  const row = ws.getRow(dataRowIdx);
  const rows: TaxRow[] = [];

  for (const { col, label } of TAX_CATEGORIES) {
    const amount = cellNum(row.getCell(col).value);
    if (amount === null) continue;

    const yoy = yoyRow ? cellNum(ws.getRow(yoyRow).getCell(col).value) : null;
    const share = shareRow ? cellNum(ws.getRow(shareRow).getCell(col).value) : null;

    rows.push({
      Fiscal_Year: fiscalYear,
      Tax_Type: label,
      Amount_ZAR_Millions: amount.toFixed(2),
      YoY_Change_Pct: yoy !== null ? (yoy * 100).toFixed(2) : "",
      Share_of_Total_Pct: share !== null ? (share * 100).toFixed(2) : "",
    });
  }

  log.info(`  ${pubYear}: fiscal year ${fiscalYear} → ${rows.length} tax categories`);
  return rows;
}

/** Find row index where col3 matches fiscalYear, after a section header in col3 containing sectionText */
function findSectionRow(
  ws: ExcelJS.Worksheet,
  sectionText: string,
  fiscalYear: string
): number | null {
  let inSection = false;
  for (let r = 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    // Section headers sit in col3 (confirmed from layout peek)
    const col3 = cellStr(row.getCell(3).value).trim();
    if (col3.toLowerCase().includes(sectionText.toLowerCase())) {
      inSection = true;
      continue;
    }
    if (inSection && col3 === fiscalYear) return r;
    // Stop if we hit another "Percentage" section header (next section started)
    if (inSection && col3.toLowerCase().startsWith("percentage") &&
        !col3.toLowerCase().includes(sectionText.toLowerCase())) {
      inSection = false;
    }
  }
  return null;
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;

  try {
    const historyPath = path.join(dataDir, `${spec.id}_history.csv`);
    const allRows: TaxRow[] = [];
    const seen = new Set<string>(); // deduplicate by fiscal_year + tax_type

    // Download all years in sequence (not parallel — SARS server is rate-sensitive)
    for (const { year, url } of CHAPTER1_URLS) {
      try {
        log.info(`Fetching ${year} from ${url.split("/").pop()}`);
        const rows = await parseYearZip(year, url, log);
        for (const row of rows) {
          const key = `${row.Fiscal_Year}|${row.Tax_Type}`;
          if (!seen.has(key)) {
            seen.add(key);
            allRows.push(row);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        log.warn(`  ${year}: skipped — ${msg}`);
      }
    }

    if (allRows.length === 0) {
      throw new Error("Parsed 0 rows across all years — all ZIPs failed");
    }

    // Sort: most recent fiscal year first, then by tax type
    allRows.sort((a, b) =>
      b.Fiscal_Year.localeCompare(a.Fiscal_Year) ||
      a.Tax_Type.localeCompare(b.Tax_Type)
    );

    writeCsv(historyPath, allRows as unknown as Record<string, unknown>[]);
    const rowCount = countCsvRows(historyPath);
    const rel = relPath(dataRoot, historyPath);
    log.info(`Wrote ${rowCount} rows → ${rel}`);

    return {
      id: spec.id,
      success: true,
      rowsWritten: rowCount,
      filesWritten: [rel],
      skipped: false,
      error: null,
      lastUpdated: today(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Failed: ${msg}`);
    return {
      id: spec.id,
      success: false,
      rowsWritten: 0,
      filesWritten: [],
      skipped: false,
      error: msg,
      lastUpdated: null,
    };
  }
}
