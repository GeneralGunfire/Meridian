/**
 * http.ts — shared fetch helpers for scrapers.
 *
 * Some SA government endpoints present TLS certificate chains that Node can't
 * verify in certain CI/sandbox environments (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
 * Set MERIDIAN_INSECURE_TLS=1 to relax verification for those hosts.
 * In normal CI (GitHub Actions) the default CA bundle works, so leave it off.
 */

import https from "https";
import { Agent, setGlobalDispatcher } from "undici";

if (process.env.MERIDIAN_INSECURE_TLS === "1") {
  setGlobalDispatcher(new Agent({ connect: { rejectUnauthorized: false } }));
}

/**
 * downloadBuffer — robust binary downloader using Node's native https module.
 * Follows redirects (up to 5 hops), always disables TLS verification when
 * MERIDIAN_INSECURE_TLS=1. Use this for large file downloads from SA govt sites
 * where undici's fetch silently hangs on certain TLS configurations.
 */
export function downloadBuffer(url: string, timeoutMs = 120000): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const insecure = process.env.MERIDIAN_INSECURE_TLS === "1";
    let hops = 0;

    function get(target: string) {
      if (hops++ > 5) return reject(new Error(`Too many redirects for ${url}`));
      const opts = {
        headers: { "User-Agent": "Meridian-Pipeline/1.0" },
        rejectUnauthorized: !insecure,
      };
      const req = https.get(target, opts, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.destroy();
          return get(new URL(res.headers.location, target).href);
        }
        if (res.statusCode && res.statusCode >= 400) {
          res.destroy();
          return reject(new Error(`HTTP ${res.statusCode} downloading ${target}`));
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      });
      req.on("error", reject);
      req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error(`Timeout downloading ${target}`)); });
    }
    get(url);
  });
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
