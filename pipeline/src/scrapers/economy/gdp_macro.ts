/**
 * gdp_macro.ts — StatsSA P0441 GDP scraper
 *
 * Source: StatsSA P0441 "GDP Time Series" Excel (quarterly, current prices)
 * URL: https://www.statssa.gov.za/publications/P0441/GDP P0441 - GDP Time series Q4 2025_2.xlsx
 *
 * Sheet "Quarterly" layout:
 *   Row 1: col1-10 = metadata headers (H01..H25), col11+ = period codes (YYYYQQ e.g. 199301)
 *   Rows 2+: each row = one data series
 *     col1=publication, col2=title, col3=series_code, col4=category, col5=sector
 *     col7=price_type, col8=value_type, col9=unit, col10=frequency
 *     col11+ = quarterly values
 *
 * We extract key GDP series and pivot to long format:
 *   one row per quarter per series (GDP at market prices + sector breakdown)
 *
 * Output: GDP_Period, Year, Quarter, Series_Code, Category, Sector, Amount_ZAR_Millions
 */

import path from "path";
import ExcelJS from "exceljs";
import "../../lib/http.js";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

const SOURCE_URL =
  "https://www.statssa.gov.za/publications/P0441/GDP%20P0441%20-%20GDP%20Time%20series%20Q4%202025_2.xlsx";

// Key series to extract (value added at basic prices by sector + headline GDP)
const TARGET_SERIES: { code: string; label: string }[] = [
  { code: "QNU1000", label: "GDP at market prices" },
  { code: "QNU1001", label: "Agriculture, forestry and fishing" },
  { code: "QNU1002", label: "Mining and quarrying" },
  { code: "QNU1003", label: "Manufacturing" },
  { code: "QNU1004", label: "Electricity, gas and water" },
  { code: "QNU1005", label: "Construction" },
  { code: "QNU1006", label: "Trade, catering and accommodation" },
  { code: "QNU1007", label: "Transport, storage and communication" },
  { code: "QNU1008", label: "Finance, real estate and business services" },
  { code: "QNU1009", label: "General government services" },
  { code: "QNU1010", label: "Personal services" },
];

// Limit to last 15 years of quarters (~60 quarters back from 2025 Q4)
const MIN_YEAR = 2010;

interface GdpRow {
  GDP_Period: string;   // e.g. "2025 Q4"
  Year: string;
  Quarter: string;
  Series_Code: string;
  Sector: string;
  Amount_ZAR_Millions: string;
}

function cellVal(v: ExcelJS.CellValue): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "object" && "result" in v) return (v as { result: string | number }).result ?? null;
  return v as string | number;
}

/** Parse YYYYQQ period code → { year, quarter } */
function parsePeriod(code: string | number): { year: number; quarter: number } | null {
  const s = String(code).trim();
  if (s.length !== 6 || !/^\d{6}$/.test(s)) return null;
  const year = parseInt(s.slice(0, 4), 10);
  const quarter = parseInt(s.slice(4, 6), 10);
  if (quarter < 1 || quarter > 4) return null;
  return { year, quarter };
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;

  try {
    log.info(`Downloading GDP time series from StatsSA…`);
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": "Meridian-Pipeline/1.0" },
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from StatsSA`);
    const buffer = Buffer.from(await res.arrayBuffer());
    log.info(`Downloaded ${(buffer.length / 1e6).toFixed(1)}MB — parsing`);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.getWorksheet("Quarterly");
    if (!ws) throw new Error('"Quarterly" sheet not found — StatsSA layout may have changed');

    // Row 1 has period codes in col11+
    const headerRow = ws.getRow(1);
    const periodCols: { col: number; year: number; quarter: number }[] = [];
    for (let c = 11; c <= ws.columnCount; c++) {
      const v = cellVal(headerRow.getCell(c).value);
      if (v === null) break;
      const parsed = parsePeriod(v);
      if (parsed && parsed.year >= MIN_YEAR) {
        periodCols.push({ col: c, ...parsed });
      }
    }
    log.info(`Found ${periodCols.length} quarters from ${MIN_YEAR} onwards`);

    // Build series code → row index map
    const targetCodes = new Set(TARGET_SERIES.map(s => s.code));
    const seriesRows: Map<string, number> = new Map();
    for (let r = 2; r <= ws.rowCount; r++) {
      const code = String(cellVal(ws.getRow(r).getCell(3).value) ?? "").trim();
      if (targetCodes.has(code)) seriesRows.set(code, r);
      if (seriesRows.size === targetCodes.size) break;
    }
    log.info(`Found ${seriesRows.size}/${TARGET_SERIES.length} target series`);

    const rows: GdpRow[] = [];
    for (const { code, label } of TARGET_SERIES) {
      const rowIdx = seriesRows.get(code);
      if (!rowIdx) {
        log.warn(`Series ${code} not found in sheet`);
        continue;
      }
      const dataRow = ws.getRow(rowIdx);
      for (const { col, year, quarter } of periodCols) {
        const val = cellVal(dataRow.getCell(col).value);
        if (val === null || val === "") continue;
        const amount = typeof val === "number" ? val : parseFloat(String(val));
        if (isNaN(amount)) continue;
        rows.push({
          GDP_Period: `${year} Q${quarter}`,
          Year: String(year),
          Quarter: `Q${quarter}`,
          Series_Code: code,
          Sector: label,
          Amount_ZAR_Millions: amount.toFixed(2),
        });
      }
    }

    if (rows.length === 0) throw new Error("Parsed 0 GDP rows — layout mismatch");

    // Sort: most recent first, then by series
    rows.sort((a, b) =>
      b.GDP_Period.localeCompare(a.GDP_Period) ||
      a.Series_Code.localeCompare(b.Series_Code)
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
