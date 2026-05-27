/**
 * http.ts — shared fetch helpers for scrapers.
 *
 * Some SA government endpoints present TLS certificate chains that Node can't
 * verify in certain CI/sandbox environments (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
 * Set MERIDIAN_INSECURE_TLS=1 to relax verification for those hosts.
 * In normal CI (GitHub Actions) the default CA bundle works, so leave it off.
 */

import { Agent, setGlobalDispatcher } from "undici";

if (process.env.MERIDIAN_INSECURE_TLS === "1") {
  setGlobalDispatcher(new Agent({ connect: { rejectUnauthorized: false } }));
}

export interface FetchJsonOptions {
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export async function fetchJson<T = unknown>(url: string, opts: FetchJsonOptions = {}): Promise<T> {
  const { timeoutMs = 30000, retries = 2, headers = {} } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json", "User-Agent": "Meridian-Pipeline/1.0", ...headers },
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
