"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchFiles, fetchStatus } from "@/lib/datasets";
import type { FilesResponse, DatasetEntry, StatusResponse } from "@/lib/datasets";
import { CardStack } from "@/components/ui/card-stack";
import type { CardStackItem } from "@/components/ui/card-stack";
import { Folder } from "@/components/ui/folder-3d";
import type { FolderItem } from "@/components/ui/folder-3d";
import { DatasetDetailCard } from "@/components/ui/dataset-detail-card";
import type { DatasetDetailCardProps } from "@/components/ui/dataset-detail-card";
import { Search, SlidersHorizontal } from "lucide-react";

// ── Image maps ─────────────────────────────────────────────────────────────────
// Category fallbacks — used when a dataset has no specific image
const CATEGORY_IMAGES: Record<string, string> = {
  // Johannesburg Stock Exchange trading floor — finance & economy
  economy: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=800&auto=format&fit=crop",
  // High-voltage power lines at sunset — energy infrastructure
  energy:  "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop",
  // Cape Town housing & community — social context
  social:  "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=800&auto=format&fit=crop",
  // Police / law enforcement vehicle — safety
  safety:  "https://images.unsplash.com/photo-1453873531674-2151bcd01707?q=80&w=800&auto=format&fit=crop",
};

const DATASET_IMAGES: Record<string, string> = {
  // SARS office building / tax documents — revenue collection
  tax_revenue:          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop",
  // National Treasury / Parliament Cape Town — government budget
  budget_spending:      "https://images.unsplash.com/photo-1541726260-e6b6a6a08b27?q=80&w=800&auto=format&fit=crop",
  // Financial chart / market data on screen — macro indicators
  gdp_macro:            "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=800&auto=format&fit=crop",
  // SA Reserve Bank Pretoria headquarters — monetary policy
  sarb_monetary:        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop",
  // City hall / municipality building — local government finance
  municipal_finance:    "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=800&auto=format&fit=crop",
  // Personal tax / salary slips — income tax
  sars_pit:             "https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=800&auto=format&fit=crop",
  // Shopping / VAT receipts / commerce — VAT & company tax
  sars_vat:             "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
  // Power station / Medupi coal plant — Eskom demand & supply
  eskom_power:          "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop",
  // Industrial turbines / generator hall — generation infrastructure
  eskom_infrastructure: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop",
  // Construction crane / capital expenditure — Eskom spend
  eskom_spending:       "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
  // Electricity meter / billing — Eskom revenue & tariffs
  eskom_revenue:        "https://images.unsplash.com/photo-1548345680-f5475ea5df84?q=80&w=800&auto=format&fit=crop",
  // Water tap / clean water access — water & sanitation
  water:                "https://images.unsplash.com/photo-1559825481-12a05cc00344?q=80&w=800&auto=format&fit=crop",
  // Township / RDP housing South Africa — housing delivery
  housing:              "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=800&auto=format&fit=crop",
  // Job seekers queue / labour market — unemployment
  unemployment:         "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop",
  // Grant recipients / social welfare queue — SASSA grants
  sassa_grants:         "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop",
  // Police station / SAPS — crime statistics
  crime_stats:          "https://images.unsplash.com/photo-1453873531674-2151bcd01707?q=80&w=800&auto=format&fit=crop",
};

// Folder gradients — glassy monochrome, subtle depth differences per category
const CATEGORY_GRADIENTS: Record<string, string> = {
  economy: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(220,220,218,0.85) 100%)",
  energy:  "linear-gradient(145deg, rgba(245,245,243,0.92) 0%, rgba(210,210,207,0.88) 100%)",
  social:  "linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(228,228,226,0.84) 100%)",
  safety:  "linear-gradient(145deg, rgba(240,240,238,0.9) 0%, rgba(200,200,198,0.86) 100%)",
};

function dsImage(id: string, cat: string) {
  return DATASET_IMAGES[id] ?? CATEGORY_IMAGES[cat] ?? CATEGORY_IMAGES.economy;
}

const METHOD_LABELS: Record<string, string> = {
  api: "Live API", parse: "PDF / Excel", scrape: "Web scrape", manual: "Manual",
};

const CADENCE_ORDER = ["weekly", "monthly", "quarterly", "annual"] as const;
const POPULAR_IDS = ["crime_stats", "unemployment", "gdp_macro", "eskom_power", "sars_pit", "sassa_grants", "tax_revenue"];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonFolder() {
  return (
    <div className="flex flex-col items-center gap-3 p-8 rounded-2xl border border-black/8 bg-white/50 animate-pulse" style={{ minWidth: 220, minHeight: 260 }}>
      <div className="h-24 w-28 rounded-lg bg-neutral-200/70" />
      <div className="h-3 w-20 rounded-full bg-neutral-200/70 mt-4" />
      <div className="h-2.5 w-14 rounded-full bg-neutral-200/50" />
    </div>
  );
}

// ── Filter chip ───────────────────────────────────────────────────────────────
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
        active
          ? "border-[#0a0a0a] bg-[#0a0a0a] text-[#f5f0e8]"
          : "border-black/10 bg-white/60 text-neutral-600 hover:border-black/25 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

// ── Dataset detail modal ──────────────────────────────────────────────────────
function DatasetModal({ ds, category, status, onClose }: {
  ds: DatasetEntry;
  category: string;
  status: StatusResponse | null;
  onClose: () => void;
}) {
  const st = status?.datasets[ds.id];
  const latest = ds.files[0];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const props: DatasetDetailCardProps = {
    id: ds.id,
    label: ds.label,
    category: category.charAt(0).toUpperCase() + category.slice(1),
    description: ds.description,
    source: ds.source,
    sourceUrl: ds.sourceUrl,
    cadence: ds.cadence,
    method: ds.method,
    grain: ds.grain,
    columns: ds.columns,
    imageSrc: dsImage(ds.id, category),
    statusSuccess: st?.success,
    statusSkipped: st?.skipped,
    lastUpdated: st?.last_updated ?? undefined,
    history: ds.history ? { rows: ds.history.rows, csv_url: ds.history.csv_url, xlsx_url: ds.history.xlsx_url } : undefined,
    latest: latest ? { period: latest.period, rows: latest.rows, csv_url: latest.csv_url, xlsx_url: latest.xlsx_url } : undefined,
    onClose,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" onClick={onClose}>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: "rgba(245,240,232,0.88)", backdropFilter: "blur(20px)" }}
      />
      <div
        className="relative z-10 w-full max-w-lg"
        style={{ maxHeight: "calc(100dvh - 64px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <DatasetDetailCard {...props} />
      </div>
    </div>
  );
}

// ── Search result card (CSS-only hover, no per-card framer) ───────────────────
function SearchCard({ ds, category, categoryLabel, onOpen }: {
  ds: DatasetEntry;
  category: string;
  categoryLabel: string;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 text-left transition-all duration-300 hover:border-black/20 hover:shadow-lg hover:-translate-y-0.5"
      style={{ willChange: "transform" }}
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={dsImage(ds.id, category)}
          alt={ds.label}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        {!(ds.files.length > 0 || ds.history) && (
          <div className="absolute right-2 top-2 rounded-full bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold text-white">Soon</div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">{categoryLabel}</p>
        <p className="text-sm font-bold text-[#0a0a0a] leading-tight">{ds.label}</p>
        <p className="mt-0.5 text-[11px] text-neutral-500 capitalize">{ds.cadence} · {METHOD_LABELS[ds.method] ?? ds.method}</p>
      </div>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DatasetGrid() {
  const [data, setData] = useState<FilesResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCadence, setActiveCadence] = useState<string | null>(null);
  const [readyOnly, setReadyOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [openDs, setOpenDs] = useState<{ ds: DatasetEntry; category: string } | null>(null);

  useEffect(() => {
    Promise.all([fetchFiles(), fetchStatus()])
      .then(([files, st]) => { setData(files); setStatus(st); })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const openDataset = useCallback((ds: DatasetEntry, category: string) => {
    setOpenDs({ ds, category });
  }, []);

  // Popular fan-stack items
  const popularItems = useMemo((): CardStackItem[] => {
    if (!data) return [];
    const out: CardStackItem[] = [];
    for (const cat of data.categories) {
      for (const ds of cat.datasets) {
        if (POPULAR_IDS.includes(ds.id)) {
          out.push({
            id: ds.id,
            title: ds.label,
            description: ds.description,
            imageSrc: dsImage(ds.id, cat.id),
            category: cat.label,
            tag: cat.id.charAt(0).toUpperCase() + cat.id.slice(1),
            rows: ds.history ? ds.history.rows.toLocaleString() : undefined,
            onOpen: () => openDataset(ds, cat.id),
          });
        }
      }
    }
    return POPULAR_IDS.map((id) => out.find((o) => o.id === id)).filter(Boolean) as CardStackItem[];
  }, [data, openDataset]);

  // One AnimatedFolder per category
  const categoryFolders = useMemo(() => {
    if (!data) return [];
    return data.categories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      gradient: CATEGORY_GRADIENTS[cat.id] ?? "linear-gradient(135deg, #e8e4dc, #d4cfc6)",
      items: cat.datasets.map((ds): FolderItem => ({
        id: ds.id,
        image: dsImage(ds.id, cat.id),
        title: ds.label,
        onOpen: () => openDataset(ds, cat.id),
      })),
    }));
  }, [data, openDataset]);

  // Filtered search results
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
          const hay = [ds.label, ds.description, ds.source, ds.grain, ...ds.columns.map((c) => `${c.name} ${c.label}`)].join(" ").toLowerCase();
          if (!hay.includes(q)) continue;
        }
        rows.push({ category: cat.id, categoryLabel: cat.label, ds });
      }
    }
    return rows;
  }, [data, query, activeCategory, activeCadence, readyOnly]);

  const hasActiveFilters = query || activeCategory || activeCadence || readyOnly;
  const isFiltering = !!hasActiveFilters;
  const total = data?.categories.reduce((n, c) => n + c.datasets.length, 0) ?? 0;
  const clearFilters = () => { setQuery(""); setActiveCategory(null); setActiveCadence(null); setReadyOnly(false); };

  return (
    <>
      <section id="datasets" className="px-4 pb-28">
        <div className="mx-auto max-w-6xl space-y-20">

          {/* ── Popular fan stack ── */}
          {!loading && !error && popularItems.length > 0 && !isFiltering && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-8">
                <span className="inline-block mb-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Popular
                </span>
                <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#0a0a0a]">Featured datasets</h2>
                <p className="mt-1 text-sm text-neutral-500">Click a card to view details · drag to browse</p>
              </div>
              <CardStack
                items={popularItems}
                autoAdvance
                intervalMs={3400}
                pauseOnHover
                showDots
                cardWidth={440}
                cardHeight={260}
                loop
              />
            </motion.div>
          )}

          {/* ── Sticky filter bar ── */}
          <div
            className="sticky top-0 z-20 -mx-4 px-4 py-3 border-b border-black/8"
            style={{ background: "rgba(245,240,232,0.93)", backdropFilter: "blur(16px)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-black/10 bg-white/80 px-3.5 py-2.5 shadow-sm focus-within:border-black/30 focus-within:bg-white transition-all">
                <Search className="h-4 w-4 shrink-0 text-neutral-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search datasets, columns, sources…"
                  className="flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 transition-colors">
                    Clear
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters((f) => !f)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                  showFilters || activeCategory || activeCadence || readyOnly
                    ? "border-[#0a0a0a] bg-[#0a0a0a] text-[#f5f0e8]"
                    : "border-black/10 bg-white/80 text-neutral-600 hover:border-black/25"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              <span className="shrink-0 text-[11px] font-medium text-neutral-400">
                {loading ? "Loading…" : isFiltering ? `${filtered.length} / ${total}` : `${total} datasets`}
              </span>
            </div>

            {showFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Category</span>
                  {data?.categories.map((c) => (
                    <Chip key={c.id} active={activeCategory === c.id} onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}>
                      {c.label}
                    </Chip>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Cadence</span>
                  {CADENCE_ORDER.map((c) => (
                    <Chip key={c} active={activeCadence === c} onClick={() => setActiveCadence(activeCadence === c ? null : c)}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Chip>
                  ))}
                </div>
                <Chip active={readyOnly} onClick={() => setReadyOnly((r) => !r)}>Available now</Chip>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 underline underline-offset-2 transition-colors">
                    Reset all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Loading skeletons ── */}
          {loading && (
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <SkeletonFolder key={i} />)}
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="py-20 text-center rounded-2xl border border-red-200 bg-red-50/50">
              <p className="text-sm font-semibold text-red-500">{error}</p>
              <p className="mt-1 text-xs text-red-400">Try refreshing the page.</p>
            </div>
          )}

          {/* ── Filtered / search results — CSS-only card animations ── */}
          {!loading && !error && isFiltering && (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {filtered.length === 0 ? (
                <div className="py-20 text-center rounded-2xl border border-black/8 bg-white/40">
                  <p className="text-sm font-semibold text-neutral-500">No datasets match your filters.</p>
                  <button onClick={clearFilters} className="mt-3 text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 underline underline-offset-2">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]">Search results</h2>
                    <div className="h-px flex-1 bg-black/8" />
                    <span className="text-[10px] font-semibold text-neutral-400">{filtered.length} match{filtered.length !== 1 ? "es" : ""}</span>
                  </div>
                  {/* CSS stagger via animation-delay, no framer per card */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {filtered.map(({ ds, category, categoryLabel }, i) => (
                      <div
                        key={ds.id}
                        className="animate-in fade-in slide-in-from-bottom-3 duration-300"
                        style={{ animationDelay: `${Math.min(i * 35, 200)}ms`, animationFillMode: "both" }}
                      >
                        <SearchCard ds={ds} category={category} categoryLabel={categoryLabel} onOpen={() => openDataset(ds, category)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Category folders — 4 AnimatedFolders in a grid ── */}
          {!loading && !error && !isFiltering && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-10">
                <span className="inline-block mb-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  All datasets
                </span>
                <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#0a0a0a]">Browse by category</h2>
                <p className="mt-1 text-sm text-neutral-500">Hover a folder to fan out datasets · click a card to open lightbox · click "View dataset" for details</p>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {categoryFolders.map((cat, gi) => (
                  <div
                    key={cat.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${gi * 80}ms`, animationFillMode: "both" }}
                  >
                    <Folder
                      label={cat.label}
                      gradient={cat.gradient}
                      items={cat.items}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Footer note ── */}
          {!loading && !error && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center text-[11px] text-neutral-400 leading-relaxed"
            >
              All datasets sourced from official SA government publications · versioned in Git · CSV committed, Excel generated on download
            </motion.p>
          )}
        </div>
      </section>

      {/* ── Dataset detail modal ── */}
      <AnimatePresence>
        {openDs && (
          <DatasetModal
            key={openDs.ds.id}
            ds={openDs.ds}
            category={openDs.category}
            status={status}
            onClose={() => setOpenDs(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
