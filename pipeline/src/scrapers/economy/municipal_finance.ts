/**
 * municipal_finance.ts — Treasury Municipal Finance scraper
 *
 * Source: Treasury Municipal Money OLAP API
 *   https://municipaldata.treasury.gov.za/api/cubes/incexp/aggregate
 *
 * The `incexp` cube (Income & Expenditure) is huge — a country-wide aggregate
 * times out. Strategy (confirmed in recon): query PER MUNICIPALITY with a
 * year + item-label drilldown, which returns in seconds. We pull major metros
 * across available financial years (cube data spans ~2015–2019).
 */

import path from "path";
import { fetchJson } from "../../lib/http.js";
import { writeCsv, countCsvRows } from "../../lib/csv.js";
import { relPath } from "../../lib/paths.js";
import { today } from "../../lib/week.js";
import type { ScraperContext, ScraperResult } from "../../types.js";

const BASE = "https://municipaldata.treasury.gov.za/api/cubes/incexp/aggregate";

const METROS: { code: string; name: string; province: string }[] = [
  { code: "JHB", name: "City of Johannesburg", province: "Gauteng" },
  { code: "TSH", name: "City of Tshwane", province: "Gauteng" },
  { code: "EKU", name: "City of Ekurhuleni", province: "Gauteng" },
  { code: "CPT", name: "City of Cape Town", province: "Western Cape" },
  { code: "ETH", name: "eThekwini", province: "KwaZulu-Natal" },
  { code: "NMA", name: "Nelson Mandela Bay", province: "Eastern Cape" },
  { code: "BUF", name: "Buffalo City", province: "Eastern Cape" },
  { code: "MAN", name: "Mangaung", province: "Free State" },
];

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020];

interface AggregateCell {
  "financial_year_end.year": number;
  "item.label": string;
  "amount.sum": number | null;
}
interface AggregateResponse {
  cells: AggregateCell[];
  status: string;
}
interface MuniRow {
  Financial_Year: string;
  Municipality: string;
  Province: string;
  Item_Code: string;
  Item_Label: string;
  Budget_ZAR: string;
  Actual_ZAR: number | string;
  Audited_ZAR: string;
}

async function fetchMetro(code: string): Promise<AggregateCell[]> {
  const params = new URLSearchParams({
    aggregates: "amount.sum",
    cut: `demarcation.code:"${code}"`,
    drilldown: "financial_year_end.year|item.label",
    order: "financial_year_end.year:desc",
    page_size: "10000",
  });
  const res = await fetchJson<AggregateResponse>(`${BASE}?${params.toString()}`, { timeoutMs: 40000 });
  return res.cells ?? [];
}

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, dataDir, dataRoot, log } = ctx;

  try {
    log.info(`Fetching incexp for ${METROS.length} metros`);
    const rows: MuniRow[] = [];

    for (const metro of METROS) {
      try {
        const cells = await fetchMetro(metro.code);
        for (const c of cells) {
          const year = c["financial_year_end.year"];
          if (!YEARS.includes(year)) continue;
          rows.push({
            Financial_Year: String(year),
            Municipality: metro.name,
            Province: metro.province,
            Item_Code: "",
            Item_Label: c["item.label"],
            Budget_ZAR: "",
            Actual_ZAR: c["amount.sum"] ?? "",
            Audited_ZAR: "",
          });
        }
        log.info(`  ${metro.code}: ${cells.length} cells`);
      } catch (err) {
        log.warn(`  ${metro.code} failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    if (rows.length === 0) throw new Error("No municipal data returned from any metro");

    const historyPath = path.join(dataDir, `${spec.id}_history.csv`);
    rows.sort((a, b) =>
      b.Financial_Year.localeCompare(a.Financial_Year) ||
      a.Municipality.localeCompare(b.Municipality) ||
      a.Item_Label.localeCompare(b.Item_Label)
    );
    writeCsv(historyPath, rows as unknown as Record<string, unknown>[]);

    const rowCount = countCsvRows(historyPath);
    const rel = relPath(dataRoot, historyPath);
    log.info(`Wrote ${rowCount} rows → ${rel}`);

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
