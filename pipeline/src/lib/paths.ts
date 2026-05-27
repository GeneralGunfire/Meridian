import path from "path";
import fs from "fs";

export function getDataRoot(): string {
  return process.env.MERIDIAN_DATA_ROOT ?? path.resolve(import.meta.dirname, "..", "..", "..", "data");
}

export function datasetDir(dataRoot: string, category: string, id: string): string {
  return path.join(dataRoot, category, id);
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

/** Relative path from dataRoot e.g. "economy/tax_revenue/tax_revenue_2025.csv" */
export function relPath(dataRoot: string, absPath: string): string {
  return path.relative(dataRoot, absPath).replace(/\\/g, "/");
}
