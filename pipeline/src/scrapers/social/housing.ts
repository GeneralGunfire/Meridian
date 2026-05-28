/**
 * housing.ts — StatsSA GHS housing & household services scraper
 *
 * Source: StatsSA General Household Survey Time Series 2002-2025 Excel
 * URL: same file as water.ts (GHS Time Series)
 *
 * Sheets used:
 *   "23. Type of main dwelling"  — formal/informal/traditional
 *   "24. Tenure status"          — owned/rented/rent-free
 *   "20. Household income"       — income brackets
 *   "21. Food security"          — food access indicators
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

// Sheet names confirmed from GHS 2025 Time Series workbook
// Note: "42. Sources of income" uses a 3-column layout (source / yes-no / value) — incompatible
// with the standard 2-column layout; using "43. Main source of income" instead which follows
// the standard pattern. "19. Medical aid cover" added for household welfare context.
const TARGET_SHEETS: { sheetName: string; topic: string }[] = [
  { sheetName: "23. Type of main dwelling", topic: "Dwelling_Type" },
  { sheetName: "24. Tenure status",         topic: "Tenure_Status" },
  { sheetName: "43. Main source of income", topic: "Household_Income" },
  { sheetName: "19. Medical aid cover",     topic: "Medical_Aid" },
  { sheetName: "44. Hunger - persons",      topic: "Food_Security" },
];

interface HousingRow {
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
  const nameMatch = label.match(/^(.+?)\s*\(/);
  const geography = nameMatch ? nameMatch[1].trim() : label.trim();
  const province = geography;

  const unit = label.includes("%")     ? "%" :
               label.includes("'000")  ? "thousands" :
               label.includes("(N)")   ? "count" : null;

  return { geography, province, unit };
}

function extractSheet(ws: ExcelJS.Worksheet, topic: string): HousingRow[] {
  const rows: HousingRow[] = [];

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

  let currentGeo = "";
  let currentUnit: string | null = null;
  let currentProvince = "";

  for (let r = 5; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const col2 = String(cellVal(row.getCell(2).value) ?? "").trim();
    const col3 = String(cellVal(row.getCell(3).value) ?? "").trim();

    if (!col2 && !col3) continue;

    if (col2) {
      const parsed = parseGeoLabel(col2);
      currentGeo = parsed.geography;
      currentProvince = parsed.province;
      currentUnit = parsed.unit;
    }

    if (currentUnit === null) continue;
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

    const allRows: HousingRow[] = [];
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
