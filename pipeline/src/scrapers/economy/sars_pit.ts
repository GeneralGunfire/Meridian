/**
 * sars_pit.ts — SARS Personal Income Tax (PIT) detailed scraper
 *
 * Source: SARS Tax Statistics Chapter 2 (annual ZIP publication)
 * URL pattern: https://www.sars.gov.za/wp-content/uploads/...Chapter-2-Personal-Income-Tax.zip
 *
 * Sheets extracted:
 *   2.5  — Summary: taxpayer count, taxable income, tax assessed (2021–2024)
 *   2.6  — Income distribution by taxable income group (%, 2021–2024)
 *   2.10 — By province: taxpayers, taxable income, tax assessed (2023–2024)
 *   A2.1.1 — Detailed taxable income groups with counts (2021–2024)
 *
 * Output: Fiscal_Year, Category, Sub_Category, Metric, Value, Unit
 */

import path from "path";
import AdmZip from "adm-zip";
import ExcelJS from "exceljs";
import { downloadBuffer } from "../../lib/http.js";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

// Chapter 2 ZIPs — most recent first; each publication covers last 4 years
const CHAPTER2_URLS: { year: number; url: string }[] = [
  { year: 2025, url: "https://www.sars.gov.za/wp-content/uploads/2025taxstats/2025-Tax-Statistics-Chapter-2-Personal-Income-Tax.zip" },
  { year: 2024, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2024/2024-Tax-Statistics-Chapter-2-PIT.zip" },
  { year: 2023, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2023/2023-Tax-Statistics-Chapter-2-Personal-Income-Tax-PIT.zip" },
  { year: 2022, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2022/2022-Tax-Statistics-Chapter-2-PIT-STATIC.zip" },
  { year: 2021, url: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2021/2021-Tax-Statistics-Personal-Income-Tax-Chapter-2.zip" },
];

interface PitRow {
  Tax_Year:     string;
  Category:     string;
  Sub_Category: string;
  Metric:       string;
  Value:        string;
  Unit:         string;
}

function cellNum(v: ExcelJS.CellValue): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  if (typeof v === "object" && "result" in v) {
    const r = (v as { result: unknown }).result;
    if (typeof r === "number") return r;
  }
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? null : n;
}
function cellStr(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && "result" in v) return String((v as { result: unknown }).result ?? "");
  if (typeof v === "object" && "richText" in v) return (v as { richText: {text:string}[] }).richText.map(r=>r.text).join("").trim();
  return String(v).trim();
}

/** Sheet 2.5 — Summary totals: count, taxable income, tax assessed by tax year
 *  Layout: col1=empty, col2=label, col3=TaxYear, col4=Count, col5=TaxableIncome, col6=AvgIncome, col7=TaxAssessed
 *  Data starts R3
 */
function parse25(ws: ExcelJS.Worksheet): PitRow[] {
  const rows: PitRow[] = [];
  for (let r = 3; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const yr = cellStr(row.getCell(3).value);
    if (!yr.match(/^\d{4}$/)) continue;
    const count   = cellNum(row.getCell(4).value);
    const income  = cellNum(row.getCell(5).value);
    const tax     = cellNum(row.getCell(7).value);
    if (count !== null)  rows.push({ Tax_Year: yr, Category: "Summary", Sub_Category: "All_Taxpayers", Metric: "Taxpayer_Count",                Value: count.toFixed(0),  Unit: "count" });
    if (income !== null) rows.push({ Tax_Year: yr, Category: "Summary", Sub_Category: "All_Taxpayers", Metric: "Taxable_Income_ZAR_Millions",   Value: income.toFixed(2), Unit: "ZAR_millions" });
    if (tax !== null)    rows.push({ Tax_Year: yr, Category: "Summary", Sub_Category: "All_Taxpayers", Metric: "Tax_Assessed_ZAR_Millions",     Value: tax.toFixed(2),    Unit: "ZAR_millions" });
  }
  return rows;
}

/** Sheet 2.10 — By province: taxpayer count + taxable income + tax assessed
 *  Layout: col1=empty, col2=Province, col3..=data (2 years × 4 metrics each)
 *  Row 2: year labels; data starts R7
 */
function parse210(ws: ExcelJS.Worksheet): PitRow[] {
  const rows: PitRow[] = [];
  const yearRow = ws.getRow(2);
  const years: string[] = [];
  for (let c = 3; c <= 20; c++) {
    const v = cellStr(yearRow.getCell(c).value);
    if (v.match(/^\d{4}$/)) { if (!years.includes(v)) years.push(v); }
  }
  const yearCols: { year: string; countCol: number }[] = [];
  let colCursor = 3;
  for (const year of years) {
    yearCols.push({ year, countCol: colCursor });
    colCursor += 4;
  }
  for (let r = 7; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const province = cellStr(row.getCell(2).value);
    if (!province || province.toLowerCase().includes("total") || province.toLowerCase().includes("unknown") || !province.match(/[A-Za-z]/)) continue;
    for (const { year, countCol } of yearCols) {
      const count  = cellNum(row.getCell(countCol).value);
      const income = cellNum(row.getCell(countCol + 1).value);
      const tax    = cellNum(row.getCell(countCol + 2).value);
      if (count !== null)  rows.push({ Tax_Year: year, Category: "By_Province", Sub_Category: province, Metric: "Taxpayer_Count",                Value: count.toFixed(0),  Unit: "count" });
      if (income !== null) rows.push({ Tax_Year: year, Category: "By_Province", Sub_Category: province, Metric: "Taxable_Income_ZAR_Millions",   Value: income.toFixed(2), Unit: "ZAR_millions" });
      if (tax !== null)    rows.push({ Tax_Year: year, Category: "By_Province", Sub_Category: province, Metric: "Tax_Assessed_ZAR_Millions",     Value: tax.toFixed(2),    Unit: "ZAR_millions" });
    }
  }
  return rows;
}

async function processYear(yearPub: number, url: string, log: { info: (m:string)=>void; warn: (m:string)=>void }): Promise<PitRow[]> {
  const rows: PitRow[] = [];
  try {
    log.info(`  ${yearPub}: downloading…`);
    const buf = await downloadBuffer(url, 120000);
    const zip = new AdmZip(buf);
    const xlsxEntry = zip.getEntries().find(e => e.entryName.endsWith(".xlsx"));
    if (!xlsxEntry) { log.warn(`  ${yearPub}: no xlsx in zip`); return rows; }
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(xlsxEntry.getData());

    const ws25  = wb.getWorksheet("2.5");
    const ws210 = wb.getWorksheet("2.10");

    if (ws25)  rows.push(...parse25(ws25));
    if (ws210) rows.push(...parse210(ws210));

    log.info(`  ${yearPub}: ${rows.length} rows`);
  } catch (e) {
    log.warn(`  ${yearPub}: ${e instanceof Error ? e.message : String(e)}`);
  }
  return rows;
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;
  try {
    log.info("Downloading SARS PIT Chapter 2 (most recent publication)…");
    // Use only the most recent publication — it contains last 4 tax years
    const { year, url } = CHAPTER2_URLS[0];
    const allRows = await processYear(year, url, log);

    if (allRows.length === 0) throw new Error("Parsed 0 PIT rows — layout may have changed");

    // Deduplicate by key
    const seen = new Set<string>();
    const deduped = allRows.filter(r => {
      const k = `${r.Tax_Year}|${r.Category}|${r.Sub_Category}|${r.Metric}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });

    deduped.sort((a, b) =>
      b.Tax_Year.localeCompare(a.Tax_Year) ||
      a.Category.localeCompare(b.Category) ||
      a.Sub_Category.localeCompare(b.Sub_Category) ||
      a.Metric.localeCompare(b.Metric)
    );

    const historyPath = path.join(dataDir, `${spec.id}_history.csv`);
    writeCsv(historyPath, deduped as unknown as Record<string, unknown>[]);
    const rowCount = countCsvRows(historyPath);
    const rel = relPath(dataRoot, historyPath);
    log.info(`Wrote ${rowCount} rows → ${rel}`);

    return { id: spec.id, success: true, rowsWritten: rowCount, filesWritten: [rel], skipped: false, error: null, lastUpdated: today() };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Failed: ${msg}`);
    return { id: spec.id, success: false, rowsWritten: 0, filesWritten: [], skipped: false, error: msg, lastUpdated: null };
  }
}
