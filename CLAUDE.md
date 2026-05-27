# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Meridian** is a data pipeline platform that:
1. Scrapes official SA government data (~15 datasets across economy, energy, social, safety) weekly via GitHub Actions
2. Stores raw data as CSV files (version controlled, historical; XLSX generated on download)
3. Provides website catalog for browsing and downloading datasets
4. Feeds cleaned data into Power BI dashboards for portfolio
5. (Future) Uses Remotion for animated video explainers of trends — out of current scope

**Goal:** Portfolio piece demonstrating full data analyst pipeline (source → transform → visualize) while building practical, useful SA data assets.

**Developer:** Tessyc (tessyc@mweb.co.za) — Power BI certification in ~1 month, targeting part-time data analyst role.

**Constraints:** Free tier only, local file storage, weekly automation.

---

## Architecture & Structure

### Data Flow
```
GitHub Actions (Weekly) → pipeline/ scrapers → CSV Files (versioned in data/<category>/<dataset>/)
                                                      ↓
                                          frontend/ Next.js (Browse/Download via /api)
                                                      ↓
                                          Manual: You → Power BI → Dashboards
```

### Key Directories
> **IMPORTANT:** The canonical app is `frontend/` (Next.js 16 App Router). There is NO `/backend` dir — the data API is Next.js route handlers inside `frontend/src/app/api/`. The old Vite+Express app (`code/`, root `server.ts`) was deleted. ⚠️ `frontend/AGENTS.md` warns Next.js 16 has breaking changes vs training data — read `frontend/node_modules/next/dist/docs/` before writing Next code.

- **`frontend/`** — Next.js 16 (App Router) website + data API
  - `frontend/src/app/` — routes (`/`, `/download`) + `api/` route handlers (files, status, download)
  - `frontend/src/components/sections/` — page sections (hero, dataset-grid, features, etc.)
  - `frontend/src/components/ui/` — reusable primitives (particle-field, macbook-scroll, scroll-reveal-3d)
- **`pipeline/`** — Node + TypeScript scrapers (heavy deps isolated here)
  - `pipeline/src/scrape-all.ts` — orchestrator; `registry.ts` — the 15-dataset universe; `types.ts` — scraper contract
  - `pipeline/src/scrapers/<category>/` — one module per dataset, each exports `run(ctx)`
- **`data/`** — git-versioned CSV (single source of truth)
  - Organized `data/<category>/<dataset>/<dataset>_<period>.csv` + `<dataset>_history.csv`
  - `manifest.json` (machine catalog) + `status.json` (per-dataset health)
- **`.github/workflows/scrape-data.yml`** — weekly scrape scheduler (Node 20, runs pipeline/)

### Data Sources (Official, Reliable) — 15 datasets, 4 categories
| Category | Dataset | Source | Access | Cadence |
|----------|---------|--------|--------|---------|
| Economy | tax_revenue | SARS | PDF/Excel parse | Annual |
| Economy | budget_spending | Treasury vulekamali | JSON API | Annual |
| Economy | gdp_macro | StatsSA (P0441) | Excel parse | Quarterly |
| Economy | sarb_monetary | SARB Web API | JSON API | Monthly |
| Economy | municipal_finance | Treasury municipaldata | OLAP cubes API | Annual |
| Energy | eskom_power | Eskom Data Portal | HTML scrape | Weekly |
| Energy | eskom_infrastructure | Eskom Data Portal | HTML scrape | Weekly |
| Energy | eskom_spending | Eskom (gated) | Manual drop-in | Annual |
| Energy | eskom_revenue | Eskom (gated) | Manual drop-in | Annual |
| Social | water | StatsSA GHS | PDF/Excel parse | Annual |
| Social | housing | StatsSA GHS | PDF/Excel parse | Annual |
| Social | unemployment | StatsSA QLFS (P0211) | Excel parse | Quarterly |
| Safety | crime_stats | SAPS | Excel/PDF parse | Quarterly |

### Storage conventions
- Period token generalizes ISO week: weekly = `2026-w22`, quarterly = `2026-q1`, annual = `2025`.
- Deep history (~15yr cap) lives once in `<dataset>_history.csv`; weekly runs append small per-period files incrementally (idempotent — re-running a period is a no-op).
- Commit CSV only; XLSX is generated on-the-fly by the download handler. Never commit `.xlsx`.

---

## Tech Stack

**Frontend + API (`frontend/`):**
- Next.js 16 (App Router) — pages + data API via route handlers
- Motion / Framer Motion (animations, scroll effects)
- Tailwind CSS v4 (styling)
- exceljs (on-the-fly CSV→XLSX in the download handler)

**Pipeline (`pipeline/`):**
- Node + TypeScript (run via `tsx`)
- cheerio (HTML parsing), playwright (JS-rendered pages, fallback)
- pdf-parse + exceljs + adm-zip (PDF/Excel/zip extraction)
- csv-parse / csv-stringify (CSV I/O), zod (validate parsed rows)
- GitHub Actions (scheduler, no paid services)

**Data Storage:** File-based (CSV in `data/`, versioned in Git)

---

## Common Commands

```bash
# Install dependencies
# Website (Next.js) — http://localhost:3000
cd frontend && npm install && npm run dev

# Website lint / typecheck
cd frontend && npm run lint

# Run all scrapers (orchestrator)
cd pipeline && npm install && npm run scrape

# Seed dummy data into the data/ layout (testing)
node scripts/seed-data.js
```

---

## Development Patterns

### Adding a New Scraper
1. Create `pipeline/src/scrapers/<category>/<dataset>.ts`
2. Export `async function run(ctx: ScraperContext): Promise<ScraperResult>` (the contract in `pipeline/src/types.ts`)
3. Register the dataset in `pipeline/src/registry.ts`
4. Handle errors gracefully — return `{success:false, error}`, never throw; keep last-good data on failure
5. Output to `data/<category>/<dataset>/<dataset>_<period>.csv`; honor `ctx.mode` (history vs incremental)

### The Data API (Next.js route handlers in `frontend/src/app/api/`)
- `GET /api/files` — categories → datasets → file releases (reads `data/manifest.json` + registry)
- `GET /api/status` — per-dataset health (reads `data/status.json`)
- `GET /api/download/[...path]` — streams CSV from disk; `.xlsx` converted on the fly. Sanitize paths (traversal guard) + validate against registry.

### Error Handling
- Scrapers should **never** crash the batch — log, record failure in `status.json`, keep last-good data
- `status.json` distinguishes `skipped` (no new period for quarterly/annual data) vs `failed`
- Website shows per-dataset status; previous releases remain downloadable

---

## Git Workflow

**Commit Format:**
```
feat: add crime stats scraper with error handling
fix: handle missing Eskom data in weekly refresh
refactor: consolidate CSV writing utility
docs: update data source URLs
```

**Files to Always Commit:**
- Code changes (scrapers, frontend, routes)
- New data files (CSV/Excel in `/data/`)
- GitHub Actions workflows
- Configuration files

**Files to Never Commit:**
- `.env` or secrets (use `.env.example`)
- `node_modules/`
- Build outputs (`/dist/`, `/build/`)
- Logs (if large)

---

## Key Decision Points (Confirmed)

✅ **Scope:** ~15 datasets across Economy / Energy / Social / Safety (see table above)  
✅ **Framework:** Next.js 16 (App Router) — one app, data API via route handlers  
✅ **Scraping:** mixed — JSON APIs (Treasury, SARB), PDF/Excel parse (SARS, StatsSA, SAPS), HTML scrape (Eskom), manual drop-in (gated Eskom financials)  
✅ **Storage:** file-based CSV in `data/<category>/<dataset>/`, versioned in Git  
✅ **History:** deep history capped ~15yr in `_history.csv`, then incremental weekly append  
✅ **Download Formats:** CSV committed; XLSX generated on the fly (never committed)  
✅ **Power BI:** external links to dashboards (for now)  
✅ **Hosting:** free tier (GitHub Actions, Vercel later)  
✅ **Remotion videos:** out of current scope  

---

## Autonomy Notes for Claude Code

- **You can work independently** on scrapers, file structure, error handling
- **Don't ask about placement** — use the directory structure above
- **Read `frontend/node_modules/next/dist/docs/` before writing Next.js code** — Next 16 has breaking changes vs training data (per `frontend/AGENTS.md`)
- **Handle errors gracefully** — scrapers record status, never crash the batch; users see per-dataset status
- **Commit early and often** — atomic commits with clear messages
- **Reference memory files** — auto-memory in `C:\Users\Gener\.claude\projects\c--Meridian\memory\` for detailed context
