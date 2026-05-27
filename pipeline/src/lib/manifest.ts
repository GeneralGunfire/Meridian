import fs from "fs";
import path from "path";
import type { Manifest, ManifestFileEntry, ManifestDataset } from "../types.js";

export function readManifest(dataRoot: string): Manifest {
  const p = path.join(dataRoot, "manifest.json");
  if (!fs.existsSync(p)) {
    return { generatedAt: new Date().toISOString(), datasets: {} };
  }
  return JSON.parse(fs.readFileSync(p, "utf-8")) as Manifest;
}

/** Atomically write manifest (tmp → rename) */
export function writeManifest(dataRoot: string, manifest: Manifest): void {
  manifest.generatedAt = new Date().toISOString();
  const p = path.join(dataRoot, "manifest.json");
  const tmp = p + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(manifest, null, 2) + "\n");
  fs.renameSync(tmp, p);
}

/** Merge a single file entry into a dataset's manifest record */
export function mergeDatasetFile(
  manifest: Manifest,
  datasetId: string,
  entry: ManifestFileEntry,
  isHistory = false
): void {
  if (!manifest.datasets[datasetId]) {
    manifest.datasets[datasetId] = { files: [] };
  }
  const ds: ManifestDataset = manifest.datasets[datasetId];

  if (isHistory) {
    ds.history = entry;
  } else {
    // Replace if period already exists; otherwise prepend
    const idx = ds.files.findIndex((f) => f.period === entry.period);
    if (idx >= 0) {
      ds.files[idx] = entry;
    } else {
      ds.files.unshift(entry);
    }
  }
  ds.lastUpdated = entry.date;
}

/** Check if a period is already in the manifest (idempotency) */
export function hasPeriod(manifest: Manifest, datasetId: string, period: string): boolean {
  const ds = manifest.datasets[datasetId];
  if (!ds) return false;
  return ds.files.some((f) => f.period === period);
}

/** Check if a history file has been pulled */
export function hasHistory(manifest: Manifest, datasetId: string): boolean {
  return !!manifest.datasets[datasetId]?.history;
}
