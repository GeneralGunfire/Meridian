# Technology Stack

**Project:** Meridian Data Intelligence Portal
**Researched:** 2026-04-07
**Confidence:** HIGH (all claims verified via official docs or multiple current sources)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 14+ (pin to 14.x; avoid 15 until ecosystem stabilizes) | Full-stack framework | App Router is now stable, Server Components reduce bundle size, Netlify adapter fully supports it |
| TypeScript | 5.x | Type safety | Non-negotiable for financial data shapes; catches API contract mismatches at compile time |
| Tailwind CSS | 3.x | Styling | shadcn/ui is built on Tailwind; do not use Tailwind v4 yet — shadcn/ui still targets v3 |
| React | 18.x (bundled with Next.js 14) | UI runtime | Required peer dep; use with App Router Server Components |

### Deployment Target

| Technology | Config | Why |
|------------|--------|-----|
| Netlify | **SSR mode (not static export)** | Supabase cookie-based auth requires middleware to refresh tokens — impossible with `output: 'export'`. The `@netlify/plugin-nextjs` adapter (OpenNext-based) handles SSR, ISR, Server Actions, and API Routes automatically. Do NOT set `output: 'export'` in next.config.ts. |

**Adapter strategy:** Do NOT pin `@netlify/plugin-nextjs`. Netlify explicitly recommends leaving it unpinned so each build automatically gets the latest adapter, which tracks Next.js releases.

**Free tier constraints to design around:**
- 125,000 serverless function invocations/month (SSR page renders + API routes each consume one invocation)
- 100 GB bandwidth/month
- 10-second function execution timeout

**Mitigation:** Use `fetch` with `revalidate` for external API data cached at the edge; only SSR pages that truly need per-request auth context. Static-renderable pages (landing, error pages) use `generateStaticParams` to avoid invocation cost.

### Database / Auth / Storage

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@supabase/supabase-js` | ^2.x | Database client, realtime, storage | Primary Supabase JS client |
| `@supabase/ssr` | ^0.10.0 (latest as of research date) | Cookie-based SSR auth | Replaces the deprecated `@supabase/auth-helpers-nextjs`. Required for cookie handling in Next.js App Router middleware and Server Components. Do NOT use the old auth-helpers package. |

### Financial Data & External APIs

All external API calls **must go through Next.js Route Handlers** (server-side). Never call these APIs from client components with `NEXT_PUBLIC_` keys. See Environment Variables section below.

| API | Key Handling | Notes |
|-----|-------------|-------|
| Finnhub | Server-side env only | Stocks, forex, crypto |
| CoinGecko | Server-side env only (free tier has no key, but add one when upgrading) | Crypto prices |
| Open Exchange Rates | Server-side env only | FX rates |
| FRED (St. Louis Fed) | Server-side env only | Macro indicators |
| Alternative.me | No key required | Fear & Greed index |
| EskomSePush | Server-side env only | Load-shedding status |

### Charting

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `lightweight-charts` | ^5.1.0 (latest) | Financial OHLCV and line charts | TradingView's open-source library; far smaller than full Charting Library. v5 added multi-pane support and reduced bundle size. |

**Critical:** `lightweight-charts` is a browser-only library that manipulates the DOM directly via HTML5 Canvas. It cannot run in Node.js (SSR). Always wrap chart components with `dynamic()` and `ssr: false`.

```typescript
// components/charts/CandlestickChart.tsx — client component
'use client'
import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'
// ... chart logic

// Where you consume it:
import dynamic from 'next/dynamic'
const CandlestickChart = dynamic(
  () => import('@/components/charts/CandlestickChart'),
  { ssr: false }
)
```

Do NOT attempt to import `lightweight-charts` at the top level of a Server Component or a module that is not `'use client'` — it will throw a `window is not defined` error at build time.

### UI Components

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| shadcn/ui | CLI v4 (March 2026) | Component primitives | Copy-paste component model means no version lock-in; components live in your repo |
| Radix UI | (installed by shadcn) | Accessible primitives underlying shadcn/ui | Use `--base radix` flag (default) |
| 21st.dev registry | Component registry | Advanced UI blocks | Install via shadcn CLI the same way as shadcn components |

**Init command (2026):**
```bash
npx shadcn@latest init
```
Do NOT use `npx shadcn-ui@latest` — the package was renamed to `shadcn`. The `shadcn-ui` package on npm is unmaintained.

**Adding components:**
```bash
npx shadcn@latest add button card table chart
npx shadcn@latest add button --dry-run   # preview before writing
npx shadcn@latest add button --diff      # show what changes
```

**Adding from 21st.dev:** 21st.dev components are installable via the shadcn registry URL pattern:
```bash
npx shadcn@latest add "https://21st.dev/r/[component-name]"
```

### Fonts

| Font | Import Name | Use |
|------|------------|-----|
| Space Mono | `Space_Mono` | Monospace: prices, tickers, numerical data |
| Syne | `Syne` | Display: headings, dashboard titles |

**Setup in `app/layout.tsx`:**
```typescript
import { Space_Mono, Syne } from 'next/font/google'

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

**`tailwind.config.ts` extension:**
```typescript
fontFamily: {
  mono: ['var(--font-space-mono)', 'monospace'],
  display: ['var(--font-syne)', 'sans-serif'],
}
```

`next/font/google` downloads fonts at build time and self-hosts them — zero runtime requests to Google. This is the only correct approach; do NOT use `<link>` tags to fonts.googleapis.com.

### Data Fetching / Polling

**Recommendation: TanStack Query v5 (React Query)**

For a financial dashboard with 60-second polling across multiple data sources, TanStack Query is the correct choice over raw `setInterval` or SWR.

| Library | Bundle | Polling | DevTools | Verdict |
|---------|--------|---------|----------|---------|
| TanStack Query v5 | ~13kb gzip | `refetchInterval` | Official DevTools | **Use this** |
| SWR | ~4kb gzip | `refreshInterval` | None official | Insufficient for complex dashboard |
| Raw `setInterval` | 0 | Manual | None | Error-prone, no deduplication |

**Why TanStack Query over SWR for this project:**
- Multiple simultaneous queries (stocks, crypto, FX, macro) with independent polling intervals benefit from TanStack's per-query cache management
- DevTools are essential during development with financial data (inspect cache state, manually trigger refetches)
- Mutation support (watchlist add/remove) integrates cleanly with query invalidation
- SWR's bundle is smaller but insufficient for the coordination complexity required

**60-second polling pattern:**
```typescript
'use client'
import { useQuery } from '@tanstack/react-query'

export function useStockPrice(symbol: string) {
  return useQuery({
    queryKey: ['stock', 'price', symbol],
    queryFn: () => fetch(`/api/stocks/${symbol}`).then(r => r.json()),
    refetchInterval: 60_000,
    staleTime: 55_000, // treat data as fresh for 55s to avoid redundant renders
  })
}
```

**Provider setup — create `app/providers.tsx`:**
```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 2 },
    },
  }))
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

Wrap `app/layout.tsx` body in `<Providers>`. The `'use client'` boundary is correct — QueryClientProvider uses context.

---

## Environment Variables

| Variable | Prefix | Where Used | Reason |
|----------|--------|-----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_` | Browser + Server | Supabase project URL is not secret (it appears in network requests) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_` | Browser + Server | Anon key is safe to expose; Row Level Security (RLS) enforces access control |
| `FINNHUB_API_KEY` | None (server-only) | Route Handlers only | Secret key — NEVER prefix with NEXT_PUBLIC_ |
| `OPEN_EXCHANGE_RATES_APP_ID` | None (server-only) | Route Handlers only | Secret key |
| `FRED_API_KEY` | None (server-only) | Route Handlers only | Secret key |
| `ESKOMSEPUSH_API_KEY` | None (server-only) | Route Handlers only | Secret key |
| `SUPABASE_SERVICE_ROLE_KEY` | None (server-only) | Server Components / Admin routes only | Bypasses RLS — treat as root password, never expose |

**Rule:** Any key that grants access to a paid API or bypasses security controls must live in a server-only variable. Access it only inside Route Handlers (`app/api/**/route.ts`), Server Components, or Server Actions. Netlify environment variables set in the dashboard are available server-side without any `NEXT_PUBLIC_` prefix.

**`.env.local` template:**
```bash
# Public — safe to expose
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Server-only — never expose to client
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FINNHUB_API_KEY=
OPEN_EXCHANGE_RATES_APP_ID=
FRED_API_KEY=
ESKOMSEPUSH_API_KEY=
```

---

## Supabase Client Patterns

Two client files, no exceptions:

**`lib/supabase/client.ts` — for Client Components:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts` — for Server Components, Server Actions, Route Handlers:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**Auth verification rule:** Always use `supabase.auth.getUser()` to verify sessions in server code. Never use `supabase.auth.getSession()` server-side — it does not revalidate the JWT against the Supabase auth server and can return stale session data.

**Middleware (`middleware.ts`):** Required for session token refresh. Without it, server components will see expired sessions on subsequent requests. Middleware runs on every request, calls `getUser()` to refresh the token, and propagates updated cookies in both request and response.

---

## netlify.toml Configuration

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NEXT_TELEMETRY_DISABLED = "1"

# Security headers applied to all routes
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    # CSP — adjust connect-src as external APIs are integrated
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://finnhub.io https://api.coingecko.com https://openexchangerates.org https://api.stlouisfed.org https://alternative.me https://developer.sepush.co.za;
      frame-ancestors 'none';
    """

# Cache static assets aggressively
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Known issue:** The Netlify Next.js adapter (OpenNext) handles headers primarily through its own pipeline. Headers in `netlify.toml` apply at the CDN layer before the function runs, but Next.js SSR responses may return headers set within the Next.js middleware or `next.config.ts` headers config instead. **For security headers that must appear on every response including SSR pages, set them in both `netlify.toml` and `next.config.ts`.**

**`next.config.ts` headers (mirror critical security headers):**
```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ]
}
```

---

## Full Installation Commands

```bash
# 1. Bootstrap Next.js project
npx create-next-app@14 meridian --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. shadcn/ui init (CLI v4)
npx shadcn@latest init

# 3. Core runtime dependencies
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  @tanstack/react-query \
  lightweight-charts \
  lucide-react

# 4. TanStack Query DevTools (dev only)
npm install -D @tanstack/react-query-devtools

# 5. shadcn/ui components (add as needed)
npx shadcn@latest add button card table badge skeleton tabs select tooltip dialog sheet

# 6. Verify lightweight-charts version
npm ls lightweight-charts  # should show 5.1.x
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Deployment mode | SSR (default Next.js build) | `output: 'export'` (static) | Static export breaks Supabase cookie auth (middleware cannot set cookies), Server Actions, and Route Handlers |
| Polling | TanStack Query v5 | SWR | SWR has no official DevTools; less feature-rich for multi-query coordination |
| Polling | TanStack Query v5 | Raw `setInterval` | No deduplication, no caching, no error retry, memory leak risk on unmount |
| Charts | lightweight-charts v5 | Recharts / Chart.js | Neither supports financial OHLCV candlestick charts natively; lightweight-charts is purpose-built |
| Charts | lightweight-charts v5 | TradingView full Charting Library | Requires commercial license for non-open-source projects |
| Supabase auth | `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | auth-helpers is deprecated; SSR package is the official replacement |
| Fonts | `next/font/google` | `<link>` to Google Fonts CDN | CDN approach adds render-blocking requests and privacy concerns; next/font self-hosts at build time |
| Netlify adapter | Unpinned (auto-update) | Pinned version | Pinning causes adapter/Next.js version drift; Netlify explicitly recommends against pinning |

---

## Sources

- Netlify Next.js adapter docs: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- OpenNext Netlify: https://opennext.js.org/netlify
- Supabase SSR package: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase Next.js SSR setup: https://supabase.com/docs/guides/auth/server-side/nextjs
- shadcn CLI v4 changelog: https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- shadcn CLI docs: https://ui.shadcn.com/docs/cli
- lightweight-charts npm: https://www.npmjs.com/package/lightweight-charts (v5.1.0 confirmed current)
- TanStack Query Advanced SSR: https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr
- Next.js data security guide: https://nextjs.org/docs/app/guides/data-security
- Next.js font optimization: https://nextjs.org/docs/app/getting-started/fonts
- Netlify custom headers: https://docs.netlify.com/manage/security/content-security-policy/
- Netlify free tier limits: https://hamsterstack.com/pricing/netlify/ (125k function invocations/month confirmed)
