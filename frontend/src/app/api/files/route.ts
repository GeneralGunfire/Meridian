/**
 * GET /api/files
 * Returns all datasets grouped by category with their available file releases.
 * Reads data/manifest.json (written by the pipeline) and merges it with the
 * static registry to include datasets that have no files yet (empty states).
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CATEGORIES, DATASETS } from "@/lib/registry";
import type { FilesResponse, CategoryGroup, DatasetEntry, FileRelease } from "@/lib/datasets";

// ── manifest shape (written by pipeline/src/lib/manifest.ts) ─────────────────
interface ManifestFileEntry {
  period: string;
  date: string;
  rows: number;
  csv: string;  // relative path from data/ root
}

interface ManifestDataset {
  files: ManifestFileEntry[];
  history?: ManifestFileEntry;
  lastUpdated?: string;
}

interface Manifest {
  generatedAt: string;
  datasets: Record<string, ManifestDataset>;
}

// ── data root resolution ──────────────────────────────────────────────────────
function getDataRoot(): string {
  return process.env.MERIDIAN_DATA_ROOT ?? path.resolve(process.cwd(), "..", "data");
}

function toDownloadUrl(relativeCsvPath: string): string {
  // e.g. "economy/tax_revenue/tax_revenue_2025.csv" → "/api/download/economy/tax_revenue/tax_revenue_2025.csv"
  return `/api/download/${relativeCsvPath}`;
}

function toXlsxUrl(csvUrl: string): string {
  return csvUrl.replace(/\.csv$/, ".xlsx");
}

function releaseFromManifest(entry: ManifestFileEntry): FileRelease {
  const csvUrl = toDownloadUrl(entry.csv);
  return {
    period: entry.period,
    date: entry.date,
    rows: entry.rows,
    csv_url: csvUrl,
    xlsx_url: toXlsxUrl(csvUrl),
  };
}

// ── route handler ─────────────────────────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  try {
    const dataRoot = getDataRoot();
    const manifestPath = path.join(dataRoot, "manifest.json");

    // Read manifest — may not exist yet if scrapers haven't run
    let manifest: Manifest = { generatedAt: new Date().toISOString(), datasets: {} };
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(raw) as Manifest;
    }

    // Build response by merging registry (shape/labels) + manifest (actual files)
    const categories: CategoryGroup[] = CATEGORIES.map((cat) => {
      const datasets: DatasetEntry[] = DATASETS.filter((ds) => ds.category === cat.id).map((spec) => {
        const mds = manifest.datasets[spec.id];
        const files: FileRelease[] = mds?.files
          ? [...mds.files].sort((a, b) => b.period.localeCompare(a.period)).map(releaseFromManifest)
          : [];
        const history: FileRelease | undefined = mds?.history
          ? releaseFromManifest(mds.history)
          : undefined;

        return {
          id: spec.id,
          label: spec.label,
          description: spec.description,
          source: spec.source,
          sourceUrl: spec.sourceUrl,
          method: spec.method,
          cadence: spec.cadence,
          columns: spec.columns,
          color: spec.color,
          badgeColor: spec.badgeColor,
          files,
          history,
        };
      });

      return { id: cat.id, label: cat.label, description: cat.description, datasets };
    });

    const response: FilesResponse = {
      generatedAt: manifest.generatedAt,
      categories,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/files]", err);
    return NextResponse.json({ error: "Failed to load dataset catalog" }, { status: 500 });
  }
}
