/**
 * budget_spending.ts — National Treasury ENE (Estimates of National Expenditure) scraper
 *
 * Source: National Treasury budget documents (treasury.gov.za)
 * URL pattern: https://www.treasury.gov.za/documents/national budget/<year>/ene/ENE Summary tables.zip
 *
 * Files extracted:
 *   ENE Summary.xlsx — "Table 1" (main budget framework) + "Table 2" (expenditure by vote/department)
 *                    + "Table 3" (expenditure by economic classification)
 *
 * Years scraped: 2019–2025 (each publication covers audited + medium-term estimates for ~7 years)
 * Strategy: pull the most recent ENE zip (2025), which contains audited outcomes back to 2021/22
 *           and medium-term estimates through 2027/28.
 *
 * Output (long format): Fiscal_Year, Category, Department, Metric, Value_ZAR_Millions, Type
 *   Type: "Audited_Outcome" | "Revised_Estimate" | "MTEF_Estimate" | "Appropriation"
 *
 * Fiscal year format: "2024/25" (SA convention matching Treasury documents)
 */

import path from "path";
import AdmZip from "adm-zip";
import ExcelJS from "exceljs";
import { downloadBuffer } from "../../lib/http.js";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

const BASE = "https://www.treasury.gov.za/documents/national%20budget";

// Pull multiple years — each covers a 7-year window; combining gives depth back to 2015/16
// 2025 ENE ZIP not yet available at predictable URL (redirects to homepage);
// 2024 already covers 2020/21–2026/27 audited + MTEF estimates.
// 2021 often times out; 2020 rarely adds new data beyond 2022 coverage.
const ENE_URLS: { pubYear: number; url: string }[] = [
  { pubYear: 2024, url: `${BASE}/2024/ene/ENE%20Summary%20tables.zip` },
  { pubYear: 2023, url: `${BASE}/2023/ene/ENE%20Summary%20tables.zip` },
  { pubYear: 2022, url: `${BASE}/2022/ene/ENE%20Summary%20tables.zip` },
];

interface BudgetRow {
  Fiscal_Year:        string;
  Category:           string;
  Department:         string;
  Metric:             string;
  Value_ZAR_Millions: string;
  Type:               string;
  Pub_Year:           string;
}

function cellNum(v: ExcelJS.CellValue): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return isNaN(v) ? null : v;
  if (typeof v === "object" && "result" in v) {
    const r = (v as { result: unknown }).result;
    if (typeof r === "number") return isNaN(r) ? null : r;
  }
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

function cellStr(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && "richText" in v)
    return (v as { richText: { text: string }[] }).richText.map(r => r.text).join("").replace(/\n/g, " ").trim();
  if (typeof v === "object" && "result" in v) return String((v as { result: unknown }).result ?? "").replace(/\n/g, " ").trim();
  return String(v).replace(/\n/g, " ").trim();
}

/**
 * Detect which row holds the fiscal year labels (e.g. "2020/21").
 * 2024 publication: type headers on row 4, years on row 5.
 * 2022/2023 publication: type headers on rows 2-3, years on row 4.
 */
function detectYearRow(ws: ExcelJS.Worksheet): { typeRow: number; yearRow: number } {
  // Scan rows 3–10 to find first row containing a fiscal year label (e.g. "2020/21")
  for (let yearRow = 3; yearRow <= 10; yearRow++) {
    const row = ws.getRow(yearRow);
    for (let c = 1; c <= 20; c++) {
      if (cellStr(row.getCell(c).value).match(/^\d{4}\/\d{2}$/)) {
        return { typeRow: yearRow - 1, yearRow };
      }
    }
  }
  return { typeRow: 4, yearRow: 5 }; // fallback
}

/** Determine column type label from the header rows */
function buildYearMap(ws: ExcelJS.Worksheet): { col: number; year: string; type: string; labelCol: number; dataStartRow: number } {
  const { typeRow: typeRowNum, yearRow: yearRowNum } = detectYearRow(ws);

  // For older format (2022/2023): type spans rows typeRowNum-1 and typeRowNum (two-row header)
  // Merge type text from both rows for robustness
  const typeRow  = ws.getRow(typeRowNum);
  const typeRow2 = ws.getRow(typeRowNum - 1);
  const yearRow  = ws.getRow(yearRowNum);

  // Label column: in 2024 format it's col2; in 2023 format it's col1
  // Detect: if col1 of yearRow has "R million" it's the older format (col1=label)
  const yearRowC1 = cellStr(yearRow.getCell(1).value).toLowerCase();
  const labelCol = yearRowC1.includes("million") ? 1 : 2;

  const dataStartRow = yearRowNum + 1;
  const map: { col: number; year: string; type: string; labelCol: number; dataStartRow: number }[] = [];
  let lastType = "";
  for (let c = 1; c <= 20; c++) {
    const t1 = cellStr(typeRow2.getCell(c).value);
    const t2 = cellStr(typeRow.getCell(c).value);
    const typeStr = t1 || t2;
    if (typeStr) lastType = typeStr;
    const yearStr = cellStr(yearRow.getCell(c).value);
    if (yearStr.match(/^\d{4}\/\d{2}$/)) {
      const type = lastType.toLowerCase().includes("audited") ? "Audited_Outcome"
        : lastType.toLowerCase().includes("revised") ? "Revised_Estimate"
        : lastType.toLowerCase().includes("medium") ? "MTEF_Estimate"
        : lastType.toLowerCase().includes("adjusted") || lastType.toLowerCase().includes("appropriat") ? "Appropriation"
        : "Estimate";
      map.push({ col: c, year: yearStr, type, labelCol, dataStartRow });
    }
  }
  return map;
}

/**
 * Table 1 — Main budget framework
 * Rows: Tax revenue, Total revenue, Debt-service costs, Current payments, Transfers,
 *       Capital payments, Total expenditure, Budget balance, GDP
 * Layout: col1=empty, col2=label, col3..=data (starts col5 typically)
 */
function parseTable1(ws: ExcelJS.Worksheet, pubYear: number): BudgetRow[] {
  const rows: BudgetRow[] = [];
  const yearMap = buildYearMap(ws);
  if (yearMap.length === 0) return rows;

  // Key metrics we want — map row label substring → clean metric name
  const METRIC_MAP: Record<string, string> = {
    "tax revenue (gross"   : "Tax_Revenue_Gross",
    "total revenue"        : "Total_Revenue",
    "debt-service costs"   : "Debt_Service_Costs",
    "current payments"     : "Current_Payments",
    "transfers and sub"    : "Transfers_Subsidies",
    "payments for capital" : "Capital_Payments",
    "total expenditure"    : "Total_Expenditure",
    "main budget balanc"   : "Budget_Balance",
    "gdp"                  : "GDP",
  };

  const labelCol = yearMap[0]?.labelCol ?? 2;
  const dataStartRow = yearMap[0]?.dataStartRow ?? 6;
  for (let r = dataStartRow; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const label = cellStr(row.getCell(labelCol).value).toLowerCase();
    if (!label) continue;

    let metric: string | null = null;
    for (const [key, name] of Object.entries(METRIC_MAP)) {
      if (label.includes(key)) { metric = name; break; }
    }
    if (!metric) continue;

    for (const { col, year, type } of yearMap) {
      const val = cellNum(row.getCell(col).value);
      if (val === null) continue;
      rows.push({
        Fiscal_Year: year,
        Category: "Budget_Framework",
        Department: "National",
        Metric: metric,
        Value_ZAR_Millions: val.toFixed(2),
        Type: type,
        Pub_Year: String(pubYear),
      });
    }
  }
  return rows;
}

/**
 * Table 2 — Expenditure by national vote (department)
 * Layout: col1=vote_number, col2=department_name, col3..=data
 * Rows 6..end: one department per row
 */
function parseTable2(ws: ExcelJS.Worksheet, pubYear: number): BudgetRow[] {
  const rows: BudgetRow[] = [];
  // Table 2 year map: row 4 = type header, row 5 = year labels
  const yearMap = buildYearMap(ws);
  if (yearMap.length === 0) return rows;

  const labelCol2 = yearMap[0]?.labelCol ?? 2;
  const dataStartRow2 = yearMap[0]?.dataStartRow ?? 6;
  // 2024 format: col1=null, col2=vote, col3=dept
  // 2023 format: col1=vote, col2=dept (labelCol=1)
  const voteCol = labelCol2;
  const deptCol = labelCol2 + 1;

  for (let r = dataStartRow2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const voteNum = cellStr(row.getCell(voteCol).value);
    const deptName = cellStr(row.getCell(deptCol).value);
    if (!deptName || !voteNum.match(/^\d+$/) || deptName.toLowerCase().includes("total")) continue;

    const dept = `Vote_${voteNum.padStart(2, "0")}_${deptName.replace(/[^A-Za-z0-9 ]/g, "").replace(/\s+/g, "_").slice(0, 40)}`;

    for (const { col, year, type } of yearMap) {
      const val = cellNum(row.getCell(col).value);
      if (val === null) continue;
      rows.push({
        Fiscal_Year: year,
        Category: "By_Department",
        Department: dept,
        Metric: "Total_Expenditure",
        Value_ZAR_Millions: val.toFixed(3),
        Type: type,
        Pub_Year: String(pubYear),
      });
    }
  }
  return rows;
}

/**
 * Table 3 — Expenditure by economic classification
 * Rows: Compensation of employees, Goods and services, Transfers, Capital, etc.
 */
function parseTable3(ws: ExcelJS.Worksheet, pubYear: number): BudgetRow[] {
  const rows: BudgetRow[] = [];
  const yearMap = buildYearMap(ws);
  if (yearMap.length === 0) return rows;

  const ECON_METRICS: string[] = [
    "Compensation of employees",
    "Goods and services",
    "Transfers and subsidies",
    "Payments for capital assets",
    "Total",
  ];

  const labelCol3 = yearMap[0]?.labelCol ?? 2;
  const dataStartRow3 = yearMap[0]?.dataStartRow ?? 6;
  for (let r = dataStartRow3; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const label = cellStr(row.getCell(labelCol3).value);
    if (!label) continue;
    const matched = ECON_METRICS.find(m => label.toLowerCase().startsWith(m.toLowerCase().slice(0, 12)));
    if (!matched) continue;
    const metric = matched.replace(/\s+/g, "_").replace(/[^A-Za-z0-9_]/g, "");

    for (const { col, year, type } of yearMap) {
      const val = cellNum(row.getCell(col).value);
      if (val === null) continue;
      rows.push({
        Fiscal_Year: year,
        Category: "By_Economic_Classification",
        Department: "National",
        Metric: metric,
        Value_ZAR_Millions: val.toFixed(2),
        Type: type,
        Pub_Year: String(pubYear),
      });
    }
  }
  return rows;
}

async function processENE(pubYear: number, url: string, log: { info: (m: string) => void; warn: (m: string) => void }): Promise<BudgetRow[]> {
  const rows: BudgetRow[] = [];
  try {
    log.info(`  ${pubYear}: downloading ENE Summary…`);
    const buf = await downloadBuffer(url, 120000);
    const zip = new AdmZip(buf as Buffer);
    const xlsxEntry = zip.getEntries().find(e => e.entryName.endsWith(".xlsx"));
    if (!xlsxEntry) { log.warn(`  ${pubYear}: no xlsx in zip`); return rows; }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(xlsxEntry.getData());

    // Sheet names vary: "Table 1" (2024+) vs "ENE 2023 Table 1" (older publications)
    const findSheet = (n: number) =>
      wb.getWorksheet(`Table ${n}`) ??
      wb.worksheets.find(ws => ws.name.match(new RegExp(`Table ${n}$`, "i"))) ??
      null;

    const t1 = findSheet(1);
    const t2 = findSheet(2);
    const t3 = findSheet(3);

    if (t1) { const r = parseTable1(t1, pubYear); log.info(`    Table 1 (framework): ${r.length} rows`); rows.push(...r); }
    if (t2) { const r = parseTable2(t2, pubYear); log.info(`    Table 2 (by dept):    ${r.length} rows`); rows.push(...r); }
    if (t3) { const r = parseTable3(t3, pubYear); log.info(`    Table 3 (econ class): ${r.length} rows`); rows.push(...r); }

  } catch (e) {
    log.warn(`  ${pubYear}: ${e instanceof Error ? e.message : String(e)}`);
  }
  return rows;
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;
  try {
    log.info(`Downloading National Treasury ENE Summary tables (${ENE_URLS.length} publications)…`);
    const allRows: BudgetRow[] = [];

    for (const { pubYear, url } of ENE_URLS) {
      const rows = await processENE(pubYear, url, log);
      allRows.push(...rows);
    }

    if (allRows.length === 0) throw new Error("Parsed 0 rows from ENE summaries");

    // Deduplicate: prefer most recent publication for the same fiscal year + dept + metric
    // Sort by pub_year desc so latest wins in the dedup
    allRows.sort((a, b) => Number(b.Pub_Year) - Number(a.Pub_Year));
    const seen = new Set<string>();
    const deduped = allRows.filter(r => {
      const k = `${r.Fiscal_Year}|${r.Category}|${r.Department}|${r.Metric}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });

    // Sort output: most recent fiscal year first, then by category + department
    deduped.sort((a, b) =>
      b.Fiscal_Year.localeCompare(a.Fiscal_Year) ||
      a.Category.localeCompare(b.Category) ||
      a.Department.localeCompare(b.Department) ||
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
