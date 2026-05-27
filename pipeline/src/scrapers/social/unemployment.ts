/**
 * unemployment.ts — StatsSA P0211 QLFS scraper
 *
 * Source: StatsSA Quarterly Labour Force Survey Trends Excel
 * URL: https://www.statssa.gov.za/publications/P0211/QLFS Trends 2008-2026Q1.xlsx
 *
 * Sheet "Table 2" (Labour force characteristics by sex - All population groups):
 *   Row 2: quarter labels (e.g. "Jan-Mar 2008", "Apr-Jun 2008", …)
 *   Row 3: units (Thousand / %)
 *   Key rows:
 *     r6  = Population 15-64 years (thousands)
 *     r7  = Labour Force (thousands)
 *     r8  = Employed (thousands)
 *     r12 = Unemployed (thousands)
 *     r21 = Labour force participation rate (%)
 *     r22 = Employment-to-population ratio (%)
 *     r25 = Unemployment rate / LU1 (%)
 *
 * Output (long format): Period, Year, Quarter, Metric, Value, Unit
 * One row per quarter per metric — ~18 years × 4 quarters × 7 metrics
 */

import path from "path";
import ExcelJS from "exceljs";
import { downloadBuffer } from "../../lib/http.js";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

// URL confirmed from statssa.gov.za/?page_id=1854&PPN=P0211
const SOURCE_URL =
  "https://www.statssa.gov.za/publications/P0211/QLFS%20Trends%202008-2026Q1.xlsx";

// Key row indices in "Table 2" sheet (1-based)
const KEY_ROWS: { rowIdx: number; metric: string; unit: string }[] = [
  { rowIdx: 6,  metric: "Population_15_64",               unit: "thousands" },
  { rowIdx: 7,  metric: "Labour_Force",                    unit: "thousands" },
  { rowIdx: 8,  metric: "Employed",                        unit: "thousands" },
  { rowIdx: 12, metric: "Unemployed",                      unit: "thousands" },
  { rowIdx: 21, metric: "Labour_Force_Participation_Rate", unit: "%" },
  { rowIdx: 22, metric: "Employment_Population_Ratio",     unit: "%" },
  { rowIdx: 25, metric: "Unemployment_Rate",               unit: "%" },
];

// Quarter label → standardised period token
// "Jan-Mar 2026" → "2026-Q1", "Apr-Jun 2026" → "2026-Q2", etc.
function parseQuarterLabel(label: string): { period: string; year: string; quarter: string } | null {
  const match = label.match(/(\w+-\w+)\s+(\d{4})/);
  if (!match) return null;
  const [, months, year] = match;
  const monthMap: Record<string, string> = {
    "Jan-Mar": "Q1", "Apr-Jun": "Q2", "Jul-Sep": "Q3", "Oct-Dec": "Q4",
  };
  const q = monthMap[months];
  if (!q) return null;
  return { period: `${year}-${q}`, year, quarter: q };
}

interface UnemRow {
  Period: string;
  Year: string;
  Quarter: string;
  Metric: string;
  Value: string;
  Unit: string;
}

function cellVal(v: ExcelJS.CellValue): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "object" && "result" in v) return (v as { result: string | number }).result ?? null;
  if (typeof v === "object" && "text" in v) return (v as { text: string }).text ?? null;
  return v as string | number;
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;

  try {
    log.info(`Downloading QLFS Trends from StatsSA…`);
    const buffer = await downloadBuffer(SOURCE_URL, 120000);
    log.info(`Downloaded ${(buffer.length / 1e6).toFixed(1)}MB — parsing`);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.getWorksheet("Table 2");
    if (!ws) throw new Error('"Table 2" sheet not found — QLFS layout may have changed');

    // Row 2 has quarter labels in col2 onwards
    const headerRow = ws.getRow(2);
    const quarterCols: { col: number; period: string; year: string; quarter: string }[] = [];
    for (let c = 2; c <= ws.columnCount; c++) {
      const v = cellVal(headerRow.getCell(c).value);
      if (v === null || v === "") continue;
      const parsed = parseQuarterLabel(String(v));
      if (parsed) quarterCols.push({ col: c, ...parsed });
    }
    log.info(`Found ${quarterCols.length} quarters (${quarterCols[0]?.period} – ${quarterCols[quarterCols.length - 1]?.period})`);

    const rows: UnemRow[] = [];
    for (const { rowIdx, metric, unit } of KEY_ROWS) {
      const row = ws.getRow(rowIdx);
      for (const { col, period, year, quarter } of quarterCols) {
        const v = cellVal(row.getCell(col).value);
        if (v === null || v === "" || v === " - ") continue;
        const num = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
        if (isNaN(num)) continue;
        rows.push({
          Period: period,
          Year: year,
          Quarter: quarter,
          Metric: metric,
          Value: num.toFixed(unit === "%" ? 1 : 0),
          Unit: unit,
        });
      }
    }

    if (rows.length === 0) throw new Error("Parsed 0 QLFS rows — layout mismatch");

    // Sort: most recent first, then by metric
    rows.sort((a, b) =>
      b.Period.localeCompare(a.Period) ||
      a.Metric.localeCompare(b.Metric)
    );

    const historyPath = path.join(dataDir, `${spec.id}_history.csv`);
    writeCsv(historyPath, rows as unknown as Record<string, unknown>[]);
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
