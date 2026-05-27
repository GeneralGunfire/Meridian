"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fetchFiles, fetchStatus } from "@/lib/datasets";
import type { FilesResponse, CategoryGroup, DatasetEntry, StatusResponse } from "@/lib/datasets";

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

// ── status dot ────────────────────────────────────────────────────────────────
function StatusDot({ dsId, status }: { dsId: string; status: StatusResponse | null }) {
  if (!status) return null;
  const ds = status.datasets[dsId];
  if (!ds) return null;

  const color = ds.success
    ? "bg-emerald-400"
    : ds.skipped
    ? "bg-neutral-300"
    : "bg-red-400";

  const title = ds.success
    ? `Last updated: ${ds.last_updated ?? "unknown"}`
    : ds.skipped
    ? "No new data this cycle"
    : `Error: ${ds.error ?? "unknown"}`;

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${color} flex-shrink-0`}
      title={title}
    />
  );
}

// ── method badge ──────────────────────────────────────────────────────────────
const METHOD_LABELS: Record<string, string> = {
  api: "Live API",
  parse: "PDF/Excel",
  scrape: "Scraped",
  manual: "Manual",
};

// ── file release row ──────────────────────────────────────────────────────────
function ReleaseRow({ file, dsLabel }: { file: { period: string; date: string; rows: number; csv_url: string; xlsx_url: string }; dsLabel: string }) {
  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert("Download failed — please try again.");
    }
  };

  const slug = dsLabel.toLowerCase().replace(/\s+/g, "_");

  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm hover:bg-neutral-50/70 border-b border-black/4 last:border-0">
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
          {file.period}
        </span>
        <span className="text-xs text-neutral-400">{file.date}</span>
        <span className="text-xs text-neutral-400 font-mono">{file.rows.toLocaleString()} rows</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleDownload(file.csv_url, `meridian_${slug}_${file.period}.csv`)}
          className="flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 transition-all hover:border-black/25 hover:bg-neutral-50 hover:text-neutral-900"
        >
          <DownloadIcon /> CSV
        </button>
        <button
          onClick={() => handleDownload(file.xlsx_url, `meridian_${slug}_${file.period}.xlsx`)}
          className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100"
        >
          <DownloadIcon /> Excel
        </button>
      </div>
    </div>
  );
}

// ── dataset accordion card ────────────────────────────────────────────────────
function DatasetCard({
  ds,
  status,
  defaultOpen,
}: {
  ds: DatasetEntry;
  status: StatusResponse | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  const hasFiles = ds.files.length > 0 || ds.history;
  const latestFile = ds.files[0];

  return (
    <div className={`rounded-xl border ${ds.color} overflow-hidden`}>
      {/* Header — always visible */}
      <button
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <StatusDot dsId={ds.id} status={status} />
            <h3 className="text-sm font-bold text-[#0a0a0a] leading-snug">{ds.label}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ds.badgeColor}`}>
              {ds.cadence}
            </span>
            <span className="rounded-full border border-black/10 bg-black/4 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              {METHOD_LABELS[ds.method] ?? ds.method}
            </span>
            {!hasFiles && (
              <span className="rounded-full border border-dashed border-neutral-300 px-2 py-0.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                Coming soon
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">{ds.description}</p>
          {latestFile && (
            <p className="mt-1.5 text-[11px] text-neutral-400">
              Latest: <span className="font-mono font-semibold">{latestFile.period}</span>
              {" "}·{" "}{latestFile.rows.toLocaleString()} rows
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 mt-0.5">
          {latestFile && !open && (
            <button
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2 text-[11px] font-semibold text-[#f5f0e8] transition-all hover:bg-neutral-800"
              onClick={(e) => {
                e.stopPropagation();
                const a = document.createElement("a");
                a.href = latestFile.csv_url;
                a.download = `meridian_${ds.id}_${latestFile.period}.csv`;
                a.click();
              }}
            >
              <DownloadIcon />
              Latest CSV
            </button>
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
            <div className="border-t border-black/6 bg-white/60">
              {/* Column schema */}
              <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-black/4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mr-1">Columns</span>
                {ds.columns.map((col) => (
                  <span key={col} className="rounded-md border border-black/8 bg-white px-2 py-0.5 font-mono text-[11px] text-neutral-600">
                    {col}
                  </span>
                ))}
                <a
                  href={ds.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Source: {ds.source} <ExternalLink />
                </a>
              </div>

              {/* File releases */}
              {hasFiles ? (
                <div>
                  {ds.history && (
                    <div className="px-5 py-2 bg-neutral-50/80 border-b border-black/4 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Full history (~15yr)</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = ds.history!.csv_url;
                            a.download = `meridian_${ds.id}_history.csv`;
                            a.click();
                          }}
                          className="flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50"
                        >
                          <DownloadIcon /> CSV ({ds.history.rows.toLocaleString()} rows)
                        </button>
                        <button
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = ds.history!.xlsx_url;
                            a.download = `meridian_${ds.id}_history.xlsx`;
                            a.click();
                          }}
                          className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <DownloadIcon /> Excel
                        </button>
                      </div>
                    </div>
                  )}
                  {ds.files.length > 0 && (
                    <div>
                      <div className="px-5 py-2 bg-neutral-50/50 border-b border-black/4">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                          Recent releases ({ds.files.length})
                        </span>
                      </div>
                      {ds.files.slice(0, 8).map((f) => (
                        <ReleaseRow key={f.period} file={f} dsLabel={ds.label} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-neutral-400 italic">
                    {ds.method === "manual"
                      ? "Awaiting manual data drop — check back soon."
                      : "Scraper not yet run. Data coming soon."}
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

// ── category section ──────────────────────────────────────────────────────────
function CategorySection({ group, status }: { group: CategoryGroup; status: StatusResponse | null }) {
  const [expanded, setExpanded] = useState(true);
  const totalDatasets = group.datasets.length;
  const readyDatasets = group.datasets.filter((d) => d.files.length > 0 || d.history).length;

  return (
    <section className="space-y-3">
      <button
        className="w-full flex items-center justify-between group"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-[#0a0a0a] uppercase tracking-widest text-xs">
            {group.label}
          </h2>
          <span className="rounded-full bg-black/6 border border-black/10 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
            {readyDatasets}/{totalDatasets} datasets
          </span>
        </div>
        <ChevronDown open={expanded} />
      </button>
      <p className="text-xs text-neutral-500 -mt-1">{group.description}</p>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key={group.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="space-y-3 pt-1">
              {group.datasets.map((ds, i) => (
                <motion.div
                  key={ds.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <DatasetCard ds={ds} status={status} defaultOpen={i === 0 && ds.files.length > 0} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── main export ───────────────────────────────────────────────────────────────
export default function DatasetGrid() {
  const [data, setData] = useState<FilesResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchFiles(), fetchStatus()])
      .then(([files, st]) => {
        setData(files);
        setStatus(st);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load datasets"))
      .finally(() => setLoading(false));
  }, []);

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
        <p className="mt-2 text-xs text-neutral-400">The data API may be offline or initializing.</p>
      </div>
    );
  }

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        {data.categories.map((group) => (
          <CategorySection key={group.id} group={group} status={status} />
        ))}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-xs text-neutral-400 pt-4 pb-8"
        >
          All datasets sourced from official SA government publications and versioned in Git.
          New releases are added on each scraper run — previous versions are never deleted.
        </motion.p>
      </div>
    </section>
  );
}
