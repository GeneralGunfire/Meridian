/**
 * GET /api/download/[...path]
 * Streams a CSV file from data/ or converts it to XLSX on the fly.
 *
 * Security: path-traversal guarded + registry-validated category/dataset.
 *
 * Examples:
 *   /api/download/economy/tax_revenue/tax_revenue_2025.csv  → stream CSV
 *   /api/download/economy/tax_revenue/tax_revenue_2025.xlsx → convert & stream
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { CATEGORY_IDS, DATASET_IDS } from "@/lib/registry";

function getDataRoot(): string {
  return process.env.MERIDIAN_DATA_ROOT ?? path.resolve(process.cwd(), "..", "data");
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

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

    // Convert CSV → XLSX on the fly using exceljs
    // Dynamic import keeps exceljs out of the initial bundle
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.trim().split("\n");

    if (lines.length > 0) {
      // First line = header
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      worksheet.columns = headers.map((h) => ({ header: h, key: h, width: Math.max(h.length + 4, 14) }));

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };

      // Data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        worksheet.addRow(values);
      }
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
