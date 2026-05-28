/**
 * GET /api/download/[...path]
 * Streams a CSV file from data/ or converts it to XLSX on the fly.
 *
 * Security: path-traversal guarded + registry-validated category/dataset.
 *
 * XLSX output is multi-sheet:
 *   Sheet 1 "Data"    — full raw CSV data
 *   Sheet 2 "Summary" — per-year record counts + Value min/max/mean
 *   Sheet 3 "About"   — dataset metadata key→value pairs
 *
 * Examples:
 *   /api/download/economy/tax_revenue/tax_revenue_2025.csv  → stream CSV
 *   /api/download/economy/tax_revenue/tax_revenue_2025.xlsx → convert & stream
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { CATEGORY_IDS, DATASET_IDS, getDataset } from "@/lib/registry";

function getDataRoot(): string {
  return process.env.MERIDIAN_DATA_ROOT ?? path.resolve(process.cwd(), "..", "data");
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

/** Parse a CSV string into header[] + rows[][]. Handles basic quoting. */
function parseCsv(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split("\n");
  if (lines.length === 0) return { headers: [], rows: [] };
  const parse = (line: string): string[] =>
    line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
  const headers = parse(lines[0]);
  const rows = lines.slice(1).map(parse);
  return { headers, rows };
}

/** Find column index by name (case-insensitive, partial match ok). Returns -1 if not found. */
function colIdx(headers: string[], name: string): number {
  const lower = name.toLowerCase();
  return headers.findIndex((h) => h.toLowerCase() === lower);
}

/** Build a summary: by year (record counts) + by main-category value stats */
function buildSummary(
  headers: string[],
  rows: string[][]
): { label: string; value: string | number }[][] {
  const sections: { label: string; value: string | number }[][] = [];

  // ── Section 1: Records per year ──────────────────────────────────────────────
  const yearCol = colIdx(headers, "Year") !== -1
    ? colIdx(headers, "Year")
    : colIdx(headers, "Fiscal_Year") !== -1
      ? colIdx(headers, "Fiscal_Year")
      : colIdx(headers, "GDP_Period") !== -1
        ? colIdx(headers, "GDP_Period")
        : colIdx(headers, "Financial_Year") !== -1
          ? colIdx(headers, "Financial_Year")
          : colIdx(headers, "Tax_Year");

  if (yearCol !== -1) {
    const yearCounts = new Map<string, number>();
    for (const row of rows) {
      const yr = row[yearCol] ?? "";
      if (yr) yearCounts.set(yr, (yearCounts.get(yr) ?? 0) + 1);
    }
    const sortedYears = [...yearCounts.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    const section: { label: string; value: string | number }[] = [
      { label: "RECORDS PER YEAR", value: "" },
      ...sortedYears.map(([yr, cnt]) => ({ label: yr, value: cnt })),
    ];
    sections.push(section);
  }

  // ── Section 2: Value statistics ───────────────────────────────────────────────
  const valueCol = colIdx(headers, "Value") !== -1
    ? colIdx(headers, "Value")
    : colIdx(headers, "Amount_ZAR_Millions") !== -1
      ? colIdx(headers, "Amount_ZAR_Millions")
      : colIdx(headers, "Value_ZAR_Millions");

  // Find a grouping column (category, metric, tax type, etc.)
  const groupCol =
    colIdx(headers, "Category") !== -1   ? colIdx(headers, "Category")   :
    colIdx(headers, "Metric") !== -1     ? colIdx(headers, "Metric")     :
    colIdx(headers, "Tax_Type") !== -1   ? colIdx(headers, "Tax_Type")   :
    colIdx(headers, "Grant_Type") !== -1 ? colIdx(headers, "Grant_Type") :
    colIdx(headers, "Sector") !== -1     ? colIdx(headers, "Sector")     : -1;

  if (valueCol !== -1) {
    const groups = new Map<string, number[]>();
    for (const row of rows) {
      const grp = groupCol !== -1 ? (row[groupCol] ?? "All") : "All";
      const raw = row[valueCol] ?? "";
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        if (!groups.has(grp)) groups.set(grp, []);
        groups.get(grp)!.push(num);
      }
    }
    if (groups.size > 0) {
      const section: { label: string; value: string | number }[] = [
        { label: "VALUE STATISTICS", value: "" },
        { label: "Category / Group", value: "Min | Mean | Max" },
      ];
      for (const [grp, vals] of [...groups.entries()].sort()) {
        const mn = Math.min(...vals);
        const mx = Math.max(...vals);
        const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
        section.push({
          label: grp,
          value: `${mn.toFixed(2)} | ${mean.toFixed(2)} | ${mx.toFixed(2)}`,
        });
      }
      sections.push(section);
    }
  }

  return sections;
}

export async function GET(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  try {
    const { path: segments } = await ctx.params;

    // Expect at least 3 segments: [category, dataset, filename]
    if (!segments || segments.length < 3) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const [category, dataset, ...rest] = segments;
    const filename = rest.join("/");

    // Validate category and dataset against registry
    if (!CATEGORY_IDS.has(category as never) || !DATASET_IDS.has(dataset as never)) {
      return NextResponse.json({ error: "Unknown dataset" }, { status: 404 });
    }

    // Reject any path component containing traversal patterns
    const allParts = [category, dataset, filename];
    if (allParts.some((p) => p.includes("..") || p.includes("\0"))) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const isXlsx = filename.endsWith(".xlsx");
    const csvFilename = isXlsx ? filename.replace(/\.xlsx$/, ".csv") : filename;

    const dataRoot = getDataRoot();
    const csvPath = path.resolve(dataRoot, category, dataset, csvFilename);

    // Boundary guard — resolved path must start with data root
    if (!csvPath.startsWith(path.resolve(dataRoot))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!isXlsx) {
      // Stream CSV directly
      const fileBuffer = fs.readFileSync(csvPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${path.basename(csvFilename)}"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // ── Convert CSV → multi-sheet XLSX ─────────────────────────────────────────
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const { headers, rows } = parseCsv(csvContent);

    // ── Sheet 1: Data ────────────────────────────────────────────────────────────
    const dataSheet = workbook.addWorksheet("Data");
    if (headers.length > 0) {
      dataSheet.columns = headers.map((h) => ({
        header: h,
        key: h,
        width: Math.max(h.length + 4, 14),
      }));

      const headerRow = dataSheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };

      for (const row of rows) {
        dataSheet.addRow(row);
      }
    }

    // ── Sheet 2: Summary ─────────────────────────────────────────────────────────
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Category / Year", key: "label", width: 40 },
      { header: "Value", key: "value", width: 30 },
    ];
    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true };
    summaryHeaderRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };

    const summaryData = buildSummary(headers, rows);
    let summaryRowNum = 2;
    for (const section of summaryData) {
      for (const { label, value } of section) {
        const sRow = summarySheet.getRow(summaryRowNum++);
        sRow.getCell(1).value = label;
        sRow.getCell(2).value = value === "" ? "" : value;
        // Bold the section header (value === "")
        if (value === "") {
          sRow.getCell(1).font = { bold: true };
          sRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };
          sRow.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };
        }
      }
      summaryRowNum++; // blank row between sections
    }

    // ── Sheet 3: About ───────────────────────────────────────────────────────────
    const aboutSheet = workbook.addWorksheet("About");
    aboutSheet.columns = [
      { header: "Field", key: "field", width: 24 },
      { header: "Value", key: "value", width: 60 },
    ];
    const aboutHeaderRow = aboutSheet.getRow(1);
    aboutHeaderRow.font = { bold: true };
    aboutHeaderRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };

    const spec = getDataset(dataset);
    const lastUpdated = (() => {
      try { return fs.statSync(csvPath).mtime.toISOString().slice(0, 10); } catch { return ""; }
    })();

    const aboutRows: [string, string][] = [
      ["Dataset ID",   dataset],
      ["Label",        spec?.label        ?? dataset],
      ["Source",       spec?.source       ?? ""],
      ["Source URL",   spec?.sourceUrl    ?? ""],
      ["Method",       spec?.method       ?? ""],
      ["Cadence",      spec?.cadence      ?? ""],
      ["Category",     spec?.category     ?? category],
      ["Description",  spec?.description  ?? ""],
      ["Grain",        spec?.grain        ?? ""],
      ["Last Updated", lastUpdated],
      ["Total Rows",   String(rows.length)],
      ["Schema",       headers.join(", ")],
    ];

    let aboutRowNum = 2;
    for (const [field, value] of aboutRows) {
      const aRow = aboutSheet.getRow(aboutRowNum++);
      aRow.getCell(1).value = field;
      aRow.getCell(2).value = value;
      aRow.getCell(1).font = { bold: true };
    }

    const xlsxBuffer = await workbook.xlsx.writeBuffer();
    const xlsxFilename = path.basename(csvFilename).replace(/\.csv$/, ".xlsx");

    return new NextResponse(xlsxBuffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${xlsxFilename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[/api/download]", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
