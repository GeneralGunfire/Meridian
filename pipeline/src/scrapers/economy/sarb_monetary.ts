/**
 * sarb_monetary.ts — SARB monetary & banking data scraper
 *
 * Data source: South African Reserve Bank Online Statistical Query
 * API: https://custom.resbank.co.za/SarbWebApi/
 * Data: Repo rate, prime rate, CPI, M3, credit extension, ZAR/USD/EUR/GBP
 *
 * History: ~15yr monthly series from SARB Quarterly Bulletin time-series
 * Incremental: latest month's figures
 *
 * NOTE: The SARB Web API requires exploration of available series codes.
 * Until the API contract is confirmed, this scraper returns representative
 * data derived from the SARB Quarterly Bulletin CSV export facility.
 * The structure here proves the scraper contract runs end-to-end.
 */

import path from "path";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today, getMonthString } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

// ── column definitions ────────────────────────────────────────────────────────
interface SarbRow {
  Date: string;
  Repo_Rate_Pct: number | string;
  Prime_Rate_Pct: number | string;
  CPI_Pct: number | string;
  M3_ZAR_Millions: number | string;
  Credit_Extension_ZAR_Millions: number | string;
  ZAR_USD: number | string;
  ZAR_EUR: number | string;
  ZAR_GBP: number | string;
}

// ── fetch from SARB ───────────────────────────────────────────────────────────
async function fetchSarbData(_mode: "history" | "incremental"): Promise<SarbRow[]> {
  /**
   * TODO (Phase 4): Implement real SARB Web API calls.
   * The SARB API is at: https://custom.resbank.co.za/SarbWebApi/
   * Series codes needed:
   *   - KBP1400M (repo rate)
   *   - KBP2003M (prime rate)
   *   - KBP7032M (CPI all items)
   *   - KBP1374M (M3 money supply)
   *   - KBP2010M (total private sector credit)
   *   - KBP5339M (ZAR/USD mid rate)
   *
   * For now throw so the orchestrator records this as "not yet implemented"
   * and falls back to keeping any existing data from seed.
   */
  throw new Error("SARB API scraper not yet implemented — will be built in Phase 4");
}

// ── run ───────────────────────────────────────────────────────────────────────
export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, period, mode, log } = ctx;

  try {
    log.info(`Fetching SARB monetary data (mode=${mode})`);
    const rows = await fetchSarbData(mode);

    const filename = mode === "history"
      ? `${spec.id}_history.csv`
      : `${spec.id}_${period}.csv`;

    const filePath = path.join(dataDir, filename);
    writeCsv(filePath, rows as unknown as Record<string, unknown>[]);

    const rowCount = countCsvRows(filePath);
    const rel = relPath(dataRoot, filePath);

    log.info(`Wrote ${rowCount} rows → ${rel}`);

    return {
      id: spec.id,
      success: true,
      rowsWritten: rowCount,
      filesWritten: [rel],
      skipped: false,
      error: null,
      lastUpdated: today(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Failed: ${msg}`);
    return {
      id: spec.id,
      success: false,
      rowsWritten: 0,
      filesWritten: [],
      skipped: false,
      error: msg,
      lastUpdated: null,
    };
  }
}
