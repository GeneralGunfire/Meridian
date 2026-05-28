/**
 * water.ts — StatsSA GHS water, sanitation & household services scraper
 *
 * Source: StatsSA General Household Survey Time Series 2002-2025 Excel
 * URL: https://www.statssa.gov.za/publications/P0318/GHS 2025 Time Series Of Selected Variables, 2002 - 2025.xlsx
 *
 * Sheets used:
 *   "25. Access to drinking water" — water source type
 *   "30. Toilet facility"          — sanitation type
 *   "26. Source of energy for lighting" — electricity access
 *   "27. Source of energy for cooking"  — cooking energy
 *   "28. Refuse removal"                — waste removal
 *
 * Layout (all sheets):
 *   Row 4:  col4=2002, col5=2003, ... col27=2025 (year labels)
 *   Rows 5+: col2=geography block label, col3=category name, col4..=values
 *   Geography blocks: "South Africa (N)", "South Africa (%)",
 *                     "Eastern Cape (%)", "Western Cape ('000)", etc.
 *
 * Output (long format): Year, Topic, Geography, Province, Category, Value, Unit
 */

import path from "path";
import ExcelJS from "exceljs";
import { downloadBuffer } from "../../lib/http.js";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

const SOURCE_URL =
  "https://www.statssa.gov.za/publications/P0318/GHS%202025%20Time%20Series%20Of%20Selected%20Variables%2C%202002%20-%202025.xlsx";

// Sheets to extract from — name → topic label
// Sheet names confirmed from GHS 2025 Time Series workbook
const TARGET_SHEETS: { sheetName: string; topic: string }[] = [
  { sheetName: "25. Access to drinking water", topic: "Water_Source" },
  { sheetName: "30. Toilet facility",          topic: "Sanitation" },
  { sheetName: "31. Electricity access",       topic: "Electricity_Access" },
  { sheetName: "34. Main source of cooking",   topic: "Energy_Cooking" },
  { sheetName: "36. Refuse removal",           topic: "Refuse_Removal" },
];

interface WaterRow {
  Year:      string;
  Topic:     string;
  Geography: string;
  Province:  string;
  Category:  string;
  Value:     string;
  Unit:      string;
}

function cellVal(v: ExcelJS.CellValue): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "object" && "result" in v) return (v as { result: string | number }).result ?? null;
  return v as string | number;
}

/**
 * Extract a province name from a geography block label.
 * Labels look like: "South Africa (%)", "Eastern Cape ('000)", "KwaZulu-Natal (N)"
 * Returns the part before " (" — trimmed.
 */
function parseGeoLabel(label: string): { geography: string; province: string; unit: string | null } {
  // Strip everything from " (" onward to get the geography name
  const nameMatch = label.match(/^(.+?)\s*\(/);
  const geography = nameMatch ? nameMatch[1].trim() : label.trim();

  // Province: use geography value; for South Africa rows province = "South Africa"
  const province = geography;

  // Unit
  const unit = label.includes("%")     ? "%" :
               label.includes("'000")  ? "thousands" :
               label.includes("(N)")   ? "count" : null;

  return { geography, province, unit };
}

function extractSheet(ws: ExcelJS.Worksheet, topic: string): WaterRow[] {
  const rows: WaterRow[] = [];

  // Row 4 has year labels starting at col4
  const yearRow = ws.getRow(4);
  const yearCols: { col: number; year: string }[] = [];
  for (let c = 4; c <= 30; c++) {
    const v = cellVal(yearRow.getCell(c).value);
    if (v === null || v === "") break;
    const year = parseInt(String(v), 10);
    if (!isNaN(year) && year >= 2000 && year <= 2030) {
      yearCols.push({ col: c, year: String(year) });
    }
  }
  if (yearCols.length === 0) return rows;

  // Data rows: col2=geography block, col3=category name
  let currentGeo = "";
  let currentUnit: string | null = null;
  let currentProvince = "";

  for (let r = 5; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const col2 = String(cellVal(row.getCell(2).value) ?? "").trim();
    const col3 = String(cellVal(row.getCell(3).value) ?? "").trim();

    if (!col2 && !col3) continue;

    // col2 carries the geography+unit label whenever it changes
    if (col2) {
      const parsed = parseGeoLabel(col2);
      currentGeo = parsed.geography;
      currentProvince = parsed.province;
      currentUnit = parsed.unit;
    }

    // Skip unlabelled unit blocks
    if (currentUnit === null) continue;

    // Skip header/total rows
    if (!col3 || col3.toLowerCase() === "total" || col3.toLowerCase() === "year") continue;

    for (const { col, year } of yearCols) {
      const v = cellVal(row.getCell(col).value);
      if (v === null || v === "" || v === "-") continue;
      const num = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
      if (isNaN(num)) continue;

      rows.push({
        Year:      year,
        Topic:     topic,
        Geography: currentGeo,
        Province:  currentProvince,
        Category:  col3,
        Value:     currentUnit === "%" ? num.toFixed(1) : num.toFixed(0),
        Unit:      currentUnit,
      });
    }
  }
  return rows;
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;

  try {
    log.info(`Downloading GHS Time Series from StatsSA…`);
    const buffer = await downloadBuffer(SOURCE_URL, 120000);
    log.info(`Downloaded ${(buffer.length / 1024).toFixed(0)}KB — parsing`);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    const allRows: WaterRow[] = [];
    for (const { sheetName, topic } of TARGET_SHEETS) {
      const ws = wb.getWorksheet(sheetName);
      if (!ws) {
        log.warn(`Sheet "${sheetName}" not found — skipping`);
        continue;
      }
      const sheetRows = extractSheet(ws, topic);
      log.info(`  ${sheetName}: ${sheetRows.length} rows`);
      allRows.push(...sheetRows);
    }

    if (allRows.length === 0) throw new Error("Parsed 0 rows — layout mismatch");

    // Sort: most recent year first, then topic, province, category
    allRows.sort((a, b) =>
      b.Year.localeCompare(a.Year) ||
      a.Topic.localeCompare(b.Topic) ||
      a.Province.localeCompare(b.Province) ||
      a.Category.localeCompare(b.Category)
    );

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
