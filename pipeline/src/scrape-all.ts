/**
 * scrape-all.ts — Meridian pipeline orchestrator
 *
 * Usage:
 *   npm run scrape                    # run all datasets
 *   npm run scrape -- --dataset sarb_monetary  # run one dataset
 *
 * Each scraper is loaded dynamically from scrapers/<category>/<id>.ts.
 * One failure never aborts the batch — errors are caught and recorded.
 * Exits 0 if at least one dataset succeeded; exits 1 only if ALL failed.
 */

import path from "path";
import fs from "fs";
import { DATASETS } from "./registry.js";
import { getDataRoot, datasetDir, ensureDir } from "./lib/paths.js";
import { readManifest, writeManifest, mergeDatasetFile, hasPeriod, hasHistory } from "./lib/manifest.js";
import { readStatus, writeStatus, mergeResult } from "./lib/status.js";
import { makeLogger } from "./lib/logger.js";
import { getWeekString, getQuarterString, getMonthString, getAnnualPeriod, today } from "./lib/week.js";
import type { ScraperContext, ScraperResult, DatasetSpec, ScraperMode } from "./types.js";

// ── arg parsing ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const singleDataset = args.includes("--dataset") ? args[args.indexOf("--dataset") + 1] : null;

// ── period for each cadence ───────────────────────────────────────────────────
function currentPeriod(spec: DatasetSpec): string {
  const now = new Date();
  switch (spec.cadence) {
    case "weekly":    return getWeekString(now);
    case "monthly":   return getMonthString(now);
    case "quarterly": return getQuarterString(now);
    case "annual":    return getAnnualPeriod(now);
  }
}

// ── scraper loader ────────────────────────────────────────────────────────────
async function loadScraper(spec: DatasetSpec): Promise<{ run: (ctx: ScraperContext) => Promise<ScraperResult> } | null> {
  const scraperPath = path.resolve(
    import.meta.dirname,
    "scrapers",
    spec.category,
    `${spec.id}.ts`
  );
  if (!fs.existsSync(scraperPath)) {
    return null; // scraper not built yet
  }
  // Dynamic import with .js extension for ESM resolution via tsx
  const mod = await import(`./scrapers/${spec.category}/${spec.id}.js`);
  return mod as { run: (ctx: ScraperContext) => Promise<ScraperResult> };
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  const dataRoot = getDataRoot();
  const log = makeLogger("orchestrator");

  log.info(`Data root: ${dataRoot}`);
  log.info(`Running ${singleDataset ? `single dataset: ${singleDataset}` : "all datasets"}`);

  ensureDir(dataRoot);

  const manifest = readManifest(dataRoot);
  const status = readStatus(dataRoot);

  const targets = singleDataset
    ? DATASETS.filter((d) => d.id === singleDataset)
    : DATASETS;

  if (targets.length === 0) {
    log.error(`No dataset found with id "${singleDataset}"`);
    process.exit(1);
  }

  const results: ScraperResult[] = [];

  for (const spec of targets) {
    const dsLog = makeLogger(spec.id);
    const period = currentPeriod(spec);
    const dir = datasetDir(dataRoot, spec.category, spec.id);
    ensureDir(dir);

    // Determine mode
    const mode: ScraperMode = hasHistory(manifest, spec.id) ? "incremental" : "history";

    // Idempotency — skip if period already written (incremental only)
    if (mode === "incremental" && hasPeriod(manifest, spec.id, period)) {
      dsLog.info(`Period ${period} already in manifest — skipping (idempotent)`);
      const skipResult: ScraperResult = {
        id: spec.id, success: true, rowsWritten: 0,
        filesWritten: [], skipped: true, error: null,
        lastUpdated: status.datasets[spec.id]?.last_updated ?? null,
      };
      results.push(skipResult);
      mergeResult(status, skipResult);
      continue;
    }

    const ctx: ScraperContext = {
      spec, dataRoot, dataDir: dir, period, mode, log: dsLog,
    };

    dsLog.info(`mode=${mode} period=${period}`);

    let result: ScraperResult;
    try {
      const scraper = await loadScraper(spec);

      if (!scraper) {
        // Scraper not yet built — skip gracefully
        dsLog.warn(`Scraper not yet implemented — skipping`);
        result = {
          id: spec.id, success: false, rowsWritten: 0,
          filesWritten: [], skipped: true,
          error: "Scraper not yet implemented",
          lastUpdated: null,
        };
      } else {
        result = await scraper.run(ctx);
        if (result.success) {
          dsLog.info(`✓ ${result.rowsWritten} rows → ${result.filesWritten.join(", ")}`);
        } else if (result.skipped) {
          dsLog.info(`↷ skipped — ${result.error ?? "no new data"}`);
        } else {
          dsLog.warn(`✗ failed — ${result.error}`);
        }
      }
    } catch (err) {
      dsLog.error("Unhandled error — keeping last-good data", err);
      result = {
        id: spec.id, success: false, rowsWritten: 0,
        filesWritten: [], skipped: false,
        error: err instanceof Error ? err.message : String(err),
        lastUpdated: null,
      };
    }

    results.push(result);
    mergeResult(status, result);

    // Update manifest for successful writes
    if (result.success && !result.skipped && result.filesWritten.length > 0) {
      for (const relFile of result.filesWritten) {
        const isHistory = relFile.includes("_history.");
        mergeDatasetFile(manifest, spec.id, {
          period: isHistory ? "history" : period,
          date: today(),
          rows: result.rowsWritten,
          csv: relFile,
        }, isHistory);
      }
    }
  }

  // Write manifest + status atomically
  writeManifest(dataRoot, manifest);
  writeStatus(dataRoot, status);

  // Summary
  const succeeded = results.filter((r) => r.success && !r.skipped).length;
  const skipped   = results.filter((r) => r.skipped).length;
  const failed    = results.filter((r) => !r.success && !r.skipped).length;

  log.info(`\n── Summary ────────────────────────────────`);
  log.info(`✓ Succeeded: ${succeeded}  ↷ Skipped: ${skipped}  ✗ Failed: ${failed}`);

  if (failed > 0) {
    for (const r of results.filter((r) => !r.success && !r.skipped)) {
      log.warn(`  ${r.id}: ${r.error}`);
    }
  }

  // Exit non-zero only if ALL ran targets failed (not counting skipped)
  const ran = results.filter((r) => !r.skipped);
  if (ran.length > 0 && ran.every((r) => !r.success)) {
    log.error("All scrapers failed");
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[orchestrator] Fatal:", err);
  process.exit(1);
});
