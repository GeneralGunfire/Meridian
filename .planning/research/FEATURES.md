# Feature Landscape: Meridian Data Intelligence Portal

**Domain:** Financial data portal + analyst portfolio site (solo South African data analyst)
**Researched:** 2026-04-07
**Confidence:** MEDIUM-HIGH (research confirmed via multiple sources; SA-specific data ecosystem has fewer authoritative sources)

---

## Table Stakes

Features users expect. Missing = product feels incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero with clear value proposition | Visitors decide in <5s whether to stay | Low | One headline, one sub-line, one CTA above fold |
| Logo cloud / social proof strip | Establishes credibility for analyst | Low | Tools used (Power BI, Python, SQL, etc.) serve as "social proof" when client logos unavailable |
| Skeleton loading on all data tiles | Financial data has latency; blank tiles feel broken | Low-Med | Shimmer left-to-right, 1.5s cycle; tile shape preserved during load |
| "Last updated" timestamp on every live tile | Users need to know if data is current | Low | Format: "Live" / "As of 10:42 AM" / "Stale — 14 min ago" |
| Error state per tile (not page-level) | API outages should not kill the whole dashboard | Med | Show cached snapshot with amber warning badge, not a spinner forever |
| Price change color coding (green/red) | Universal financial convention; absence is jarring | Low | Red = negative, green = positive; never invert |
| Percentage change alongside absolute change | Both are expected on any market data display | Low | Format: +1.23 (0.45%) |
| Report card grid with thumbnail/preview | Portfolio without visual previews feels like a file listing | Med | Screenshot or static export image; live embed not required |
| Report metadata visible on card | Date, category/topic, tools used | Low | See differentiators for richer metadata |
| Search bar on report library | 10-50 reports still benefits from instant search | Low | Client-side filtering is sufficient at this scale |
| Filter by category on report library | Users want to browse by topic (macro, equity, sector) | Low | Chip/pill filters above grid, not sidebar |
| Watchlist with live price + % change | Core reason users bookmark a watchlist page | Med | localStorage persistence; no login required |
| Sparkline per watchlist row | Visualises trend at a glance; expected on all watchlists | Med | 7-day or 1-day mini chart; 60-80px wide |
| Watchlist add/remove tickers | Users expect to own their list | Low | Simple ticker search + add button |
| Economic calendar table with impact rating | High/Med/Low impact colour-coded; date/time/event/forecast/actual | Low-Med | Table format is the most scannable for this use case |
| Admin auth (hidden route) | Reports page without a way to publish is a dead end | Med | Supabase Auth; no public-facing sign-in link |
| File upload with progress bar | Uploading .pbix files without feedback causes re-uploads | Low | Percentage complete + file name displayed |
| Publish/unpublish toggle on reports | Admin needs draft state before going live | Low | Toggle switch, not delete |
| About page with credentials + contact | Recruiters and clients always look for this | Low | Skills, tools, downloadable CV, LinkedIn, email |

---

## Differentiators

Features that set the portal apart from generic analyst sites. Not universally expected, but high perceived value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| SA-specific data strip (JSE All Share, ZAR/USD, Gold ZAR, Brent ZAR) | Most dashboards are US-centric; SA context is immediately distinctive | Med | Persistent strip below navbar or at top of market page; sourced from free tier APIs (Alpha Vantage, Yahoo Finance, Twelve Data) |
| SARB / Stats SA economic calendar events | SA-specific events (MPC meetings, CPI releases, GDP) alongside global ones | Med | Filter: "SA only" toggle; sourced from Trading Economics free tier or manual curation |
| .pbix download button on report cards | Rare — almost no analyst portfolios offer raw file download | Low | Signals confidence and transparency; differentiating trust signal |
| CSV download on both reports and watchlist | Adds utility; users can take data away | Low | Watchlist CSV export is simple localStorage serialisation |
| Animated liquid metal hero | Visually distinctive; memorable brand identity | Med | Cult UI hero-liquid-metal component; configure tint to match brand colour |
| Dark Bloomberg-style market page | Signals professional financial literacy; most analyst sites use light theme throughout | Low | Tailwind dark mode scoped to /dashboard route only |
| Stale data pulsing amber badge | Granular transparency few sites provide | Low | CSS pulse animation on badge; threshold configurable (e.g., >5 min = stale) |
| Report difficulty/complexity tag | Helps visitors self-select relevant work | Low | Tags: Introductory / Intermediate / Advanced |
| Tools-used chips on report cards | Shows stack breadth (Power BI, Python, DAX, SQL) | Low | Coloured pills, max 3 visible, "+N more" overflow |
| "Problem solved" one-liner on report card | Reframes portfolio from "look what I made" to "here is the value I delivered" | Low | 1-2 sentence business context; shows analyst thinking |
| Watchlist CSV export | Users can take data into Excel for further analysis | Low | Strong value signal for the Excel-heavy SA finance community |
| Manual refresh button on each tile | Gives users control; reduces distrust of stale data | Low | Icon button in tile header; triggers SWR revalidate |
| Animated number counters on stat tiles | Price changes feel live and dynamic | Low | Spring animation on value change; limit to 2 decimal places |
| Economic calendar "SA only" filter | Removes noise for SA-focused users | Low | Toggle chip; persisted in localStorage |

---

## Anti-Features

Features to explicitly NOT build in this project scope.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| AI-powered Q&A / chatbot on research library | Scope creep; requires LLM integration, cost management, hallucination risk | Pre-built static Q&A (already planned); label it clearly as curated answers |
| User accounts / social features | Over-engineered for solo analyst portfolio; auth complexity for no clear gain | Supabase Auth for admin only; visitors are unauthenticated |
| Real-time streaming prices via WebSocket | High infrastructure cost; free APIs are polled REST; streaming buys little for a portfolio site | Poll on 60s interval with "last updated" timestamp; this is acceptable for portfolio context |
| Multi-user admin / role-based access | Single analyst; RBAC is wasted complexity | One admin user via Supabase Auth email/password |
| Payment / subscription gate | This is a portfolio / showcase site | Keep entirely free-to-view |
| Power BI Premium embed (iFrame with service principal) | Requires paid Power BI Pro/Premium licence (~$10-20/user/mo); not justified | Use "Publish to web" public iframe for interactive embeds; static screenshot for sensitive reports |
| Infinite scroll on report grid | 10-50 reports does not need pagination or infinite scroll; it creates navigation confusion | Simple grid, all visible; filter chips reduce apparent volume |
| Custom charting library re-implementing Power BI visuals | Duplicates work already done in .pbix files | Embed Power BI; use lightweight charting (Recharts/tremor) only for the live market tiles |
| Dark/light theme toggle site-wide | Adds development overhead; the dual-theme approach (white landing, dark dashboard) is itself the brand statement | Keep landing white, market page dark; do not let users toggle |
| Push notifications / email alerts | Requires backend job scheduler, email infra, legal compliance (POPIA) | Out of scope entirely for V1 |

---

## Feature Dependencies

```
Supabase Auth (Admin) → Publish reports workflow → Report cards visible on /reports
Power BI "Publish to web" iframe URL → Report card embed viewer
Static screenshot → Report card thumbnail (fallback when no iframe)
localStorage → Watchlist state → Sparklines → CSV export
Free-tier market API (Alpha Vantage / Twelve Data) → Live tiles → SA data strip → Watchlist prices
Economic calendar data source → Calendar table display
```

---

## Section-by-Section Detail

### 1. Landing Page — What Converts

**Research finding (MEDIUM confidence, multiple sources):**

Highest-converting sections for a developer/analyst portfolio landing page, in order:

1. **Hero** — Headline stating who you are + what you deliver (not job title, outcome). Single primary CTA ("View Reports" or "See the Dashboard"). Sub-headline with 2-3 differentiators. Liquid metal visual right-side or full-bleed background. Above the fold, no scroll required.
2. **Social proof strip** — Logo cloud of tools/technologies (Power BI, Python, SQL Server, Azure, etc.). At this stage substitutes for client logos. Animated horizontal scroll on mobile.
3. **Feature / capability list** — 3-column icon grid. Short labels, no paragraphs. Shows breadth: Data Modelling, Financial Analysis, Dashboard Design, Report Automation.
4. **Featured work preview** — 2-3 report cards pulled from the reports page. Teaser, not full grid. Drives click-through.
5. **About / credibility snippet** — 2-3 sentences, photo, link to full About page. Not a full bio.
6. **CTA footer banner** — Repeated CTA with different framing ("Ready to turn your data into decisions?").

**Sections to skip:** Testimonials (none yet), pricing (not applicable), FAQ (premature).

---

### 2. Live Market Dashboard — UX Patterns for Data Tiles

**Research finding (HIGH confidence — Smashing Magazine 2025 + NN/G):**

**Loading states:**
- Skeleton screen (not spinner) — preserve the exact tile shape. Shimmer left-to-right, 1.5s cycle.
- Never show an empty tile. Show skeleton immediately on mount, replace with data.
- Stagger tile load-in with 50-100ms delay between tiles to signal progressive population, not a simultaneous flash.

**Stale data:**
- Show "last updated" timestamp in tile footer at all times.
- Amber pulsing badge when data is >5 min old (configurable).
- "Live" green dot when data is fresh (<60s).
- Manual refresh icon button in tile header — do not rely on auto-refresh alone.

**Error states:**
- Per-tile error boundary — one broken API must not cascade.
- Show cached snapshot (last known good value) with amber border + "Could not refresh" message.
- Never show a full-page error for a partial data failure.

**Color and motion:**
- Price change flash: brief background pulse on value change (green flash for up, red for down), 300ms, then fade. Signals live-ness.
- Never flash on initial mount — only on value change.

**The 8-tile layout:**
- Recommended tiles for SA analyst: JSE All Share Index, Top 40, ZAR/USD, ZAR/EUR, Gold (ZAR/oz), Brent Crude (ZAR), SA 10Y Government Bond Yield, Bitcoin (ZAR)
- SA data strip below tiles: smaller persistent row of secondary indicators (Platinum, Palladium, Rand Hedges basket)

---

### 3. Power BI Portfolio Card Grid

**Research finding (MEDIUM confidence):**

**Without Power BI Premium — recommended approach:**
- "Publish to web" generates a free public iframe embed URL (unauthenticated, suitable for non-sensitive showcase reports). Use this as the "View interactive report" link.
- For the card thumbnail: export a static screenshot (PowerPoint export → PNG, or browser screenshot) and use as `<Image>` in the card. This is standard practice across analyst portfolios.
- Do NOT attempt to render the Power BI iframe inside the card grid — it will be too small and unreadable. Use static thumbnail + modal/new-tab for full report.

**Metadata to show on each card:**
1. Report title (bold, 2-line max)
2. 1-sentence problem statement ("What business question does this answer?")
3. Category tag (Macro / Equity / Sector / Operations / Personal Finance)
4. Tools chips (Power BI, DAX, Python, SQL — max 3 visible)
5. Complexity badge (Introductory / Intermediate / Advanced)
6. Date published
7. Action buttons: [View Report] [Download .pbix] [Download CSV]

**Grid behaviour:**
- 3-column on desktop, 2-column on tablet, 1-column on mobile
- Cards are equal height (CSS grid, not masonry — masonry confuses visual scanning)
- Hover state: slight lift (box-shadow + translateY(-2px)) + show action buttons overlay

---

### 4. Report Library — Search and Filter Patterns

**Research finding (HIGH confidence — NN/G, Algolia, Smashing):**

For 10-50 reports, client-side filtering is the correct approach (no search backend needed).

**Search:**
- Single search bar, full-width above grid
- Searches across: title, problem statement, tags, category
- Instant (debounced 150ms) — no submit button
- Show result count: "Showing 7 of 23 reports"
- Empty state with friendly message + "Clear filters" button

**Filters:**
- Pill/chip filters for Category — horizontally scrollable on mobile
- No sidebar filters (causes layout shift, wrong pattern for <50 items)
- "All" pill is the default selected state
- Show count in chip: "Equity (8)"

**Sorting:**
- Default: newest first
- Options: Newest / Oldest / A-Z (minimal; do not over-engineer)
- Sort dropdown, not segmented control (saves space)

**Anti-pattern to avoid:** Do NOT implement faceted/multi-select filters. At <50 items, this is over-engineered and adds cognitive load without benefit.

---

### 5. Watchlist — Daily Retention Patterns

**Research finding (MEDIUM confidence — Benzinga, Barchart analysis, TradingView patterns):**

**Core retention drivers:**
- **Persistence**: localStorage-backed with no login required. Users return because their list is already there.
- **Sparklines**: 7-day price sparkline on every row — the single highest-value addition for daily return behaviour. Apple Stocks app and TradingView both confirmed this pattern. Width: 60-80px, height: 30-40px, no axes.
- **Colour-coded % change**: Instant visual scan of portfolio performance. No need to read numbers.
- **Last price + absolute change + % change**: Three columns always visible. These are the minimum columns users scan daily.

**Layout:**
- Table layout, not cards — allows column-scanning behaviour
- Sticky column headers on scroll
- Row hover highlight
- Drag-to-reorder rows (nice-to-have, not table stakes)

**Data refresh:**
- Poll every 60 seconds during market hours
- "Market closed" indicator outside JSE trading hours (09:00-17:00 SAST)
- "Prices delayed 15 min" disclaimer (required for most free API tiers)

**CSV export:** One-click button exports current watchlist to CSV with: Ticker, Name, Last Price, Change, % Change, Market Cap (if available), Timestamp.

**Anti-pattern:** Do NOT add push notifications or alerts to V1. Alert fatigue is real and requires backend infrastructure.

---

### 6. Admin Panel — Single-User CMS Patterns

**Research finding (MEDIUM confidence):**

For a single-user hidden-route admin panel, the appropriate pattern is a minimal content-ops interface, not a feature-rich CMS.

**Publish report workflow:**
1. Upload .pbix file (drag-and-drop zone + file picker fallback)
2. Upload thumbnail screenshot (drag-and-drop, with live preview)
3. Fill metadata form: Title, Problem statement, Category (dropdown), Tools (multi-select chips), Complexity (dropdown), Publish date (defaults to today)
4. Paste Power BI "Publish to web" embed URL (optional)
5. Toggle: Published / Draft
6. Submit button with confirmation dialog: "Publish 'JSE Equity Dashboard'? This will make it visible on the Reports page."

**File upload UX:**
- Drag-and-drop zone with dashed border, icon, and "Drop .pbix here or click to browse"
- Progress bar (percentage + file name) during upload
- Success state: green checkmark + filename
- Error state: red border + retry button
- Never disable the submit button during upload — show inline progress instead

**Confirmation dialogs:**
- Destructive actions (unpublish, delete) require confirmation dialog with explicit action label ("Yes, unpublish" not "OK")
- Non-destructive actions (save draft) do not need confirmation — just save with toast notification

**Navigation:**
- Simple tab bar: Reports | New Report | Settings
- No complex sidebar. This is a single-user tool.

**Auth:**
- Supabase Auth with email/password
- No "Remember me" complexity — session persists by default
- Redirect to /admin after login; redirect to /login on session expiry

---

### 7. Economic Calendar — Display Patterns

**Research finding (HIGH confidence — Bloomberg, Investing.com, TradingView patterns confirmed):**

**Winner: Table format.** Cards and timelines are used in consumer apps; table is the professional standard and the most scannable format for economic events. Every major financial platform (Bloomberg, Investing.com, Trading Economics, TradingView) uses a table.

**Table columns (in order):**
1. Date/Time (local SAST)
2. Country flag + Country (default: all; filterable to SA only)
3. Event name
4. Impact (coloured dot: Red = High, Amber = Medium, Grey = Low)
5. Previous value
6. Forecast / Consensus
7. Actual value (bold; colour-coded vs forecast: green if better, red if worse)

**Grouping:**
- Group rows by date with date as a sticky sub-header
- This week's events visible by default; "Next week" and "Previous week" navigation

**Filters:**
- "SA Only" toggle (JSE/SARB/Stats SA events)
- Impact filter: High / Medium / Low (default: all)
- These two filters cover 90% of user intent; do not add more

**No-data states:**
- Weekend / public holiday: "No events scheduled" row in the group
- API failure: last cached data with timestamp + amber warning

**Embed option:** TradingView offers a free embeddable Economic Calendar widget. Evaluate this against building a custom table. The custom table is preferred if SA-specific events (SARB MPC dates, Stats SA CPI) need to be injected manually — TradingView's free widget has limited SA coverage.

---

## MVP Recommendation

**Phase 1 — Core portfolio (ship this, everything else is secondary):**
1. Landing page (hero + logo cloud + feature grid + 2-3 featured reports)
2. Reports page (card grid, category filter chips, search, static thumbnails, Power BI "publish to web" links)
3. About page
4. Admin panel (Supabase Auth, publish/unpublish reports, file upload)

**Phase 2 — Market data (requires API key and data contracts):**
5. Live market dashboard (8 tiles, SA strip, loading/stale/error states)
6. Economic calendar (table, SA filter, impact filter)

**Phase 3 — Retention features:**
7. Watchlist (localStorage, sparklines, CSV export)
8. Research library (static Q&A, search)

**Defer indefinitely:**
- Real-time streaming prices
- User accounts
- Push notifications
- AI features

---

## Sources

- [UX Strategies for Real-Time Dashboards — Smashing Magazine](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/)
- [Skeleton Screens 101 — NN/G](https://www.nngroup.com/articles/skeleton-screens/)
- [Filter UX Design Patterns — Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering)
- [Search Filter UX Best Practices — Algolia](https://www.algolia.com/blog/ux/search-filter-ux-best-practices/)
- [Designing Filters That Work — Smashing Magazine](https://www.smashingmagazine.com/2021/07/frustrating-design-patterns-broken-frozen-filters/)
- [Power BI Publish to Web — Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web)
- [Building a Power BI Portfolio — The Data School](https://www.thedataschool.co.uk/tanya-fischer/building-a-power-bi-portfolio/)
- [How to Showcase Power BI Projects — The Bricks](https://www.thebricks.com/resources/guide-how-to-showcase-power-bi-projects)
- [File Uploader UX Best Practices — Uploadcare](https://uploadcare.com/blog/file-uploader-ux-best-practices/)
- [6 Loading State Patterns That Feel Premium — UX World / Medium](https://medium.com/uxdworld/6-loading-state-patterns-that-feel-premium-716aa0fe63e8)
- [TradingView Economic Calendar](https://www.tradingview.com/economic-calendar/)
- [Investing.com Economic Calendar](https://www.investing.com/economic-calendar/)
- [Trading Economics — South Africa Calendar](https://tradingeconomics.com/south-africa/calendar)
- [JSE Market Data](https://www.jse.co.za/market-data)
- [Moneyweb Daily Indicators](https://www.moneyweb.co.za/tools-and-data/daily-indicators/)
- [Hero Liquid Metal — Cult UI](https://www.cult-ui.com/docs/components/hero-liquid-metal)
- [Landing Page Best Practices — Framer Blog](https://www.framer.com/blog/landing-page-best-practices/)
- [SaaS Landing Page Best Practices — MagicUI](https://magicui.design/blog/saas-landing-page-best-practices)
- [Top Stock Watchlist Websites — Benzinga](https://www.benzinga.com/money/best-stock-watchlist-websites)
- [Power BI Publish to Web Portfolio Guide — DataCamp](https://www.datacamp.com/tutorial/power-bi-publish-to-web)
