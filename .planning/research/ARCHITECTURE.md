# Architecture Patterns — Meridian Data Intelligence Portal

**Domain:** Next.js App Router financial dashboard + portfolio site
**Researched:** April 2026
**Overall confidence:** HIGH (Next.js official docs + Supabase SSR docs + verified patterns)

---

## 1. Folder Structure

The recommended layout for Meridian uses route groups to separate the two major UX contexts (public marketing/portfolio vs. dark dashboard) without polluting URLs, and co-locates feature code to avoid deeply nested imports.

```
/
├── app/
│   ├── layout.tsx                    # Root layout: fonts, global CSS, providers
│   ├── page.tsx                      # Landing page (white/professional)
│   │
│   ├── (dashboard)/                  # Route group — dark terminal layout
│   │   ├── layout.tsx                # DashboardLayout: sidebar/nav, dark theme wrapper
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main market data dashboard
│   │   ├── watchlist/
│   │   │   └── page.tsx              # Ticker watchlist
│   │   └── reports/
│   │       └── page.tsx              # Power BI embed grid
│   │
│   ├── (marketing)/                  # Route group — white/clean layout
│   │   ├── layout.tsx                # MarketingLayout: light header + footer
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── research/
│   │       └── page.tsx              # Research Library
│   │
│   ├── (admin)/                      # Route group — admin panel (hidden, auth-gated)
│   │   ├── layout.tsx                # AdminLayout: minimal, requires session
│   │   └── admin/
│   │       ├── page.tsx              # Admin home: publish/edit reports
│   │       ├── reports/
│   │       │   └── page.tsx
│   │       └── research/
│   │           └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx                  # Auth login form (NOT inside admin group)
│   │
│   └── api/
│       ├── market/
│       │   ├── stocks/route.ts       # Proxy: Finnhub
│       │   ├── crypto/route.ts       # Proxy: CoinGecko
│       │   ├── forex/route.ts        # Proxy: Open Exchange Rates
│       │   ├── treasury/route.ts     # Proxy: FRED
│       │   ├── fear-greed/route.ts   # Proxy: Alternative.me
│       │   ├── eskom/route.ts        # Proxy: EskomSePush
│       │   └── brent/route.ts        # Proxy: Yahoo Finance CORS proxy
│       └── export/
│           └── csv/route.ts          # Server-side CSV generation
│
├── components/
│   ├── ui/                           # shadcn/ui primitives (auto-generated, do not edit)
│   ├── market/
│   │   ├── MarketTile.tsx            # 'use client' — single data tile
│   │   ├── MarketTileSkeleton.tsx    # Skeleton placeholder (same dimensions)
│   │   ├── MarketGrid.tsx            # Grid of tiles with Suspense boundaries
│   │   ├── SADataStrip.tsx           # 'use client' — SA-specific data bar
│   │   ├── SparklineChart.tsx        # 'use client' — TradingView wrapper
│   │   └── EconomicCalendar.tsx      # 'use client' — calendar section
│   ├── watchlist/
│   │   ├── WatchlistTable.tsx        # 'use client'
│   │   └── WatchlistSparkline.tsx    # 'use client' — TradingView wrapper
│   ├── reports/
│   │   ├── ReportCard.tsx            # Server Component (static report metadata)
│   │   ├── ReportGrid.tsx            # Server Component
│   │   └── PowerBIEmbed.tsx          # 'use client' — iframe wrapper
│   ├── admin/
│   │   ├── ReportForm.tsx            # 'use client' — CRUD form
│   │   └── FileUploader.tsx          # 'use client' — Supabase Storage upload
│   ├── layout/
│   │   ├── DashboardNav.tsx
│   │   ├── MarketingHeader.tsx
│   │   └── Footer.tsx
│   └── shared/
│       ├── ExportButton.tsx          # 'use client' — triggers CSV download
│       ├── ErrorBoundaryWrapper.tsx  # 'use client' — React error boundary
│       └── LoadingSpinner.tsx        # Morphing square loader from 21st.dev
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # createBrowserClient singleton (client components)
│   │   ├── server.ts                 # createServerClient factory (server components)
│   │   └── middleware.ts             # createServerClient for middleware cookie handling
│   ├── api/
│   │   ├── finnhub.ts                # Typed fetchers for Finnhub endpoints
│   │   ├── coingecko.ts
│   │   ├── openexchangerates.ts
│   │   ├── fred.ts
│   │   ├── alternativeme.ts
│   │   ├── eskom.ts
│   │   └── yahoo.ts
│   ├── csv/
│   │   └── generator.ts              # CSV serialisation logic (pure functions)
│   └── utils.ts                      # cn(), formatters, number helpers
│
├── hooks/
│   ├── useMarketData.ts              # SWR hook: polls /api/market/* every 60s
│   ├── useWatchlist.ts               # localStorage + live price polling
│   └── useExport.ts                  # Triggers /api/export/csv download
│
├── types/
│   ├── market.ts                     # MarketTile, FearGreed, EskomStatus types
│   ├── reports.ts                    # Report, ResearchEntry DB row types
│   └── supabase.ts                   # Generated DB types (supabase gen types)
│
├── middleware.ts                     # Auth guard: protects /admin/* routes
├── netlify.toml                      # Cache-Control headers, redirects
└── next.config.ts                    # Image domains, env variable exposure rules
```

**Route group rationale:** `(dashboard)` and `(marketing)` share no layout. Using route groups means each gets its own `layout.tsx` with completely different CSS context — dark terminal theme vs. clean white. The `(admin)` group keeps admin routes invisible from the public navigation and scoped to the middleware matcher.

---

## 2. API Integration Layer

### Decision: All external API calls go through Next.js Route Handlers (app/api/*)

**Do not** call Finnhub, CoinGecko, FRED, or any paid API directly from the browser. Reasons:

1. API keys in client code are visible in DevTools network tab even if prefixed with `NEXT_PUBLIC_` accidentally
2. CORS blocks most financial APIs from browser origin anyway (Yahoo Finance being the canonical example requiring a proxy)
3. Rate limit attribution: server-to-server calls share your server IP, not scattered across user IPs
4. You can add caching headers at the route handler level, reducing API calls when multiple clients refresh

**Pattern for each route handler:**

```typescript
// app/api/market/stocks/route.ts
import { NextResponse } from 'next/server'

export const revalidate = 55 // seconds — Next.js cache, slightly under the 60s poll interval

export async function GET() {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=SPY&token=${process.env.FINNHUB_API_KEY}`,
    { next: { revalidate: 55 } }
  )
  if (!res.ok) return NextResponse.json({ error: 'upstream_error' }, { status: 502 })
  const data = await res.json()
  return NextResponse.json(data)
}
```

**Client components call only `/api/market/*` — never external URLs directly.**

### lib/api/* files

These are pure TypeScript fetcher functions with typed responses. They are called exclusively from within route handlers (server-side). They are not imported by client components.

```
lib/api/finnhub.ts     → called by app/api/market/stocks/route.ts
lib/api/coingecko.ts   → called by app/api/market/crypto/route.ts
```

This separation means: if Finnhub changes their API, you update one file, and the route handler stays unchanged.

### Server Actions vs Route Handlers

- **Route Handlers** (`app/api/*/route.ts`): Use for external API proxying and CSV download streaming. They are HTTP endpoints callable by fetch().
- **Server Actions**: Use only for Supabase mutations (creating/updating reports, uploading files) in the admin panel. They co-locate with admin forms using `'use server'`.
- **Direct client-side fetch**: Only to your own `/api/*` routes. Never to external APIs.

---

## 3. Market Data Polling Layer

### Decision: SWR with `refreshInterval` in custom hooks

SWR is made by Vercel, integrates natively with Next.js App Router, and handles the exact use case: stale-while-revalidate caching with background polling. React Query is the alternative and is equally valid — SWR is chosen here because of the native Next.js integration and smaller bundle footprint.

**Do not use React Context or Zustand for market data.** Market tile data is not shared global state — it is fetched-and-displayed data local to each dashboard render. Using Context would force a global re-render of every tile every 60 seconds. SWR's per-hook granularity avoids that.

```typescript
// hooks/useMarketData.ts
'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useMarketTile(endpoint: string) {
  const { data, error, isLoading } = useSWR(
    `/api/market/${endpoint}`,
    fetcher,
    {
      refreshInterval: 60_000,        // Poll every 60 seconds
      revalidateOnFocus: true,         // Refresh when user returns to tab
      revalidateOnReconnect: true,     // Refresh after network drop
      dedupingInterval: 55_000,        // Deduplicate requests within window
    }
  )
  return { data, error, isLoading }
}
```

**Each MarketTile is an independent SWR subscriber.** If one tile's API is down, the others are unaffected. No shared polling manager is needed.

**Watchlist polling** uses the same hook pattern but with `localStorage` for persistence:

```typescript
// hooks/useWatchlist.ts
// Reads tickers from localStorage, calls /api/market/stocks?symbols=... with SWR
```

**Zustand use case:** Zustand is appropriate for the admin panel UI state (selected tab, modal open/close, form dirty state) where you need cross-component state without prop drilling. It is NOT used for market data.

---

## 4. Supabase Architecture

### Client Initialisation — Three Distinct Clients

Supabase requires three separate client factories in the App Router. The `@supabase/ssr` package (not the deprecated `auth-helpers`) provides the correct approach.

```
lib/supabase/client.ts     → Browser client (Client Components only)
lib/supabase/server.ts     → Server client (Server Components, Route Handlers, Server Actions)
lib/supabase/middleware.ts → Middleware client (token refresh, cookie mutation)
```

**Browser client (singleton):**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
```

The singleton pattern prevents creating a new client on every render cycle. Module-level `let client` is safe because browser client is always in the same JS context.

**Server client (factory, not singleton):**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}
```

Server client cannot be a singleton — `cookies()` is request-scoped. A new client is created per request. This is correct and expected.

**Middleware client** requires both `getAll` and `setAll` cookie handlers so it can refresh and rewrite session tokens.

### Data Fetching Split

| Data Type | Fetch Location | Rationale |
|-----------|---------------|-----------|
| Reports list (public read) | Server Component | Static-ish, benefits from SSR caching |
| Report metadata for embed | Server Component | SEO metadata needed at render time |
| Research Library entries | Server Component | Read-heavy, no interactivity needed |
| Admin CRUD operations | Server Action | Mutation, co-located with form |
| Market tile data | Client Component (SWR) | Live polling, cannot be server-fetched every 60s |
| Watchlist prices | Client Component (SWR) | User-specific, localStorage-driven |

**RLS policy intent:** The anon key is in `NEXT_PUBLIC_` environment variables and is visible to all users. RLS is your only protection. Every table must have policies where `reports` and `research_library` are readable by anyone (`SELECT` allowed for anon role), but INSERT/UPDATE/DELETE require `auth.role() = 'authenticated'`. The single admin user is the only authenticated user.

---

## 5. Admin Panel Route Protection

### Decision: Next.js Middleware (primary) + Server Component session check (secondary)

Middleware alone is not sufficient for security — the March 2025 CVE-2025-29927 vulnerability demonstrated that middleware can be bypassed via crafted headers on self-hosted Next.js. Netlify is not self-hosted, so this specific CVE does not apply, but the defence-in-depth principle still holds.

**middleware.ts** (project root):
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(/* ... cookie handlers using req/res ... */)
  const { data: { session } } = await supabase.auth.getSession()

  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
```

**Admin layout server-side check** (`app/(admin)/layout.tsx`):
```typescript
// Server Component — second line of defence
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }) {
  const supabase = await getSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <>{children}</>
}
```

**The `/admin` URL is hidden** — it does not appear in any nav link. Obscurity is not security, but it reduces noise traffic.

**Login page** is at `/login` (outside any route group) so it has no auth-protected layout applied to it.

---

## 6. Market Tile Component Architecture

### Component Hierarchy

```
MarketGrid (Server Component shell)
  └── Suspense boundary per tile group
        └── MarketTileWrapper (Client Component — 'use client')
              ├── useMarketTile() hook (SWR polling)
              ├── [loading] → MarketTileSkeleton
              ├── [error]   → MarketTileError (inline, not full error boundary)
              └── [data]    → MarketTile
                              ├── price, change%, label
                              └── SparklineChart (lazy, 'use client')
```

**MarketTile props interface:**
```typescript
interface MarketTileProps {
  symbol: string
  label: string           // "S&P 500", "BTC/USD"
  endpoint: string        // "/api/market/stocks"
  showSparkline: boolean
  showExport: boolean
}
```

**Skeleton loading pattern:** `MarketTileSkeleton` must have identical `min-height` and `width` to the real tile to prevent CLS (Cumulative Layout Shift). This is enforced by sharing a `TILE_HEIGHT` constant between both components.

**Error handling:** Do not use React Error Boundary class components for individual tiles — the tile renders an inline error state (`"Data unavailable"`) when SWR returns an error. A full ErrorBoundary is reserved for section-level failures (e.g., the entire dashboard grid fails to mount).

**SparklineChart (TradingView Lightweight Charts):**

TradingView Lightweight Charts is a DOM-manipulation library — it requires `window` and `document`. It must be wrapped in a `'use client'` component and should use `dynamic()` with `ssr: false` to prevent SSR hydration errors:

```typescript
// components/market/SparklineChart.tsx
'use client'
import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

export function SparklineChart({ data }: { data: PricePoint[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const chart = createChart(ref.current, { width: 120, height: 40 })
    // ... series setup
    return () => chart.remove() // cleanup on unmount
  }, [data])
  return <div ref={ref} />
}
```

Import in the parent with:
```typescript
const SparklineChart = dynamic(
  () => import('@/components/market/SparklineChart'),
  { ssr: false, loading: () => <div className="h-10 w-[120px]" /> }
)
```

---

## 7. CSV Export Architecture

### Decision: Client-side generation for individual tiles; Route Handler for full dashboard

**Individual tile export (client-side):**
For single tiles (8-20 rows), generate the CSV entirely in the browser. No server round-trip needed. Data is already in memory from SWR. Use a plain `Blob` — no FileSaver dependency required.

```typescript
// hooks/useExport.ts
export function useExport() {
  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(','))
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  return { exportCSV }
}
```

**Full dashboard export (Route Handler):**
When exporting all tiles at once (pulling from multiple APIs), trigger a server-side aggregation via `/api/export/csv`. The route handler fetches all endpoints, merges the data, and streams back a CSV response with correct headers:

```
Content-Type: text/csv
Content-Disposition: attachment; filename="meridian-export-2026-04-07.csv"
```

**lib/csv/generator.ts** contains pure serialisation functions (array to CSV string) with no Next.js dependencies. This makes them testable in isolation.

---

## 8. Component Boundaries and Data Flow

```
Direction of data flow (→ = passes data to):

Supabase DB
  → Server Components (reports, research_library via getSupabaseServerClient)
    → ReportGrid → ReportCard (static render, no client JS)
    → ResearchLibraryPage (static render)

External APIs (Finnhub, CoinGecko, etc.)
  → app/api/market/*/route.ts (server-side proxy, caches 55s)
    → SWR (client, polls every 60s via /api/market/*)
      → useMarketTile() hooks
        → MarketTileWrapper → MarketTile + SparklineChart

localStorage
  → useWatchlist() hook
    → WatchlistTable → WatchlistSparkline

Admin form actions
  → Server Actions → Supabase DB mutations
    → revalidatePath() → Server Components re-fetch updated data

CSV export
  → Client data (from SWR cache) → useExport() → Blob download
  → OR → /api/export/csv → multi-source aggregation → streamed download
```

**Key boundary rules:**
- Server Components cannot use hooks, browser APIs, or event handlers
- Client Components that need Supabase data should use `getSupabaseBrowserClient()`
- Server Components that need Supabase data use `getSupabaseServerClient()`
- Never import `lib/api/*` fetchers in client components — they are server-only
- Never import `lib/supabase/server.ts` in client components — it imports `next/headers` which is server-only

---

## 9. Build Order (Dependency Graph)

Phases must be built in this order because later items depend on earlier foundations.

```
Layer 0 — Foundation (no dependencies)
  ├── Project scaffold: Next.js + TypeScript + Tailwind + shadcn init
  ├── Font setup: Space Mono + Syne in root layout
  ├── Colour tokens in tailwind.config.ts (#080b0f, #00d4ff, etc.)
  ├── lib/supabase/* — all three clients
  ├── types/market.ts, types/reports.ts, types/supabase.ts
  └── Supabase: create tables, RLS policies, Storage buckets

Layer 1 — Infrastructure (depends on Layer 0)
  ├── middleware.ts — auth guard (depends on lib/supabase/middleware)
  ├── app/api/market/* route handlers (depends on lib/api/*, env vars)
  ├── lib/csv/generator.ts (pure functions, no dependencies)
  └── Root layout.tsx with providers

Layer 2 — Core UI Components (depends on Layer 0)
  ├── MarketTileSkeleton (no data dependency)
  ├── MarketTile component (depends on types/market.ts)
  ├── SparklineChart wrapper (depends on lightweight-charts install)
  └── ExportButton (depends on useExport hook → lib/csv/generator.ts)

Layer 3 — Data Hooks (depends on Layer 1 + 2)
  ├── useMarketTile() — depends on /api/market/* being live
  ├── useWatchlist() — depends on MarketTile, localStorage
  └── useExport() — depends on lib/csv/generator.ts

Layer 4 — Dashboard Page (depends on Layer 2 + 3)
  ├── MarketGrid with 8 tiles
  ├── SADataStrip
  └── EconomicCalendar

Layer 5 — Secondary Pages (depends on Layer 0 + 1)
  ├── Reports page (Server Component, depends on Supabase reports table)
  ├── Research Library (Server Component, depends on Supabase research_library)
  └── Watchlist page (depends on useWatchlist)

Layer 6 — Landing Page (depends on Layer 0 only)
  ├── Hero section (21st.dev components)
  ├── Features section
  └── About page

Layer 7 — Admin Panel (depends on middleware + Supabase + Server Actions)
  ├── Login page (depends on lib/supabase/client.ts auth)
  ├── Admin layout (server-side session check)
  ├── Report CRUD forms (Server Actions)
  └── File uploader (Supabase Storage)
```

**Critical path:** Layer 0 → Layer 1 → Layer 3 → Layer 4. The dashboard (the highest-value feature) can be fully functional before Layer 5, 6, and 7 are touched.

**Do not build Layer 7 (admin) early.** Admin features have the most surface area and the least user-facing value in early iterations. Get the live dashboard working first.

---

## 10. Netlify-Specific Considerations

**netlify.toml** must set cache headers for the API proxy routes to prevent Netlify's CDN from over-caching market data:

```toml
[[headers]]
  for = "/api/market/*"
  [headers.values]
    Cache-Control = "public, s-maxage=55, stale-while-revalidate=5"

[[headers]]
  for = "/api/export/*"
  [headers.values]
    Cache-Control = "no-store"
```

**No Netlify Edge Functions needed** for this architecture. The Next.js API routes (running as Netlify Functions under the hood) are sufficient. Edge Functions would only be needed if sub-100ms latency on the proxy layer became a requirement.

**Environment variables** in Netlify must be set for all server-side API keys. `NEXT_PUBLIC_` prefix should be used ONLY for `SUPABASE_URL` and `SUPABASE_ANON_KEY`. All other API keys (Finnhub, FRED, Open Exchange Rates) are server-side only and must NOT have the `NEXT_PUBLIC_` prefix.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Folder structure | HIGH | Follows Next.js official route group docs |
| Supabase client split | HIGH | Directly from @supabase/ssr official docs, verified client/server/middleware split |
| SWR polling pattern | HIGH | Verified with SWR docs, refreshInterval is stable API |
| Middleware auth pattern | HIGH | Next.js official auth guide + Supabase SSR guide |
| TradingView integration | MEDIUM | dynamic(ssr:false) is the known pattern; exact Lightweight Charts v4 API may have minor changes |
| CSV export approach | HIGH | Browser Blob pattern is standard; Route Handler streaming is documented |
| Netlify cache headers | MEDIUM | netlify.toml header syntax verified; Cache-Control semantics for Next.js functions may require testing |

---

## Sources

- [Next.js App Router Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Supabase SSR: Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase: Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [SWR Documentation](https://swr.vercel.app/)
- [SWR Usage with Next.js](https://swr.vercel.app/docs/with-nextjs)
- [TradingView Lightweight Charts — Basic React Example](https://tradingview.github.io/lightweight-charts/tutorials/react/simple)
- [Next.js Middleware Authentication 2025](https://www.hashbuilds.com/articles/next-js-middleware-authentication-protecting-routes-in-2025)
- [Next.js Streaming Guide](https://nextjs.org/docs/app/guides/streaming)
- [TanStack Query vs SWR Comparison 2025](https://tanstack.com/query/latest/docs/framework/react/comparison)
