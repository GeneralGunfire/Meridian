# Domain Pitfalls: Meridian Data Intelligence Portal

**Domain:** Next.js 14+ financial dashboard, Netlify free tier, Supabase RLS, live market data
**Researched:** 2026-04-07
**Confidence:** HIGH (most claims verified against official docs or multiple sources)

---

## Critical Pitfalls

Mistakes in this category cause broken deploys, security breaches, or complete data exposure.

---

### Pitfall 1: Next.js Middleware Is Not a Security Boundary for the Admin Route

**What goes wrong:** The "hidden" admin route is protected only by Next.js middleware checking for a cookie or token. An attacker adds the `x-middleware-subrequest` header to their request and the middleware is skipped entirely, exposing the admin page without authentication.

**Why it happens:** CVE-2025-29927 (CVSS 9.1, disclosed March 2025) revealed that Next.js internally used the `x-middleware-subrequest` header to prevent infinite middleware loops. Any external request carrying that header bypasses middleware completely. Affected versions: Next.js < 14.2.25 and < 15.2.3.

**Consequences:** Admin route is fully accessible to anyone who knows the header trick. Netlify and Vercel strip this header at the edge, so hosted deployments are protected — but only if on a current runtime version.

**Prevention:**
- Pin `next` to `>= 14.2.25` or `>= 15.2.3` in `package.json`.
- Never treat middleware as the sole auth check. Re-verify authentication inside the Server Component or Route Handler that renders the admin page itself. Middleware is a first filter, not the lock.
- Use Supabase server-side session verification (`createServerComponentClient`) inside the admin page component as the real gate.

**Warning signs:**
- Admin page renders without a valid session when tested with curl + custom headers.
- `middleware.ts` is the only place authentication is checked.

**Phase:** Address in Phase 1 (project skeleton and route setup). Do not defer.

---

### Pitfall 2: Supabase RLS Gaps That Expose Data Despite Using the Anon Key Correctly

**What goes wrong:** The developer enables RLS on some tables but forgets others, or writes a SELECT policy with `USING (true)` that exposes all rows to the anon role, or relies on the SQL Editor to test queries (which bypasses RLS entirely).

**Why it happens:**
- RLS is **opt-in per table** in Supabase. A new table has RLS disabled until explicitly turned on.
- The Supabase SQL Editor runs as the `postgres` superuser role and ignores RLS. A query that returns correct results there may return all rows when executed via the anon key from the client SDK.
- INSERT operations require both a `WITH CHECK` clause and a SELECT policy (Postgres SELECTs newly inserted rows to return them — this fails without SELECT access).
- `auth.uid()` in a policy will always return `null` for the anon role, silently allowing or denying all rows depending on how the policy is written.

**Consequences:** Any table without RLS enabled is fully readable and writable by anyone with the anon key. The anon key is intentionally public-facing (embedded in the client bundle), so the exposed tables are effectively public.

**Prevention:**
- Enable RLS on every table at creation time. Make it a schema migration rule, not an afterthought.
- Test all policies using the Supabase client SDK with the anon key, not the SQL Editor.
- Use `curl` to verify: `curl 'https://<project>.supabase.co/rest/v1/<table>' -H "apikey: <anon_key>"`. An empty array `[]` is correct; seeing data rows means RLS is missing or misconfigured.
- For read-only public data (e.g. watchlist defaults), use an explicit `USING (true)` SELECT policy and NO INSERT/UPDATE/DELETE policies rather than disabling RLS entirely.
- Never commit the `service_role` key anywhere. It bypasses all RLS unconditionally.

**Warning signs:**
- Tables created via Supabase dashboard migrations without an explicit `ALTER TABLE x ENABLE ROW LEVEL SECURITY` step.
- Policies that use `auth.uid()` but the feature is single-admin with no Auth users.
- New tables added during development that were "just for testing."

**Phase:** Address in Phase 1 (database schema setup). Audit every table before Phase 2 begins.

---

### Pitfall 3: TradingView Lightweight Charts Crashing on SSR

**What goes wrong:** Importing `lightweight-charts` in a Next.js App Router component without isolating it to the client causes a build error or runtime crash: `window is not defined` or `document is not defined` during server-side rendering.

**Why it happens:** Lightweight Charts is a canvas-based library that calls browser APIs (`window`, `document`, `HTMLCanvasElement`) at import time. The Next.js server runtime has none of these. The library's maintainers explicitly document that it cannot run in an SSR context.

**Consequences:** Build fails or page throws a hydration error. The chart never renders. In some configurations the error is swallowed and the component silently mounts as empty.

**Prevention:**
- Wrap every chart component in `dynamic(() => import('./ChartComponent'), { ssr: false })` (Pages Router) or add `'use client'` to the component AND guard initialization inside `useEffect` (App Router).
- Never call `createChart()` at module scope — always inside `useEffect` after mount.
- Clean up the chart instance in the `useEffect` return: `return () => chart.remove()`. Failing to do this causes memory leaks and duplicate chart instances on React StrictMode's double-invocation.

**Warning signs:**
- `ReferenceError: window is not defined` in the terminal during `next build` or `next dev`.
- Chart container renders as an empty `<div>` with no canvas child in the DOM.
- Console warning about hydration mismatch between server and client HTML.

**Resize / Canvas Sizing Pitfall (secondary):** The `autoSize` option uses a `ResizeObserver` internally. In React, if the container div's size is controlled by flexbox and the chart initializes before layout is complete, the chart renders at 0px height. The `ResizeObserver loop completed with undelivered notifications` console error appears frequently and is benign (the browser deferring callbacks to the next frame) but signals that the container's dimensions are unstable.

**Prevention for sizing:** Set an explicit `height` on the container element before chart initialization. Use `autoSize: true` only after the container has a non-zero bounding rect, or pass explicit `width`/`height` from a `ResizeObserver` callback debounced with `requestAnimationFrame`.

**Phase:** Address in Phase 2 (chart components). Establish the `'use client'` + `useEffect` pattern in the first chart built and reuse it everywhere.

---

### Pitfall 4: Rate Limit Exhaustion Across Multiple Financial APIs

**What goes wrong:** Multiple dashboard tiles each run their own `setInterval` polling loop. Each interval fires independently. On page load, all timers start simultaneously, firing a burst of requests to every API at once. This exhausts per-minute limits (Finnhub: 60/min, CoinGecko: 5-15 calls/min on public plan) within seconds of the page opening.

**Specific limits to internalize:**
| API | Free Limit | Notes |
|-----|-----------|-------|
| Finnhub | 60 calls/minute | Websocket available for quotes |
| CoinGecko | 5-15 calls/minute | Endpoint-level cache: 1-5 min |
| Open Exchange Rates | 1,000 calls/month | ~33/day — treat as precious |
| EskomSePush | 50 calls/day | 2 calls consumed per fetch; hourly refresh = 48 calls |

**Why it happens:**
- Each React component managing its own polling timer with no coordination.
- Re-mounting components (route navigation, React StrictMode double-invoke) resets timers and causes duplicate requests.
- No in-memory cache — every poll hits the API even if the data hasn't changed.
- Retry logic that fires immediately on 429 instead of backing off.

**Consequences:** 429 errors within minutes of the dashboard opening. Open Exchange Rates (1,000/month) can be fully exhausted in a single day of testing. EskomSePush (50/day) can be exhausted in under two hours with naive polling.

**Prevention:**
- Centralize all polling in a single data-fetching service or React Context provider, not per-component timers.
- Cache responses in memory with a TTL matching each API's native cache window (CoinGecko caches endpoints for 1-5 min — polling faster than that wastes quota).
- For EskomSePush: fetch once per hour maximum, store result in Supabase, serve from DB. Never poll directly from the browser.
- For Open Exchange Rates: fetch once per day via a scheduled function or on-demand with a 24-hour Supabase cache. This is a monthly quota — each call costs ~0.001% of the monthly budget.
- Stagger timer starts with `setTimeout` offsets to avoid simultaneous bursts.
- On 429: exponential backoff with jitter (e.g., `baseDelay * 2^attempt + Math.random() * 1000ms`). Never retry immediately.
- Check `Retry-After` response headers before assuming a retry interval.

**Warning signs:**
- Browser Network tab shows multiple simultaneous requests to the same API endpoint on page load.
- 429 responses appearing in console within the first few minutes of running the app.
- `useEffect` with an empty dependency array containing a `setInterval` that is not cleared on unmount.

**Phase:** Address in Phase 2 (data layer). Design the central polling architecture before building any tiles. Retrofitting this is painful.

---

## Moderate Pitfalls

---

### Pitfall 5: CLS from Live Data Updates Causing Layout Instability

**What goes wrong:** Number tiles update their displayed value every 60 seconds. If the tile has no fixed dimensions, the new value (e.g. a longer number) causes the tile to resize, shifting surrounding elements. Skeleton loaders that don't match the final content height cause a secondary CLS event when data arrives.

**Why it happens:**
- Number display elements sized by content (`width: fit-content`) expand when a larger value loads.
- Skeleton placeholder is a different height than the rendered data tile.
- Fonts using `font-display: swap` swap in after layout, causing a reflow if the fallback and web font have different metrics.

**Consequences:** Google CLS score above 0.1 (poor). Perceived jitter on every 60-second poll cycle. Particularly visible with financial data where values change magnitude (e.g. $99 → $1,000).

**Prevention:**
- Fix tile dimensions (`min-height`, `min-width`) so number changes never resize the container.
- Skeleton components must exactly match the height of the populated state — measure the final rendered height and hardcode it.
- Use `tabular-nums` font variant feature on all numeric displays to prevent width variation between digits.
- Animate value changes with a number interpolation/counter animation rather than instant replacement — this hides the shift visually even if some reflow occurs.
- Use Next.js `next/font` with `adjustFontFallback: true` (enabled by default) which generates a CSS `size-adjust` fallback that keeps the fallback font dimensionally identical to the web font.

**Warning signs:**
- Chrome DevTools Performance tab shows layout events coinciding with data fetch completions.
- Lighthouse CLS score above 0.1.
- Tiles visibly "jump" when refreshed during development.

**Phase:** Address during Phase 2 tile development. Reserve time for layout stability testing with mock data changes.

---

### Pitfall 6: shadcn/ui Dark Theme CSS Variable Conflicts

**What goes wrong:** The project uses a custom financial dark theme (Space Mono, custom brand colours). After installing shadcn/ui, its CSS variables in `globals.css` overwrite the existing theme variables, or the `.dark` class selector conflicts with the project's own dark mode implementation.

**Why it happens:**
- shadcn/ui's `init` command rewrites `globals.css` and `tailwind.config.ts`. If those files already exist with custom variables, the init either overwrites them silently or the two sets of variables coexist with conflicting names.
- Tailwind v4 requires `@theme inline` to map CSS variables. Projects that mix Tailwind v3 and v4 conventions end up with variables defined in CSS but not mapped to Tailwind utility classes.
- shadcn/ui components reference `hsl(var(--background))` format. Custom themes that define colours as hex or rgb break all shadcn components.

**Consequences:** shadcn components render with wrong colours or fall back to transparent/white. The chart background and card backgrounds diverge from the design intent. Dark mode toggle applies only to shadcn components, not the custom elements.

**Prevention:**
- Before running `npx shadcn@latest init`, snapshot `globals.css` and `tailwind.config.ts`.
- Define all custom brand colours as HSL CSS variables (`--brand-primary: 210 100% 56%`) before init, then map them in `globals.css` after init. Do not define colours outside the CSS variable system.
- Audit variables post-init: every variable that shadcn declares (`--background`, `--foreground`, `--card`, `--primary`, etc.) should be intentionally set to project values, not left at shadcn defaults.
- Test each shadcn component in both light and dark mode after theme changes — the `.dark` selector block in `globals.css` must fully redefine every variable.

**Warning signs:**
- Components appear white/light on a dark background.
- `globals.css` has duplicate variable declarations.
- The `tailwind.config.ts` `colors` section references hardcoded hex values rather than CSS variable references.

**Phase:** Address in Phase 1 (design system setup). Resolve before building any UI components — fixing theme conflicts mid-build cascades across every component.

---

### Pitfall 7: Power BI Publish to Web Iframe Blocked by CSP or Admin Policy

**What goes wrong:** The Power BI Publish to Web embed URL either (a) fails to load because the Next.js app's Content Security Policy blocks the Microsoft iframe origin, or (b) the Power BI tenant admin has disabled Publish to Web, preventing new embed codes from being generated at all.

**Why it happens:**
- As of 2025, Microsoft changed the default: Power BI **blocks new embed code generation by default**. Tenant administrators must explicitly enable Publish to Web for their org or user group.
- Existing embed codes continue to work. New ones require admin opt-in.
- Next.js/Netlify may add default CSP headers that omit `app.powerbi.com` from `frame-src`.
- Publish to Web is also blocked for reports that use Row-Level Security (RLS) — the feature is explicitly incompatible.

**Additional concern — data is fully public:** Publish to Web has NO authentication. Any report embedded this way is accessible to the entire internet without login. Do not embed reports containing personally identifiable information, confidential business data, or anything not classified as explicitly public.

**Consequences:** The Power BI widget section of the dashboard is blank or shows a browser security error. If blocked by tenant policy, no embed code exists to embed.

**Prevention:**
- Verify the Power BI account's tenant has Publish to Web enabled before the Power BI phase begins. Test by generating a single embed code manually in the Power BI service UI.
- Configure `next.config.js` headers or Netlify `_headers` to include `frame-src https://app.powerbi.com` in the CSP.
- Do NOT set `Cross-Origin-Opener-Policy: same-origin` on the Meridian app — this header blocks Power BI's authentication popups.
- Plan for the fallback: if Publish to Web is unavailable, render a static screenshot image + "Open in Power BI" deep link rather than an empty iframe.

**Warning signs:**
- Browser console shows `Refused to frame 'https://app.powerbi.com'` due to CSP.
- The Power BI service UI shows "Publish to web is disabled by your organization's admin."
- Iframe loads a blank white page instead of the report.

**Phase:** Verify Power BI embed access in Phase 1 (prerequisites check). Build the iframe component in the Power BI phase with a fallback state from the start.

---

### Pitfall 8: Netlify Free Tier Limits That Suspend the Site Without Warning

**What goes wrong:** The site is paused mid-month because it exceeded Netlify's free tier bandwidth (100GB/month) or function invocations (125,000/month). The suspension is immediate and the site returns a Netlify error page to all visitors until the next billing cycle.

**Why it happens:**
- 100GB bandwidth sounds large but financial dashboards with live data polling load the page repeatedly. A data-heavy page at 2-3MB per load supports roughly 33,000-50,000 page views per month — not a lot for a shared dashboard.
- Every 60-second poll that goes through a Next.js Route Handler (API route) counts as a serverless function invocation. At 60-second intervals with one user, that's 1,440 invocations per day per user, or ~43,000/month per concurrent user.
- Netlify switched to credit-based pricing in September 2025. Overages are now charged in credits rather than being cleanly stopped — the billing model is harder to predict.
- Serverless function timeout is 10 seconds on the free tier (26 seconds on Pro). Any Route Handler that makes multiple sequential API calls or does non-trivial processing risks timing out.

**Consequences:** Site is suspended until the billing cycle resets. No warning email is reliably sent before suspension occurs.

**Prevention:**
- Keep API polling client-side (browser `setInterval`) rather than server-side Route Handlers where possible. Client-side polling does not consume function invocations.
- Reserve Route Handlers for operations that need secrets (API keys that must not be exposed) — not all data fetching.
- Monitor the Netlify dashboard usage page weekly during development and launch.
- Set a `netlify.toml` function timeout value and test that no handler exceeds 8 seconds (leave 2s margin).
- Compress all static assets. Use Next.js Image Optimization. Every MB saved extends the bandwidth headroom.
- Consider a Supabase-based proxy for the APIs that require server-side keys — fetch from Supabase Edge Functions (free tier: 500,000 invocations/month) rather than Netlify Functions.

**Warning signs:**
- Netlify usage dashboard showing >50GB bandwidth before mid-month.
- Function invocation count climbing past 80,000 mid-month.
- Any Route Handler that awaits multiple API calls in sequence.

**Phase:** Address in Phase 1 (architecture decisions). Decide which API calls are client-side vs server-side before writing any data fetching code.

---

## Minor Pitfalls

---

### Pitfall 9: localStorage Watchlist Failing in Safari Private Mode

**What goes wrong:** The watchlist feature uses `localStorage` to persist the user's selected tickers. In Safari's Private Browsing mode, `localStorage` appears to exist on the `window` object but `setItem` throws a `QuotaExceededError` exception. The watchlist silently fails to save, and on the next load it is empty.

**Why it happens:** Safari sets the `localStorage` quota to 0 bytes in Private Browsing mode. Unlike Chrome, which simply blocks writes with a clear error, Safari makes the API available but throws on any write attempt.

**Consequences:** Watchlist state is lost on every page load for Private Browsing users. If the error is uncaught, it may crash adjacent UI code.

**Prevention:**
```typescript
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Safari private mode, storage full, or storage disabled
    // Fall through silently — watchlist is session-only in this case
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
```
- Always wrap `localStorage` calls in try/catch. Never call `localStorage` methods directly.
- Consider an in-memory fallback (React state or a module-level variable) for the current session when storage is unavailable.
- Do not use `typeof localStorage !== 'undefined'` as a guard — this passes in Safari Private Mode and gives a false sense of safety.

**Warning signs:**
- `QuotaExceededError` or `SecurityError` in the browser console.
- Watchlist resets on every page load when tested in Safari Private Browsing.
- Code contains bare `localStorage.setItem()` calls without try/catch.

**Phase:** Address in Phase 3 (watchlist feature). Simple fix, but must be intentional.

---

### Pitfall 10: Font Loading FOUT with Space Mono and Syne

**What goes wrong:** Space Mono and Syne load via `next/font/google`. During initial page load, before the fonts are available, the browser renders text in a system fallback font. When the web fonts arrive, the text reflows. This is Flash of Unstyled Text (FOUT), and it scores against CLS.

**Why it happens:** `next/font` uses `font-display: swap` by default, which tells the browser to immediately render text with a fallback and swap in the web font when ready. The swap causes a layout shift if the fallback font has different metrics (character width, line height) than the web font.

**Note:** `next/font` partially mitigates this with an auto-generated `size-adjust` CSS value on the fallback font, making its metrics approximate the web font. However, Space Mono (monospace) and Syne (display) are unusual enough that the auto-generated fallback metrics may not be close enough to eliminate shift.

**Consequences:** Visible text "jump" on first load, particularly in the header and any monospace data values. CLS score penalty.

**Prevention:**
- Use `next/font/google` (NOT a `<link>` tag to fonts.googleapis.com). The `next/font` API downloads fonts at build time, self-hosts them, and generates the `size-adjust` fallback automatically.
- Set `display: 'swap'` explicitly (it is the default but being explicit documents intent).
- For Space Mono specifically: since it is a monospace font used for data values, consider using `display: 'block'` instead — this hides text briefly rather than showing a non-monospace fallback that causes significant width shift in numeric displays.
- Add `preload: true` (default) to ensure the font is in the critical path.
- Test CLS in Chrome DevTools with CPU throttling enabled — FOUT is invisible on fast machines.

**Warning signs:**
- Fonts loaded via `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` in `layout.tsx` instead of `next/font`.
- Visible reflow of the header text during Lighthouse testing.
- Lighthouse CLS score above 0.1 caused by font-related layout shifts.

**Phase:** Address in Phase 1 (design system / layout setup). Import fonts once in `layout.tsx` using `next/font` from the start. Retrofitting font loading is straightforward but tedious.

---

## Phase-Specific Warnings Summary

| Phase | Topic | Most Likely Pitfall | Mitigation |
|-------|-------|---------------------|------------|
| Phase 1 | Project skeleton | CVE-2025-29927 middleware bypass | Re-verify auth in Server Component, not only middleware |
| Phase 1 | Database schema | RLS gaps on new tables | Enable RLS on every table at migration time |
| Phase 1 | Design system | shadcn/ui CSS variable conflict | Snapshot globals.css before shadcn init |
| Phase 1 | Font setup | FOUT / CLS from font swap | Use `next/font/google` only, never direct Google Fonts link tag |
| Phase 1 | Architecture | Netlify function invocation overuse | Decide client-side vs server-side polling before writing data layer |
| Phase 2 | Chart components | SSR crash on Lightweight Charts import | `'use client'` + `useEffect` init pattern, never import at module scope |
| Phase 2 | Data layer | Rate limit exhaustion across APIs | Central polling service with per-API TTL cache before building tiles |
| Phase 2 | Data tiles | CLS on value updates | Fixed tile dimensions, tabular-nums, skeleton height matching |
| Phase 3 | Power BI embed | Tenant admin block + CSP | Pre-verify embed code generation; add `frame-src app.powerbi.com` to CSP |
| Phase 3 | Watchlist | Safari Private localStorage crash | Wrap all localStorage calls in try/catch from first line |
| Phase 4 | EskomSePush | 50/day quota exhausted | Cache in Supabase, refresh hourly maximum, never poll from browser |
| Phase 4 | Open Exchange Rates | 1,000/month quota exhausted | Cache in Supabase with 24-hour TTL, one fetch per day absolute maximum |

---

## Sources

- [CVE-2025-29927: Next.js Middleware Authorization Bypass - ProjectDiscovery](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass)
- [Next.js on Netlify - Official Docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
- [Supabase RLS Simplified - Official Troubleshooting](https://supabase.com/docs/guides/troubleshooting/rls-simplified-BJTcS8)
- [Supabase Security Flaw: 170+ Apps Exposed - byteiota](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)
- [Hacking Misconfigured Supabase Instances - DeepStrike](https://deepstrike.io/blog/hacking-thousands-of-misconfigured-supabase-instances-at-scale)
- [TradingView Lightweight Charts SSR Issue #543 - GitHub](https://github.com/tradingview/lightweight-charts/issues/543)
- [ResizeObserver Loop Error - TrackJS](https://trackjs.com/javascript-errors/resizeobserver-loop-completed-with-undelivered-notifications/)
- [CoinGecko Rate Limits - Official Docs](https://docs.coingecko.com/docs/common-errors-rate-limit)
- [Finnhub Rate Limits - Official Docs](https://finnhub.io/docs/api/rate-limit)
- [EskomSePush API - Official Docs](https://documenter.getpostman.com/view/1296288/UzQuNk3E)
- [Publish to Web from Power BI - Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web)
- [Power BI Publish to Web Security - Excelerator BI](https://exceleratorbi.com.au/publish-web-not-secure/)
- [Netlify Free Tier Limits 2025 - Flexprice](https://flexprice.io/blog/complete-guide-to-netlify-pricing-and-plans)
- [Netlify Function Timeout Bypass - Damian Wroblewski](https://damianwroblewski.com/en/blog/how-to-bypass-the-netlify-serverless-function-timeout/)
- [Safari localStorage Private Mode - muffinman.io](https://muffinman.io/blog/localstorage-and-sessionstorage-in-safaris-private-mode/)
- [Next.js Font Optimization - Official Docs](https://nextjs.org/docs/14/app/building-your-application/optimizing/fonts)
- [shadcn/ui Theming - Official Docs](https://ui.shadcn.com/docs/theming)
- [shadcn/ui Troubleshooting - BetterLink Blog](https://eastondev.com/blog/en/posts/dev/20260402-shadcn-ui-troubleshooting/)
- [Next.js Environment Variables Security - DEV Community](https://dev.to/koyablue/the-pitfalls-of-nextpublic-environment-variables-96c)
- [Supabase RLS Performance Best Practices - Official Docs](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
