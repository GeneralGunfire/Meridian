import fs from "fs";
import path from "path";
import type { StatusFile, ScraperResult } from "../types.js";

export function readStatus(dataRoot: string): StatusFile {
  const p = path.join(dataRoot, "status.json");
  if (!fs.existsSync(p)) {
    return { generatedAt: new Date().toISOString(), datasets: {} };
  }
  return JSON.parse(fs.readFileSync(p, "utf-8")) as StatusFile;
}

/** Atomically write status.json */
export function writeStatus(dataRoot: string, status: StatusFile): void {
  status.generatedAt = new Date().toISOString();
  const p = path.join(dataRoot, "status.json");
  const tmp = p + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(status, null, 2) + "\n");
  fs.renameSync(tmp, p);
}

/** Merge a scraper result into the status file */
export function mergeResult(status: StatusFile, result: ScraperResult): void {
  status.datasets[result.id] = {
    success: result.success,
    last_updated: result.lastUpdated,
    error: result.error,
    skipped: result.skipped,
  };
}
