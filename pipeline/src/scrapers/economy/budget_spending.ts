/**
 * budget_spending.ts — National Treasury budget & spending scraper
 *
 * Source: Treasury Vulekamali budget data portal (vulekamali.gov.za)
 *
 * STATUS: endpoint recon incomplete. Vulekamali's public site pages 404 for the
 * documented API paths; the underlying data is served by an OpenSpending /
 * CKAN datastore (openspending-dedicated.vulekamali.gov.za) that did not
 * respond from the recon environment. The Babbage/OpenSpending cube API shape
 * is roughly:
 *   GET <host>/api/3/cubes/<cube>/aggregate?drilldown=...&cut=...
 * with a fiscal-data-package model defining department / economic-classification
 * / financial-year dimensions and a budget-phase amount measure.
 *
 * TODO (follow-up): confirm the live OpenSpending host + cube name, then mirror
 * the municipal_finance approach (per-department drilldown by financial year).
 * Until then this returns a clean "not yet implemented" so the orchestrator
 * records it without crashing the batch.
 */

import type { ScraperContext, ScraperResult } from "../../types.js";

export async function run(ctx: ScraperContext): Promise<ScraperResult> {
  const { spec, log } = ctx;
  log.warn("Vulekamali API endpoint not yet confirmed — skipping (see file header)");
  return {
    id: spec.id,
    success: false,
    rowsWritten: 0,
    filesWritten: [],
    skipped: true,
    error: "Vulekamali/OpenSpending API endpoint not yet confirmed",
    lastUpdated: null,
  };
}
