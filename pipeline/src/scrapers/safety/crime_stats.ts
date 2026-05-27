/**
 * crime_stats.ts — SAPS crime statistics scraper
 *
 * Source: SAPS quarterly crime stats Excel (saps.gov.za/services/downloads/)
 * Confirmed (recon 2026-05): the quarterly WEB.xlsx (~11MB) has a "RAW Data"
 * sheet with ~55k rows of station-level data. Layout (header on row 3):
 *   col5 Station | col6 District | col7 Province | col8 Crime_Category
 *   quarter-total columns: col13/17/21/25/29 = "Oct–Dec" totals for 2021..2025
 *
 * We emit one row per station × crime type × year-quarter using the quarter
 * totals — giving multi-year history from a single file (history mode).
 *
 * NOTE: SAPS publishes per quarter; the WEB.xlsx for a given quarter carries
 * that quarter's months across recent years. The URL embeds the financial year
 * + quarter, e.g. .../2025/2025-2026_-_3rd_Quarter_WEB.xlsx
 */

import path from "path";
import ExcelJS from "exceljs";
import "../../lib/http.js"; // installs the TLS dispatcher (MERIDIAN_INSECURE_TLS)
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

// Current confirmed source — the Q3 2025/26 release (Oct–Dec quarter).
// TODO: generalise URL discovery for other quarters once the pattern is mapped.
const SOURCE_URL =
  "https://www.saps.gov.za/services/downloads/2025/2025-2026_-_3rd_Quarter_WEB.xlsx";

// Quarter-total columns in the RAW Data sheet → the year each represents.
// These are the "October to December YYYY" aggregate columns.
const QUARTER_TOTAL_COLUMNS: { col: number; year: number }[] = [
  { col: 13, year: 2021 },
  { col: 17, year: 2022 },
  { col: 21, year: 2023 },
  { col: 25, year: 2024 },
  { col: 29, year: 2025 },
];

const COL = { station: 5, district: 6, province: 7, crime: 8 };

interface CrimeRow {
  Year: string;
  Quarter: string;
  Province: string;
  Station: string;
  Crime_Type: string;
  Count: number | string;
  Change_Pct: string;
}

function cellVal(v: ExcelJS.CellValue): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "object" && "result" in v) return (v.result as string | number) ?? null;
  return v as string | number;
}

async function downloadXlsx(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Meridian-Pipeline/1.0" },
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;

  try {
    log.info(`Downloading SAPS crime Excel from ${SOURCE_URL}`);
    const buffer = await downloadXlsx(SOURCE_URL);
    log.info(`Downloaded ${(buffer.length / 1e6).toFixed(1)}MB — parsing`);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.getWorksheet("RAW Data");
    if (!ws) throw new Error('"RAW Data" sheet not found — SAPS layout may have changed');

    const rows: CrimeRow[] = [];
    // Data starts at row 4 (rows 1-3 are headers)
    for (let r = 4; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const station = cellVal(row.getCell(COL.station).value);
      const province = cellVal(row.getCell(COL.province).value);
      const crime = cellVal(row.getCell(COL.crime).value);
      if (!station || !province || !crime) continue; // skip blank/subtotal rows

      for (const { col, year } of QUARTER_TOTAL_COLUMNS) {
        const count = cellVal(row.getCell(col).value);
        if (count === null || count === "") continue;
        rows.push({
          Year: String(year),
          Quarter: "Q3", // Oct–Dec = financial-year Q3
          Province: String(province).trim(),
          Station: String(station).trim(),
          Crime_Type: String(crime).trim(),
          Count: typeof count === "number" ? count : String(count),
          Change_Pct: "",
        });
      }
    }

    if (rows.length === 0) throw new Error("Parsed 0 crime rows — layout mismatch");

    // Validate sanity: counts should be numeric, provinces should be real
    const numericShare = rows.filter((r) => typeof r.Count === "number").length / rows.length;
    if (numericShare < 0.8) {
      throw new Error(`Only ${(numericShare * 100).toFixed(0)}% of counts numeric — likely parse error`);
    }

    const historyPath = path.join(dataDir, `${spec.id}_history.csv`);
    rows.sort((a, b) =>
      b.Year.localeCompare(a.Year) ||
      a.Province.localeCompare(b.Province) ||
      a.Station.localeCompare(b.Station) ||
      a.Crime_Type.localeCompare(b.Crime_Type)
    );
    writeCsv(historyPath, rows as unknown as Record<string, unknown>[]);

    const rowCount = countCsvRows(historyPath);
    const rel = relPath(dataRoot, historyPath);
    log.info(`Wrote ${rowCount} crime rows → ${rel}`);

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
