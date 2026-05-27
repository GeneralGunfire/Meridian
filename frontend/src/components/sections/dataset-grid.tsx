"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fetchFiles, fetchStatus } from "@/lib/datasets";
import type { FilesResponse, DatasetEntry, FileRelease, StatusResponse } from "@/lib/datasets";

// ── icons ─────────────────────────────────────────────────────────────────────
function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-neutral-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
function ExternalLink() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const METHOD_LABELS: Record<string, string> = {
  api: "Live API",
  parse: "PDF / Excel",
  scrape: "Web scrape",
  manual: "Manual",
};

const CADENCE_ORDER = ["weekly", "monthly", "quarterly", "annual"] as const;

// ── status dot ────────────────────────────────────────────────────────────────
function StatusDot({ dsId, status }: { dsId: string; status: StatusResponse | null }) {
  if (!status) return null;
  const ds = status.datasets[dsId];
  if (!ds) return null;
  const color = ds.success ? "bg-emerald-500" : ds.skipped ? "bg-neutral-300" : "bg-red-500";
  const title = ds.success
    ? `Updated ${ds.last_updated ?? "—"}`
    : ds.skipped ? "No data yet" : `Error: ${ds.error ?? "unknown"}`;
  return <span className={`inline-block h-2 w-2 rounded-full ${color} shrink-0`} title={title} />;
}

// ── file release row ──────────────────────────────────────────────────────────
function ReleaseRow({ file, dsId }: { file: FileRelease; dsId: string }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-3 text-sm border-b border-black/5 last:border-0 hover:bg-neutral-50/60 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-1 rounded-md">
          {file.period}
        </span>
        <span className="text-xs text-neutral-400">{file.date}</span>
        <span className="text-xs text-neutral-400 font-mono">{file.rows.toLocaleString()} rows</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => triggerDownload(file.csv_url, `meridian_${dsId}_${file.period}.csv`)}
          className="flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 transition-all hover:border-black/30 hover:text-neutral-900"
        >
          <DownloadIcon /> CSV
        </button>
        <button
          onClick={() => triggerDownload(file.xlsx_url, `meridian_${dsId}_${file.period}.xlsx`)}
          className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-100"
        >
          <DownloadIcon /> Excel
        </button>
      </div>
    </div>
  );
}

// ── dataset card ──────────────────────────────────────────────────────────────
function DatasetCard({ ds, status }: { ds: DatasetEntry; status: StatusResponse | null }) {
  const [open, setOpen] = useState(false);
  const hasFiles = ds.files.length > 0 || !!ds.history;
  const latest = ds.files[0];

  return (
    <div className={`rounded-xl border ${ds.color} overflow-hidden transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]`}>
      {/* Header */}
      <button
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusDot dsId={ds.id} status={status} />
            <h3 className="text-sm font-bold text-[#0a0a0a] leading-snug">{ds.label}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ds.badgeColor}`}>
              {ds.cadence}
            </span>
            <span className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              {METHOD_LABELS[ds.method] ?? ds.method}
            </span>
            {!hasFiles && (
              <span className="rounded-full border border-dashed border-neutral-400/60 px-2 py-0.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                Coming soon
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">{ds.description}</p>
          {/* Grain line — what one row represents */}
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-500">
            <svg className="h-3 w-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="font-medium">{ds.grain}</span>
            <span className="text-neutral-300">·</span>
            <span>{ds.columns.length} columns</span>
            {latest && <><span className="text-neutral-300">·</span><span>latest <span className="font-mono font-semibold">{latest.period}</span></span></>}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 mt-0.5">
          {latest && !open && (
            <span
              role="button"
              tabIndex={0}
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2 text-[11px] font-semibold text-[#f5f0e8] transition-all hover:bg-neutral-800 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); triggerDownload(latest.csv_url, `meridian_${ds.id}_${latest.period}.csv`); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); triggerDownload(latest.csv_url, `meridian_${ds.id}_${latest.period}.csv`); } }}
            >
              <DownloadIcon /> Latest CSV
            </span>
          )}
          <ChevronDown open={open} />
        </div>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-black/8 bg-white/70">
              {/* Column dictionary — name + human label + unit */}
              <div className="px-5 py-4 border-b border-black/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    What&apos;s in this file
                  </span>
                  <a
                    href={ds.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    Source: {ds.source} <ExternalLink />
                  </a>
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {ds.columns.map((c) => (
                    <div key={c.name} className="flex items-baseline justify-between gap-3 border-b border-dashed border-black/5 pb-1.5">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <code className="font-mono text-[11px] text-neutral-800 truncate">{c.name}</code>
                        <span className="text-[11px] text-neutral-500 truncate">{c.label}</span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 shrink-0">{c.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Releases */}
              {hasFiles ? (
                <div>
                  {ds.history && (
                    <div className="px-5 py-3 bg-neutral-50/80 border-b border-black/5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Full history (~15 yr)</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => triggerDownload(ds.history!.csv_url, `meridian_${ds.id}_history.csv`)}
                          className="flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-600 hover:border-black/30"
                        >
                          <DownloadIcon /> CSV · {ds.history.rows.toLocaleString()} rows
                        </button>
                        <button
                          onClick={() => triggerDownload(ds.history!.xlsx_url, `meridian_${ds.id}_history.xlsx`)}
                          className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <DownloadIcon /> Excel
                        </button>
                      </div>
                    </div>
                  )}
                  {ds.files.length > 0 && (
                    <>
                      <div className="px-5 py-2 bg-neutral-50/50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                          Recent releases · {ds.files.length}
                        </span>
                      </div>
                      {ds.files.slice(0, 8).map((f) => (
                        <ReleaseRow key={f.period} file={f} dsId={ds.id} />
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-neutral-400 italic">
                    {ds.method === "manual"
                      ? "Awaiting manual data drop — check back soon."
                      : "Scraper not yet run — data coming soon."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── filter chip ───────────────────────────────────────────────────────────────
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
        active
          ? "border-[#0a0a0a] bg-[#0a0a0a] text-[#f5f0e8]"
          : "border-black/12 bg-white/60 text-neutral-600 hover:border-black/30"
      }`}
    >
      {children}
    </button>
  );
}

// ── main export ───────────────────────────────────────────────────────────────
export default function DatasetGrid() {
  const [data, setData] = useState<FilesResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCadence, setActiveCadence] = useState<string | null>(null);
  const [readyOnly, setReadyOnly] = useState(false);

  useEffect(() => {
    Promise.all([fetchFiles(), fetchStatus()])
      .then(([files, st]) => { setData(files); setStatus(st); })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load datasets"))
      .finally(() => setLoading(false));
  }, []);

  // Flatten + filter
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const rows: { category: string; categoryLabel: string; ds: DatasetEntry }[] = [];
    for (const cat of data.categories) {
      if (activeCategory && cat.id !== activeCategory) continue;
      for (const ds of cat.datasets) {
        if (activeCadence && ds.cadence !== activeCadence) continue;
        if (readyOnly && ds.files.length === 0 && !ds.history) continue;
        if (q) {
          const haystack = [
            ds.label, ds.description, ds.source, ds.grain,
            ...ds.columns.map((c) => `${c.name} ${c.label}`),
          ].join(" ").toLowerCase();
          if (!haystack.includes(q)) continue;
        }
        rows.push({ category: cat.id, categoryLabel: cat.label, ds });
      }
    }
    return rows;
  }, [data, query, activeCategory, activeCadence, readyOnly]);

  // group filtered back into categories for display
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: DatasetEntry[] }>();
    for (const r of filtered) {
      if (!map.has(r.category)) map.set(r.category, { label: r.categoryLabel, items: [] });
      map.get(r.category)!.items.push(r.ds);
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [filtered]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 flex justify-center">
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading datasets…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <p className="text-sm text-red-500">{error ?? "Could not load dataset catalog."}</p>
      </div>
    );
  }

  const total = data.categories.reduce((n, c) => n + c.datasets.length, 0);
  const hasActiveFilters = query || activeCategory || activeCadence || readyOnly;

  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-6xl">
        {/* Sticky filter bar */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-[#f5f0e8]/90 backdrop-blur-md border-b border-black/8">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-lg border border-black/12 bg-white/80 px-3 py-2.5 focus-within:border-black/40 transition-colors">
              <SearchIcon />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search datasets, sources, columns…"
                className="flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-neutral-400 hover:text-neutral-700 text-xs font-semibold">
                  Clear
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mr-1">Category</span>
                {data.categories.map((c) => (
                  <Chip key={c.id} active={activeCategory === c.id} onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}>
                    {c.label}
                  </Chip>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mr-1">Cadence</span>
                {CADENCE_ORDER.map((c) => (
                  <Chip key={c} active={activeCadence === c} onClick={() => setActiveCadence(activeCadence === c ? null : c)}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Chip>
                ))}
              </div>
              <Chip active={readyOnly} onClick={() => setReadyOnly((r) => !r)}>
                Available now
              </Chip>
              {hasActiveFilters && (
                <button
                  onClick={() => { setQuery(""); setActiveCategory(null); setActiveCadence(null); setReadyOnly(false); }}
                  className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 underline underline-offset-2"
                >
                  Reset all
                </button>
              )}
              <span className="ml-auto text-[11px] font-medium text-neutral-500">
                {filtered.length} of {total} datasets
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-10 pt-8">
          {grouped.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-neutral-400">No datasets match your filters.</p>
            </div>
          ) : (
            grouped.map((group) => (
              <section key={group.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]">{group.label}</h2>
                  <div className="h-px flex-1 bg-black/8" />
                  <span className="text-[10px] font-semibold text-neutral-400">{group.items.length}</span>
                </div>
                <div className="space-y-3">
                  {group.items.map((ds, i) => (
                    <motion.div
                      key={ds.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2) }}
                    >
                      <DatasetCard ds={ds} status={status} />
                    </motion.div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <p className="text-center text-xs text-neutral-400 pt-10">
          All datasets sourced from official SA government publications and versioned in Git.
          CSV is committed; Excel is generated on download. Previous releases are never deleted.
        </p>
      </div>
    </section>
  );
}
