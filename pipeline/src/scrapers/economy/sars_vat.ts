/**
 * sars_vat.ts — SARS VAT + Company Income Tax (CIT) scraper
 *
 * Source: SARS Tax Statistics Chapters 3 & 4 (annual ZIP publications)
 *
 * Chapter 3 — Company Income Tax:
 *   Sheet 3.1: Provisional tax payments by year (R millions)
 *   Sheet 3.5: Total CIT assessed vs payments (R millions, by tax year)
 *
 * Chapter 4 — Value Added Tax:
 *   Sheet 4.1: Registered VAT vendors (count + active count, by fiscal year)
 *   Sheet 4.2: Import VAT collections (R millions, by fiscal year)
 *
 * Output: Fiscal_Year, Tax_Type, Category, Metric, Value, Unit
 */

import path from "path";
import AdmZip from "adm-zip";
import ExcelJS from "exceljs";
import { downloadBuffer } from "../../lib/http.js";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

const URLS = {
  cit2025: "https://www.sars.gov.za/wp-content/uploads/2025taxstats/2025-Tax-Statistics-Chapter-3-Company-Income-tax.zip",
  vat2025: "https://www.sars.gov.za/wp-content/uploads/2025taxstats/2025-Tax-Statistics-Chapter-4-Value-Added-Tax-1.zip",
  cit2024: "https://www.sars.gov.za/wp-content/uploads/Docs/TaxStats/2024/2024-Tax-Statistics-Chapter-4-VAT.zip",
};

interface VatRow {
  Fiscal_Year: string;
  Tax_Type:    string;
  Category:    string;
  Metric:      string;
  Value:       string;
  Unit:        string;
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
  if (typeof v === "object" && "richText" in v) return (v as { richText: {text:string}[] }).richText.map(r=>r.text).join("").trim();
  if (typeof v === "object" && "result" in v) return String((v as { result: unknown }).result ?? "");
  return String(v).trim();
}

/** CIT Sheet 3.5 — Provisional tax payments & assessed tax by tax year
 *  Layout: col1=empty, col2=label, col3=TaxYear, col4=Payments, col5=Assessed
 */
function parseCIT35(ws: ExcelJS.Worksheet): VatRow[] {
  const rows: VatRow[] = [];
  for (let r = 4; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const yr = cellStr(row.getCell(3).value);
    if (!yr.match(/^\d{4}$/)) continue;
    const payments = cellNum(row.getCell(4).value);
    const assessed = cellNum(row.getCell(5).value);
    if (payments !== null) rows.push({ Fiscal_Year: yr, Tax_Type: "CIT", Category: "Company_Income_Tax", Metric: "Provisional_Tax_Payments_ZAR_Millions", Value: payments.toFixed(2), Unit: "ZAR_millions" });
    if (assessed !== null) rows.push({ Fiscal_Year: yr, Tax_Type: "CIT", Category: "Company_Income_Tax", Metric: "Tax_Assessed_ZAR_Millions",              Value: assessed.toFixed(2), Unit: "ZAR_millions" });
  }
  return rows;
}

/** CIT Sheet 3.1 — Provisional payments by period (1st, 2nd, 3rd)
 *  Layout: col1=empty, col2=label, col3=TaxYear, col4=1st, col5=pct, col6=2nd, col7=pct, col8=3rd
 */
function parseCIT31(ws: ExcelJS.Worksheet): VatRow[] {
  const rows: VatRow[] = [];
  for (let r = 5; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const yr = cellStr(row.getCell(3).value);
    if (!yr.match(/^\d{4}$/)) continue;
    const p1 = cellNum(row.getCell(4).value);
    const p2 = cellNum(row.getCell(6).value);
    const p3 = cellNum(row.getCell(8).value);
    if (p1 !== null) rows.push({ Fiscal_Year: yr, Tax_Type: "CIT", Category: "Provisional_Payments", Metric: "First_Period_ZAR_Millions",  Value: p1.toFixed(2), Unit: "ZAR_millions" });
    if (p2 !== null) rows.push({ Fiscal_Year: yr, Tax_Type: "CIT", Category: "Provisional_Payments", Metric: "Second_Period_ZAR_Millions", Value: p2.toFixed(2), Unit: "ZAR_millions" });
    if (p3 !== null) rows.push({ Fiscal_Year: yr, Tax_Type: "CIT", Category: "Provisional_Payments", Metric: "Third_Period_ZAR_Millions",  Value: p3.toFixed(2), Unit: "ZAR_millions" });
  }
  return rows;
}

/** VAT Sheet 4.1 — Registered vendors count by fiscal year
 *  Layout: col1=empty, col2=label, col3=FiscalYear, col4=Registered, col5=pct, col6=Active
 */
function parseVAT41(ws: ExcelJS.Worksheet): VatRow[] {
  const rows: VatRow[] = [];
  for (let r = 4; r <= Math.min(ws.rowCount, 30); r++) {
    const row = ws.getRow(r);
    const yr = cellStr(row.getCell(3).value);
    if (!yr.match(/^\d{4}\/\d{2}$/)) continue;
    const registered = cellNum(row.getCell(4).value);
    const active     = cellNum(row.getCell(6).value);
    if (registered !== null) rows.push({ Fiscal_Year: yr, Tax_Type: "VAT", Category: "Vendors", Metric: "Registered_Vendors_Count", Value: registered.toFixed(0), Unit: "count" });
    if (active !== null)     rows.push({ Fiscal_Year: yr, Tax_Type: "VAT", Category: "Vendors", Metric: "Active_Vendors_Count",     Value: active.toFixed(0),     Unit: "count" });
  }
  return rows;
}

/** VAT Sheet 4.2 — Import VAT collections
 *  Layout: col1=empty, col2=label, col3=FiscalYear, col4=ImportVATPerBills, col5=ActualImportVAT
 */
function parseVAT42(ws: ExcelJS.Worksheet): VatRow[] {
  const rows: VatRow[] = [];
  for (let r = 3; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const yr = cellStr(row.getCell(3).value);
    if (!yr.match(/^\d{4}\/\d{2}$/)) continue;
    const importVat = cellNum(row.getCell(5).value);
    if (importVat !== null) rows.push({ Fiscal_Year: yr, Tax_Type: "VAT", Category: "Import_VAT", Metric: "Collections_ZAR_Millions", Value: importVat.toFixed(2), Unit: "ZAR_millions" });
  }
  return rows;
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;
  try {
    const allRows: VatRow[] = [];

    // CIT Chapter 3
    log.info("Downloading SARS Chapter 3 (CIT)…");
    try {
      const buf = await downloadBuffer(URLS.cit2025, 120000);
      const zip = new AdmZip(buf);
      const xlsxEntry = zip.getEntries().find(e => e.entryName.endsWith(".xlsx"));
      if (xlsxEntry) {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(xlsxEntry.getData());
        const ws31 = wb.getWorksheet("3.1");
        const ws35 = wb.getWorksheet("3.5");
        if (ws31) { const r = parseCIT31(ws31); log.info(`  CIT 3.1: ${r.length} rows`); allRows.push(...r); }
        if (ws35) { const r = parseCIT35(ws35); log.info(`  CIT 3.5: ${r.length} rows`); allRows.push(...r); }
      }
    } catch (e) { log.warn(`  CIT failed: ${e instanceof Error ? e.message : e}`); }

    // VAT Chapter 4
    log.info("Downloading SARS Chapter 4 (VAT)…");
    try {
      const buf = await downloadBuffer(URLS.vat2025, 120000);
      const zip = new AdmZip(buf);
      const xlsxEntry = zip.getEntries().find(e => e.entryName.endsWith(".xlsx"));
      if (xlsxEntry) {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(xlsxEntry.getData());
        const ws41 = wb.getWorksheet("4.1");
        const ws42 = wb.getWorksheet("4.2");
        if (ws41) { const r = parseVAT41(ws41); log.info(`  VAT 4.1: ${r.length} rows`); allRows.push(...r); }
        if (ws42) { const r = parseVAT42(ws42); log.info(`  VAT 4.2: ${r.length} rows`); allRows.push(...r); }
      }
    } catch (e) { log.warn(`  VAT failed: ${e instanceof Error ? e.message : e}`); }

    if (allRows.length === 0) throw new Error("Parsed 0 rows from CIT + VAT chapters");

    const seen = new Set<string>();
    const deduped = allRows.filter(r => {
      const k = `${r.Fiscal_Year}|${r.Tax_Type}|${r.Category}|${r.Metric}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });

    deduped.sort((a, b) =>
      b.Fiscal_Year.localeCompare(a.Fiscal_Year) ||
      a.Tax_Type.localeCompare(b.Tax_Type) ||
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
