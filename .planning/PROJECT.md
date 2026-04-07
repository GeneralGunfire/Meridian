# Meridian — Data Intelligence Portal

## What This Is

Meridian is a personal data intelligence portal and Power BI portfolio site built by Raj. It serves as a professional-grade daily market research tool pulling live global and South African market data, and doubles as a public portfolio where Power BI reports built from that data are published, embedded, and downloadable. The site is built with Next.js, shadcn/ui, Tailwind CSS, and TypeScript, hosted on Netlify for free.

## Core Value

A daily-use market research tool that automatically feeds Raj's Power BI pipeline — live data exports to CSV, gets analysed in Power BI Desktop, and the resulting reports publish back to the same site.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Professional dark-themed landing page with hero, logo cloud, feature list, animated icons, and CTA sections
- [ ] Live market data dashboard: 8 global tiles (S&P 500, NASDAQ, Brent Crude, BTC, Gold, USD/ZAR, Fear & Greed, 10Y Treasury) auto-refreshing every 60 seconds
- [ ] SA Data Strip: JSE Top 40, Load-Shedding status (EskomSePush), ZAR crosses, SARB Repo Rate
- [ ] Economic calendar section (next 7 events, SA + global, impact colour-coded)
- [ ] Export to CSV on all tiles and the full dashboard
- [ ] Reports page: Power BI embed grid with category filter, search, sort, view count, likes, .pbix download, source CSV download, thumbnail
- [ ] Research Library: searchable pre-built Q&A knowledge base (no AI API)
- [ ] Watchlist: add/remove tickers, live price, 7-day sparkline, localStorage persistence, CSV export
- [ ] About page: professional bio, skills, certifications, projects, contact
- [ ] Admin panel: hidden route, Supabase Auth login, publish/edit/delete reports, manage research library entries, file uploads to Supabase Storage
- [ ] Supabase integration: reports table, research_library table, RLS policies, Storage buckets

### Out of Scope

- AI chatbot / Claude API research tool — replaced by pre-built Research Library (zero cost)
- User accounts / social features — solo tool, v1 is public read + one admin
- Real-time trading / order routing — display only
- Mobile app — responsive web only
- News aggregator — economic calendar covers event awareness

## Context

- Stack: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase (DB + Auth + Storage), Netlify (free tier)
- Design: Dark terminal / Bloomberg-style for the dashboard. Clean white professional landing page for the homepage hero.
- Components already selected from 21st.dev / shadcn: logo-cloud-2, category-list, liquid-metal-hero, featured-crm-demo-section, animated-state-icons, morphing-square (loading indicator)
- Data APIs: Finnhub (stocks), CoinGecko (crypto), Open Exchange Rates (ZAR), FRED (10Y Treasury), Alternative.me (Fear & Greed), EskomSePush (load-shedding), Yahoo Finance via CORS proxy (Brent/Gold fallback)
- Charting: TradingView Lightweight Charts for sparklines and price history
- Power BI: "Publish to Web" free embed (dad's account). Source CSVs exported from Meridian tiles → Power BI Desktop → published back to Meridian.
- The CSV export pipeline is critical: live data → export → Power BI → publish back. This is Raj's daily workflow.
- Font: Space Mono (numbers/data, tabular), Syne (headings)
- Colour palette: #080b0f background, #0d1117 surface, #00d4ff accent, #39d353 positive, #ff4444 negative, #f7c948 amber
- Hosting: Netlify free tier (100GB bandwidth, 190+ CDN nodes, custom headers via netlify.toml)
- Running cost: R0

## Constraints

- **Cost**: R0 — all APIs and services must be free tier
- **Auth**: Single admin user only (Raj). Supabase Auth email/password.
- **File size**: Supabase Storage 50MB max per file — .pbix files over 50MB go to Google Drive with link stored in DB
- **No backend**: No custom server. Netlify static + Supabase for data layer. Netlify Edge Functions only if absolutely needed.
- **Power BI**: Free "Publish to Web" embed only. No Power BI Pro features.
- **Performance**: LCP < 2.5s, INP < 200ms, CLS < 0.1. Fixed min-height on all data containers.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + shadcn over vanilla HTML | User wants to use React components from 21st.dev/shadcn — incompatible with single-file vanilla JS | — Pending |
| White landing page + dark dashboard | Landing page uses clean white/light aesthetic for professional first impression; dashboard switches to dark Bloomberg-style for data density | — Pending |
| Research Library instead of Claude API | Zero ongoing cost, demonstrates real analyst thinking, builds IP over time. No rate limits, no abuse risk | — Pending |
| CSV export as core feature | Critical to the Power BI pipeline: live data → export → Power BI → publish back to Meridian | — Pending |
| Space Mono for all numeric data | Tabular numerics are non-negotiable for professional financial UX — column alignment | — Pending |
| Supabase RLS on all tables | Anon key is public — RLS is the only thing stopping it from being a master key | — Pending |

---
*Last updated: April 2026 after initialization*
