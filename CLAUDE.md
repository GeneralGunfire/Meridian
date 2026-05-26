# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Meridian** is a data pipeline platform that:
1. Scrapes official SA government data (crime, Eskom, water, housing) weekly via GitHub Actions
2. Stores raw data as CSV/Excel files (version controlled, historical)
3. Provides website file browser for downloading datasets
4. Feeds cleaned data into Power BI dashboards for portfolio
5. Uses Remotion for animated video explainers of trends

**Goal:** Portfolio piece demonstrating full data analyst pipeline (source → transform → visualize) while building practical, useful SA data assets.

**Developer:** Tessyc (tessyc@mweb.co.za) — Power BI certification in ~1 month, targeting part-time data analyst role.

**Constraints:** Free tier only, local file storage, weekly automation.

---

## Architecture & Structure

### Data Flow
```
GitHub Actions (Weekly) → Scrapers → CSV/Excel Files (versioned in /data/)
                                          ↓
                                    Website (Browse/Download)
                                          ↓
                                    Manual: You → Power BI → Dashboards
```

### Key Directories
- **`/backend`** — Node.js scrapers, API routes for downloads
  - `/backend/scrapers/` — Individual scrapers (crime, eskom, water, housing)
  - `/backend/routes/` — Express API endpoints
  - `/backend/server.js` — Main Express app
- **`/frontend`** — React/Next.js website
  - `/frontend/src/components/` — File browser, error states, animations
  - `/frontend/src/compositions/` — Remotion video compositions
  - `/frontend/src/pages/` — Download page, dashboard links
- **`/data/`** — Version-controlled raw CSV/Excel files
  - Organized by dataset (crime_stats/, eskom/, water/, housing/)
  - Named: `[dataset]_2026-w21.csv` (ISO week numbering)
- **`.github/workflows/`** — GitHub Actions scheduler
  - `scrape-data.yml` — Weekly trigger for all scrapers

### Data Sources (Official, Reliable)
| Dataset | Source | Format | Frequency |
|---------|--------|--------|-----------|
| **Crime Stats** | https://www.saps.gov.za/services/crimestats.php | Excel/PDF quarterly | Quarterly |
| **Eskom** | https://loadshedding.eskom.co.za/ or Data Portal | Real-time + historical | Real-time |
| **Water/Sanitation** | https://www.statssa.gov.za/?cat=26 | PDF reports (GHS) | Annual |
| **Housing** | https://www.statssa.gov.za/publications/ | PDF/GHS reports | Annual |

### CSV Structure (Standardized)
**Crime Stats:** `Date (YYYY-W##) | Province | Crime_Type | Count | Year_Quarter`
**Eskom:** `Date | Stage (0-6) | Duration_Hours | Province | Year_Week`
**Water:** `Municipality | Water_Supply_% | Date_Year | Sanitation_Access_%`
**Housing:** `Year | Total_Households | Formal_Dwellings_% | Electricity_% | Water_Access_%`

---

## Tech Stack

**Frontend:**
- React or Next.js (decision: fullstack Next.js for API routes)
- Framer Motion (animations, transitions)
- Remotion (video composition + rendering)
- Tailwind CSS (styling)
- Recharts (data preview visualizations)

**Backend:**
- Node.js + Express
- Cheerio (HTML parsing)
- Puppeteer (browser automation if needed)
- pdf-parse (extract tables from PDFs)
- GitHub Actions (scheduler, no paid services)

**Data Storage:** File-based (CSV/Excel in `/data/` folder, versioned in Git)

---

## Common Commands

```bash
# Install dependencies
npm install

# Local development (frontend + backend together)
npm run dev

# Backend only
npm run dev:backend

# Run scrapers manually (test or on-demand)
node backend/scrapers/scrape-all.js

# Test single scraper
node backend/scrapers/crime-scraper.js

# Remotion preview (video compositions)
npx remotion preview

# Render Remotion video
npx remotion render [composition-name] output.mp4

# Build for production
npm run build

# Lint/format
npm run lint
```

---

## Development Patterns

### Adding a New Scraper
1. Create `/backend/scrapers/[dataset]-scraper.js`
2. Export async function that returns array of objects
3. Import in `/backend/scrapers/scrape-all.js`
4. Scraper should handle errors gracefully (log, don't throw)
5. Output to `/data/[dataset]/[dataset]_YYYY-Wxx.csv`

### Building Download API
- Express route in `/backend/routes/downloads.js`
- Scan `/data/` folders for available files
- Return metadata (filename, size, week, date)
- Serve files statically

### Creating Remotion Videos
- Composition file in `/frontend/src/compositions/[name].jsx`
- Export React component that takes data as props
- Use Remotion's `<Sequence>` for animations
- Render via CLI or embed in website

### Error Handling
- Scrapers should **never** crash silently
- Log errors to `/logs/` folder
- Website shows error state: "Data unavailable this week"
- Previous week's data remains downloadable

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

✅ **Data Sources:** Crime (SAPS), Eskom (loadshedding.eskom.co.za), Water (StatsSA), Housing (GHS reports) — all official government sources  
✅ **Scraping:** HTML scrapers via Cheerio/Puppeteer, weekly via GitHub Actions  
✅ **Storage:** Local file-based in `/data/`, versioned in Git  
✅ **Updates:** Weekly refresh, files accumulate (not replaced)  
✅ **Download Formats:** CSV + Excel  
✅ **Power BI:** External links to dashboards (for now)  
✅ **Animations:** Framer Motion + Remotion for videos  
✅ **Hosting:** Free tier (GitHub Actions, Vercel/Render later)  

**Pending User Decision:**
- [ ] Next.js vs React?
- [ ] Power BI Service embedding strategy?
- [ ] CSV column names finalized?

---

## Autonomy Notes for Claude Code

- **You can work independently** on scrapers, file structure, error handling
- **Don't ask about placement** — use the directory structure above
- **Use GitHub Actions immediately** — weekly scheduler is part of MVP
- **Handle errors visually** — users see status page, not crashes
- **Commit early and often** — atomic commits with clear messages
- **Reference memory files** — `/memory/data_sources.md`, `/memory/tech_stack.md` for detailed context
