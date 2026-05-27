/**
 * registry.ts — the pipeline's copy of the 15-dataset universe.
 * Kept in sync with frontend/src/lib/registry.ts manually.
 * The orchestrator uses this to discover scrapers and build context.
 */

import type { DatasetSpec, CategoryId } from "./types.js";

export const DATASETS: DatasetSpec[] = [
  // ── ECONOMY ─────────────────────────────────────────────────────────────────
  { id: "tax_revenue",       category: "economy", label: "Tax Revenue",             source: "SARS",                      method: "parse",  cadence: "annual"    },
  { id: "budget_spending",   category: "economy", label: "Budget & Spending",       source: "Treasury Vulekamali",       method: "api",    cadence: "annual"    },
  { id: "gdp_macro",         category: "economy", label: "GDP & Macro",             source: "StatsSA P0441",             method: "parse",  cadence: "quarterly" },
  { id: "sarb_monetary",     category: "economy", label: "Monetary & Banking",      source: "SARB",                      method: "api",    cadence: "monthly"   },
  { id: "municipal_finance", category: "economy", label: "Municipal Finance",       source: "Treasury Municipal API",    method: "api",    cadence: "annual"    },
  // ── ENERGY ───────────────────────────────────────────────────────────────────
  { id: "eskom_power",          category: "energy", label: "Power Supply & Demand",    source: "Eskom Data Portal", method: "scrape", cadence: "weekly"  },
  { id: "eskom_infrastructure", category: "energy", label: "Generation Infrastructure", source: "Eskom Data Portal", method: "scrape", cadence: "weekly"  },
  { id: "eskom_spending",       category: "energy", label: "Eskom Spending",            source: "Eskom Annual Report", method: "manual", cadence: "annual" },
  { id: "eskom_revenue",        category: "energy", label: "Eskom Revenue",             source: "Eskom Annual Report", method: "manual", cadence: "annual" },
  // ── SOCIAL ───────────────────────────────────────────────────────────────────
  { id: "water",        category: "social", label: "Water & Sanitation",  source: "StatsSA GHS",     method: "parse", cadence: "annual"    },
  { id: "housing",      category: "social", label: "Housing",             source: "StatsSA GHS",     method: "parse", cadence: "annual"    },
  { id: "unemployment", category: "social", label: "Unemployment (QLFS)", source: "StatsSA P0211",   method: "parse", cadence: "quarterly" },
  // ── SAFETY ───────────────────────────────────────────────────────────────────
  { id: "crime_stats", category: "safety", label: "Crime Statistics", source: "SAPS", method: "parse", cadence: "quarterly" },
];

export const DATASET_MAP = new Map<string, DatasetSpec>(DATASETS.map((d) => [d.id, d]));
export const CATEGORIES: CategoryId[] = ["economy", "energy", "social", "safety"];
