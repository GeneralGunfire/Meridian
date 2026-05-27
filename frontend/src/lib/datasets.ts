/**
 * datasets.ts — shared TypeScript types for the Meridian data API
 * and client-side data fetching helpers.
 */

// ── API Response Types ────────────────────────────────────────────────────────

export interface FileRelease {
  period: string;        // e.g. "2026-w22", "2026-q1", "2025"
  date: string;          // ISO date of publication/scrape
  rows: number;
  csv_url: string;       // "/api/download/economy/tax_revenue/tax_revenue_2025.csv"
  xlsx_url: string;      // same path but .xlsx — generated on the fly
}

export interface ColumnInfo {
  name: string;
  label: string;
  unit: string;
}

export interface DatasetEntry {
  id: string;
  label: string;
  description: string;
  grain: string;
  source: string;
  sourceUrl: string;
  method: "api" | "parse" | "scrape" | "manual";
  cadence: "weekly" | "monthly" | "quarterly" | "annual";
  columns: ColumnInfo[];
  color: string;
  badgeColor: string;
  files: FileRelease[];          // most recent first
  history?: FileRelease;         // consolidated long-form history file (if present)
}

export interface CategoryGroup {
  id: string;
  label: string;
  description: string;
  datasets: DatasetEntry[];
}

export interface FilesResponse {
  generatedAt: string;
  categories: CategoryGroup[];
}

// ── Status Types ──────────────────────────────────────────────────────────────

export interface DatasetStatus {
  success: boolean;
  last_updated: string | null;
  error: string | null;
  skipped?: boolean;   // true = no new period this run (quarterly/annual on weekly cron)
}

export interface StatusResponse {
  generatedAt: string;
  datasets: Record<string, DatasetStatus>;
}

// ── Client fetch helpers ──────────────────────────────────────────────────────

export async function fetchFiles(): Promise<FilesResponse> {
  const res = await fetch("/api/files");
  if (!res.ok) throw new Error(`/api/files returned ${res.status}`);
  return res.json();
}

export async function fetchStatus(): Promise<StatusResponse> {
  const res = await fetch("/api/status");
  if (!res.ok) throw new Error(`/api/status returned ${res.status}`);
  return res.json();
}
