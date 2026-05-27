# Meridian

A data pipeline platform for official South African government statistics — crime, energy, economy, and social indicators. Scrapes official sources, versions the raw data in git, serves it for download, and feeds Power BI dashboards.

## Architecture

```
GitHub Actions (weekly) → pipeline/ scrapers → CSV files in data/ (git-versioned)
                                                      ↓
                                          frontend/ (Next.js) — browse & download
                                                      ↓
                                          Power BI dashboards (portfolio)
```

- **`frontend/`** — Next.js 16 (App Router) website + data API route handlers. The canonical app.
- **`pipeline/`** — Node + TypeScript scrapers (API / PDF-Excel parse / HTML scrape) for ~15 datasets.
- **`data/`** — git-versioned CSV files, organized `data/<category>/<dataset>/`. Single source of truth.
- **`.github/workflows/`** — weekly scrape scheduler.

## Datasets (15 across 4 categories)

- **Economy** — tax revenue (SARS), budget & spending (Treasury vulekamali), GDP/macro (StatsSA), monetary (SARB), municipal finance (Treasury)
- **Energy** — Eskom power supply/demand, infrastructure, spending, revenue
- **Social** — water & sanitation, housing, unemployment (StatsSA)
- **Safety** — crime statistics (SAPS)

## Run locally

```bash
# Website (Next.js)
cd frontend && npm install && npm run dev    # http://localhost:3000

# Run scrapers
cd pipeline && npm install && npm run scrape
```

## License

Data sourced from official SA government publications. See individual dataset sources for terms.
