/**
 * types.ts — the scraper contract for Meridian's pipeline.
 * Every scraper module exports run(ctx) → ScraperResult.
 */

export type DatasetMethod = "api" | "parse" | "scrape" | "manual";
export type DatasetCadence = "weekly" | "monthly" | "quarterly" | "annual";
export type CategoryId = "economy" | "energy" | "social" | "safety";
export type ScraperMode = "history" | "incremental";

export interface DatasetSpec {
  id: string;
  category: CategoryId;
  label: string;
  source: string;
  method: DatasetMethod;
  cadence: DatasetCadence;
}

export interface ScraperContext {
  spec: DatasetSpec;
  /** Absolute path to the data/ root folder */
  dataRoot: string;
  /** Absolute path to data/<category>/<dataset>/ */
  dataDir: string;
  /** Current period string e.g. "2026-w22", "2026-q1", "2025" */
  period: string;
  /** "history" = no _history.csv exists yet; "incremental" = append only */
  mode: ScraperMode;
  /** Simple structured logger */
  log: Logger;
}

export interface Logger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string, err?: unknown): void;
}

export interface ScraperResult {
  id: string;
  success: boolean;
  rowsWritten: number;
  filesWritten: string[];   // relative paths from data/ root
  skipped: boolean;         // true = no new period available (not an error)
  error: string | null;
  lastUpdated: string | null; // ISO date string
}

// Shape written to data/manifest.json
export interface ManifestFileEntry {
  period: string;
  date: string;
  rows: number;
  csv: string; // relative from data/ root
}

export interface ManifestDataset {
  files: ManifestFileEntry[];
  history?: ManifestFileEntry;
  lastUpdated?: string;
}

export interface Manifest {
  generatedAt: string;
  datasets: Record<string, ManifestDataset>;
}

// Shape written to data/status.json
export interface DatasetStatus {
  success: boolean;
  last_updated: string | null;
  error: string | null;
  skipped: boolean;
}

export interface StatusFile {
  generatedAt: string;
  datasets: Record<string, DatasetStatus>;
}
