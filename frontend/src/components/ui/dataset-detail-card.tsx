"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Download, ExternalLink, Database, Layers, Clock, X, FileSpreadsheet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ── Format selector (adapted from card-5 withdrawal card) ─────────────────────
type FormatOption = { id: "csv" | "xlsx"; label: string; icon: React.ReactNode; detail: string };

const FORMAT_OPTIONS: FormatOption[] = [
  { id: "csv",  label: "CSV",   icon: <FileText className="h-5 w-5" />,        detail: "Universal · lightweight · version-controlled" },
  { id: "xlsx", label: "Excel", icon: <FileSpreadsheet className="h-5 w-5" />, detail: "Power BI ready · formatted · auto-typed columns" },
];

interface FormatSelectorProps {
  selected: "csv" | "xlsx";
  onChange: (v: "csv" | "xlsx") => void;
  disabledFormats?: Set<"csv" | "xlsx">;
}

function FormatSelector({ selected, onChange, disabledFormats }: FormatSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Choose download format" className="space-y-2.5">
      {FORMAT_OPTIONS.map((opt) => {
        const on = selected === opt.id;
        const disabled = disabledFormats?.has(opt.id) ?? false;
        return (
          <TooltipProvider key={opt.id} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  role="radio"
                  aria-checked={on}
                  aria-disabled={disabled}
                  tabIndex={disabled ? -1 : 0}
                  onClick={disabled ? undefined : () => onChange(opt.id)}
                  onKeyDown={disabled ? undefined : (e) => (e.key === "Enter" || e.key === " ") && onChange(opt.id)}
                  className={cn(
                    "relative flex items-center gap-4 rounded-xl p-3.5 transition-all duration-300 select-none",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
                    disabled
                      ? "opacity-40 cursor-not-allowed bg-neutral-50 text-neutral-500"
                      : on
                        ? "cursor-pointer text-[#f5f0e8]"
                        : "cursor-pointer bg-neutral-50 hover:bg-neutral-100 text-neutral-700",
                  )}
                >
                  {on && !disabled && (
                    <motion.div
                      layoutId="format-selected"
                      className="absolute inset-0 rounded-xl bg-[#0a0a0a]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={cn("relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", on && !disabled ? "bg-white/15" : "bg-white border border-black/10")}>
                    <span className={on && !disabled ? "text-[#f5f0e8]" : "text-neutral-600"}>{opt.icon}</span>
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className={cn("text-xs mt-0.5", on && !disabled ? "text-white/70" : "text-neutral-400")}>
                      {disabled ? "Not available" : opt.detail}
                    </p>
                  </div>
                  <div className="relative z-10 h-5 w-5 shrink-0">
                    {disabled ? (
                      <span className="inline-flex items-center rounded-full bg-neutral-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-neutral-500 whitespace-nowrap">N/A</span>
                    ) : (
                      <>
                        <AnimatePresence>
                          {on && (
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              className="flex h-full w-full items-center justify-center rounded-full bg-white text-[#0a0a0a]"
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {!on && <div className="h-5 w-5 rounded-full border-2 border-black/20" />}
                      </>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              {disabled && (
                <TooltipContent>
                  <p>{opt.id === "csv" ? "CSV download not supported" : "Excel download not supported"}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}

// ── File size estimator ────────────────────────────────────────────────────────
function estimateSize(rows: number, fmt: "csv" | "xlsx"): string {
  const bytesPerRow = fmt === "csv" ? 150 : 200;
  const bytes = rows * bytesPerRow;
  if (bytes < 1024 * 1024) {
    return `~${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Info field ─────────────────────────────────────────────────────────────────
function InfoField({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</span>
      <span className="flex items-center gap-2 text-sm font-medium text-[#0a0a0a]">
        {value}
        {children}
      </span>
    </div>
  );
}

// ── Column row ─────────────────────────────────────────────────────────────────
function ColumnRow({ name, label, unit, last }: { name: string; label: string; unit?: string; last: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 px-4 py-2.5", !last && "border-b border-black/5")}>
      <div className="flex items-center gap-2.5 min-w-0">
        <code className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-[11px] text-neutral-700">{name}</code>
        <span className="truncate text-xs text-neutral-500">{label}</span>
      </div>
      {unit && <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-neutral-400">{unit}</span>}
    </div>
  );
}

// ── Main dataset detail card ───────────────────────────────────────────────────
export interface DatasetDetailCardProps {
  id: string;
  label: string;
  category: string;
  description: string;
  source: string;
  sourceUrl: string;
  cadence: string;
  method: string;
  grain: string;
  columns: { name: string; label: string; unit?: string }[];
  imageSrc: string;
  statusSuccess?: boolean;
  statusSkipped?: boolean;
  lastUpdated?: string;
  history?: { rows: number; csv_url: string; xlsx_url: string };
  latest?: { period: string; rows: number; csv_url: string; xlsx_url: string };
  onClose: () => void;
}

const METHOD_LABELS: Record<string, string> = {
  api: "Live API", parse: "PDF / Excel", scrape: "Web scrape", manual: "Manual",
};

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Meridian wordmark SVG (inline, clean)
function MeridianMark() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0a0a0a]">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#f5f0e8]">MRD</span>
    </div>
  );
}

export function DatasetDetailCard({
  id,
  label,
  category,
  description,
  source,
  sourceUrl,
  cadence,
  method,
  grain,
  columns,
  imageSrc,
  statusSuccess,
  statusSkipped,
  lastUpdated,
  history,
  latest,
  onClose,
}: DatasetDetailCardProps) {
  const [format, setFormat] = React.useState<"csv" | "xlsx">("csv");
  const [copied, setCopied] = React.useState(false);
  const hasFiles = !!history || !!latest;
  const fileToDownload = latest ?? history;

  // Determine which formats are disabled
  const disabledFormats = React.useMemo((): Set<"csv" | "xlsx"> => {
    if (method === "manual") return new Set<"csv" | "xlsx">(["csv", "xlsx"]);
    return new Set<"csv" | "xlsx">();
  }, [method]);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!fileToDownload) return;
    const url = format === "csv" ? fileToDownload.csv_url : fileToDownload.xlsx_url;
    const suffix = latest ? latest.period : "history";
    triggerDownload(url, `meridian_${id}_${suffix}.${format === "csv" ? "csv" : "xlsx"}`);
  };

  // Live = has real files. Pending = manual method or no files yet.
  const isLive = hasFiles && method !== "manual";
  const isPending = method === "manual" || !hasFiles;
  const totalRows = history?.rows ?? latest?.rows ?? 0;

  // Status pill logic
  const statusColor = isPending
    ? "bg-amber-400"
    : statusSuccess
    ? "bg-emerald-500"
    : statusSkipped
    ? "bg-neutral-400"
    : "bg-red-400";
  const statusLabel = isPending
    ? method === "manual" ? "Awaiting data" : "Not yet scraped"
    : statusSuccess
    ? `Live · updated ${lastUpdated ?? ""}`
    : statusSkipped
    ? "Live · no new period"
    : "Error — last data retained";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden flex flex-col"
      style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.4)", maxHeight: "calc(100dvh - 64px)" }}
    >
      {/* ── Header image strip ── */}
      <div className="relative h-36 shrink-0 overflow-hidden">
        <img src={imageSrc} alt={label} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75" />

        {/* close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* LIVE / PENDING badge — top left, very visible */}
        <div className={cn(
          "absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm border text-[10px] font-bold uppercase tracking-widest",
          isLive
            ? "bg-emerald-500/90 border-emerald-400/50 text-white"
            : "bg-amber-500/90 border-amber-400/50 text-white",
        )}>
          <span className={cn("h-1.5 w-1.5 rounded-full", isLive ? "bg-white animate-pulse" : "bg-white/70")} />
          {isLive ? "Live data" : "Pending"}
        </div>

        {/* bottom: title + status */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <p className="text-white font-bold text-base leading-tight truncate drop-shadow">{label}</p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusColor)} />
              <span className="text-[10px] font-semibold text-white/80">{statusLabel}</span>
            </div>
            {isLive && totalRows > 0 && (
              <span className="text-[10px] font-bold text-white/70 tabular-nums">
                {totalRows.toLocaleString()} rows
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body (scrollable, no visible scrollbar) ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-none [&::-webkit-scrollbar]:hidden">

        {/* Title row: icon + cadence/method meta */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MeridianMark />
            <div>
              <p className="font-bold text-[#0a0a0a] capitalize">{cadence} · {METHOD_LABELS[method] ?? method}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{category}</p>
            </div>
          </div>
          {/* category badge */}
          <div className={cn(
            "shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest",
            isLive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100",
          )}>
            {isLive ? `${totalRows.toLocaleString()} rows` : "No data yet"}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-black/8 py-4">
          <InfoField label="Dataset" value={label} />
          <InfoField label="Source" value={source}>
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-neutral-400 hover:text-[#0a0a0a] transition-colors">
              <ExternalLink className="h-3 w-3" />
            </a>
          </InfoField>
          <InfoField label="Granularity" value={grain} />
          <InfoField label="Columns">
            <span className="flex items-center gap-1 text-sm font-medium text-[#0a0a0a]">
              <Database className="h-3.5 w-3.5 text-neutral-400" />
              {columns.length} fields
            </span>
          </InfoField>
          <InfoField label="Dataset ID" value={id}>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleCopy} className="text-neutral-400 hover:text-[#0a0a0a] transition-colors" aria-label="Copy dataset ID">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Copy ID</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </InfoField>
          {latest && (
            <InfoField label="Latest period">
              <span className="flex items-center gap-1 text-sm font-medium text-[#0a0a0a]">
                <Layers className="h-3.5 w-3.5 text-neutral-400" />
                <code className="font-mono text-[12px]">{latest.period}</code>
              </span>
            </InfoField>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>

        {/* Columns (first 5) */}
        {columns.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Schema preview
            </p>
            <div className="rounded-xl border border-black/8 bg-neutral-50/60 overflow-hidden">
              {columns.slice(0, 5).map((c, i) => (
                <ColumnRow key={c.name} name={c.name} label={c.label} unit={c.unit} last={i === Math.min(4, columns.length - 1)} />
              ))}
              {columns.length > 5 && (
                <div className="px-4 py-2 text-[11px] text-neutral-400 border-t border-black/5">
                  +{columns.length - 5} more columns
                </div>
              )}
            </div>
          </div>
        )}

        {/* Format selector + download */}
        {hasFiles ? (
          <div className="rounded-2xl border border-black/8 bg-neutral-50/60 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-neutral-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                Download
              </p>
            </div>

            {method === "manual" ? (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 p-4 text-center">
                <p className="text-xs font-semibold text-neutral-500">Pending data drop</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Format selection unavailable until data is provided.</p>
              </div>
            ) : (
              <FormatSelector selected={format} onChange={setFormat} disabledFormats={disabledFormats} />
            )}

            {/* Download buttons — full width, tall, easy to tap */}
            <div className="flex flex-col gap-2.5 pt-1">
              {history && (
                <button
                  onClick={() => {
                    const url = format === "csv" ? history.csv_url : history.xlsx_url;
                    triggerDownload(url, `meridian_${id}_history.${format === "csv" ? "csv" : "xlsx"}`);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-5 py-4 text-left transition-all active:scale-[0.99]",
                    !latest
                      ? "bg-[#0a0a0a] hover:bg-neutral-800"
                      : "border border-black/10 bg-white hover:border-black/20 hover:shadow-md",
                  )}
                >
                  <div>
                    <p className={cn("text-sm font-bold", !latest ? "text-[#f5f0e8]" : "text-[#0a0a0a]")}>Full history</p>
                    <p className={cn("text-xs mt-0.5", !latest ? "text-white/50" : "text-neutral-400")}>
                      {history.rows.toLocaleString()} rows · ~{estimateSize(history.rows, format)} · all periods
                    </p>
                  </div>
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", !latest ? "bg-white/10" : "border border-black/8 bg-neutral-50")}>
                    <Download className={cn("h-4 w-4", !latest ? "text-white" : "text-neutral-600")} />
                  </div>
                </button>
              )}
              {latest && (
                <button
                  onClick={handleDownload}
                  className="flex w-full items-center justify-between gap-3 rounded-xl bg-[#0a0a0a] px-5 py-4 text-left transition-all hover:bg-neutral-800 active:scale-[0.99]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#f5f0e8]">Latest release</p>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">New</span>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">{latest.period} · {latest.rows.toLocaleString()} rows · ~{estimateSize(latest.rows, format)}</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Download className="h-4 w-4 text-white" />
                  </div>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/60 p-6 text-center">
            <Clock className="h-6 w-6 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-500">
              {method === "manual" ? "Awaiting manual data drop" : "Scraper not yet run"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Data coming soon.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
