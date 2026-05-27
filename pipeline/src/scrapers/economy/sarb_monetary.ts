/**
 * sarb_monetary.ts — SARB monetary & banking data scraper
 *
 * Source: SARB Web API (https://custom.resbank.co.za/SarbWebApi/)
 * Confirmed live endpoints (recon 2026-05):
 *   - WebIndicators/HomePageRates         → CPI (CPI1000F), repo (MMRD002A), prime (MMRD000A)
 *   - WebIndicators/HistoricalExchangeRatesDaily → ZAR/USD (EXCX135D), ZAR/GBP (EXCZ001D), ZAR/EUR (EXCZ002D)
 *
 * NOTE: The public API returns CURRENT snapshots, not deep history. We use a
 * snapshot-and-accumulate model: each run captures the latest values as one
 * dated row appended to <id>_history.csv. Depth builds over time.
 */

import path from "path";
import fs from "fs";
import { fetchJson } from "../../lib/http.js";
import { readCsv, writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

const BASE = "https://custom.resbank.co.za/SarbWebApi/WebIndicators";

interface SarbRate {
  Name: string;
  TimeseriesCode: string;
  Date: string;
  Value: number;
}

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

async function fetchSnapshot(): Promise<SarbRow> {
  const [homeRates, exchangeRates] = await Promise.all([
    fetchJson<SarbRate[]>(`${BASE}/HomePageRates`),
    fetchJson<SarbRate[]>(`${BASE}/HistoricalExchangeRatesDaily`),
  ]);

  const byCode = new Map<string, SarbRate>();
  for (const r of [...homeRates, ...exchangeRates]) byCode.set(r.TimeseriesCode, r);

  const val = (code: string): number | string => byCode.get(code)?.Value ?? "";
  const rowDate = byCode.get("MMRD002A")?.Date ?? today();

  return {
    Date: rowDate,
    Repo_Rate_Pct: val("MMRD002A"),
    Prime_Rate_Pct: val("MMRD000A"),
    CPI_Pct: val("CPI1000F"),
    M3_ZAR_Millions: "",
    Credit_Extension_ZAR_Millions: "",
    ZAR_USD: val("EXCX135D"),
    ZAR_EUR: val("EXCZ002D"),
    ZAR_GBP: val("EXCZ001D"),
  };
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;

  try {
    log.info("Fetching SARB snapshot (HomePageRates + exchange rates)");
    const snapshot = await fetchSnapshot();
    log.info(`Snapshot ${snapshot.Date}: repo=${snapshot.Repo_Rate_Pct} prime=${snapshot.Prime_Rate_Pct} usd=${snapshot.ZAR_USD}`);

    const historyPath = path.join(dataDir, `${spec.id}_history.csv`);
    let rows: SarbRow[] = [];
    if (fs.existsSync(historyPath)) {
      rows = readCsv(historyPath) as unknown as SarbRow[];
    }

    if (rows.some((r) => r.Date === snapshot.Date)) {
      log.info(`Date ${snapshot.Date} already in history — no new data`);
      return {
        id: spec.id, success: true, rowsWritten: countCsvRows(historyPath),
        filesWritten: [], skipped: true, error: null, lastUpdated: today(),
      };
    }

    rows.push(snapshot);
    rows.sort((a, b) => String(a.Date).localeCompare(String(b.Date)));
    writeCsv(historyPath, rows as unknown as Record<string, unknown>[]);

    const rowCount = countCsvRows(historyPath);
    const rel = relPath(dataRoot, historyPath);
    log.info(`Appended snapshot → ${rel} (${rowCount} total rows)`);

    return {
      id: spec.id, success: true, rowsWritten: rowCount,
      filesWritten: [rel], skipped: false, error: null, lastUpdated: today(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Failed: ${msg}`);
    return {
      id: spec.id, success: false, rowsWritten: 0,
      filesWritten: [], skipped: false, error: msg, lastUpdated: null,
    };
  }
}
