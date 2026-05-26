# Meridian Project Status

**Last Updated:** 2026-05-26  
**Status:** ✅ READY FOR LOCAL TESTING

## Overview

Meridian is a South African public data platform that scrapes official government data (crime, Eskom, water, housing) and provides it as downloadable CSV/Excel files, feeding Power BI dashboards.

**Goal:** Portfolio piece demonstrating a complete data analyst pipeline (source → clean → visualize).

---

## Completed

### ✅ Backend (Next.js Fullstack)
- Complete REST API (`/api/files`, `/api/status`, `/api/download/:filename`)
- 4 scrapers (crime, eskom, water, housing)
- Dummy data seeded and ready (week 2026-w22)
- GitHub Actions workflow for weekly automation (Mondays 9 AM UTC)
- Error handling + status tracking
- File-based storage in `/data/` (version controlled)

### ✅ Frontend (Vite + React)
- Landing page with hero section + featured datasets
- Navbar with navigation
- Footer with links
- 4 page structure (Landing, Downloads, Dashboards, About)
- **Dark theme applied** (slate-950 background, clean brutalist aesthetic)
- Framer Motion page transitions
- API integration (calls backend, displays data)
- Responsive design (mobile-first)

### ✅ Integration
- Vite proxy configured (`/api/*` → localhost:3000)
- Both servers runnable with `npm run dev`
- Dummy data flows from backend to frontend automatically
- Hot reloading works for development

### ✅ Documentation
- `CLAUDE.md` — Architecture + development guidance
- `BACKEND.md` — API endpoint reference
- `LOCAL_SETUP.md` — How to run locally
- Memory system for future sessions
- GitHub repo with clean commit history

---

## What Still Needs Work

### 🔄 Medium Priority (Nice to Have)
- **Downloads page styling** — File browser table with CSV/Excel download buttons
- **Dashboards page styling** — Power BI dashboard card layout
- **About page styling** — FAQ section + project info
- **Remotion videos** — Animated data visualizations (optional)

### 📋 Lower Priority (Polish)
- Power BI dashboard links (you'll add these later)
- Advanced filtering on downloads page
- Dark mode toggle (currently always dark, no need to toggle)
- Advanced analytics charts

---

## How to Test Locally

```bash
cd c:\Meridian

# Install (if needed)
npm install

# Start both servers
npm run dev

# Open browser
# http://localhost:5173
```

**That's it.** The site should load with the landing page showing:
- Hero section (dark background, clean text)
- 4 featured datasets
- Status indicators showing all green
- Navigation to other pages

---

## What Happens While You're Gone (Next Month)

### 🤖 Automatic (No Action Needed)
- GitHub Actions runs every Monday at 9 AM UTC
- Fetches latest crime, Eskom, water, housing data
- Saves to `/data/` folder
- Auto-commits to repository
- Website will serve the latest files automatically

### 📊 For You to Do (When You Return)
1. Download latest CSV files
2. Add to Power BI → create dashboards
3. Publish dashboards to Power BI Service
4. Add links on the Dashboards page
5. Fine-tune Downloads page UI as needed

---

## Architecture at a Glance

```
Browser (localhost:5173)
    ↓ (HTTP requests)
Vite Dev Server (React + Framer Motion)
    ↓ (API calls via proxy)
Next.js Backend (localhost:3000)
    ├─ API routes (files, status, download)
    ├─ File discovery (/data/)
    └─ (GitHub Actions weekly triggers scrapers)
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Full architecture doc (read this first) |
| `src/App.tsx` | React router + page transitions |
| `src/app/api/` | Backend API routes |
| `src/pages/` | Page components |
| `src/components/` | Reusable components |
| `data/` | CSV/Excel files from scrapers |
| `.github/workflows/scrape-data.yml` | Weekly automation |
| `LOCAL_SETUP.md` | How to run locally |

---

## Tech Stack

- **Frontend:** Vite, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Next.js 14, Node.js
- **Data:** CSV/Excel files in `/data/`
- **Scraping:** Cheerio (HTML parsing), Puppeteer (if JS needed), pdf-parse
- **Automation:** GitHub Actions (free tier)
- **Hosting:** Ready for Vercel (frontend) + free backend tier

---

## Commit History (Recent)

```
5073f01 docs: add local development setup guide
aa7bd63 chore: add startup script and update package.json for dev servers
0613749 style: simplify UI to dark brutalist theme
baf0050 feat: complete Next.js backend with API endpoints and scrapers
0a62064 docs: add CLAUDE.md with project architecture and dev guidance
```

---

## Success Criteria (You're Ready If)

✅ `npm run dev` works without errors  
✅ Landing page loads at http://localhost:5173  
✅ Dark theme displays correctly  
✅ Navigation between pages works  
✅ API calls show in Network tab (browser dev tools)  
✅ GitHub Actions workflow is enabled  

---

## Next Session Checklist

When you return after Power BI certification:

- [ ] Run `npm run dev` — verify everything still works
- [ ] Check `/data/` folder — should have 4 weeks of real data
- [ ] Open Power BI → import latest CSV files
- [ ] Create dashboards
- [ ] Add links to Dashboards page
- [ ] Fine-tune Downloads page styling
- [ ] Deploy to production (Vercel)

---

## Support

- **Architecture questions?** → Read `CLAUDE.md`
- **API not working?** → Check `BACKEND.md`
- **Can't run locally?** → Check `LOCAL_SETUP.md`
- **Memory of context?** → Check memory files in `.claude/projects/c--Meridian/memory/`

---

**You're ready. Go take your Power BI exam. 💪**
