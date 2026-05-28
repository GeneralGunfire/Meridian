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
}

function FormatSelector({ selected, onChange }: FormatSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Choose download format" className="space-y-2.5">
      {FORMAT_OPTIONS.map((opt) => {
        const on = selected === opt.id;
        return (
          <div
            key={opt.id}
            role="radio"
            aria-checked={on}
            tabIndex={0}
            onClick={() => onChange(opt.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onChange(opt.id)}
            className={cn(
              "relative flex cursor-pointer items-center gap-4 rounded-xl p-3.5 transition-all duration-300 select-none",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
              on ? "text-[#f5f0e8]" : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700",
            )}
          >
            {on && (
              <motion.div
                layoutId="format-selected"
                className="absolute inset-0 rounded-xl bg-[#0a0a0a]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <div className={cn("relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", on ? "bg-white/15" : "bg-white border border-black/10")}>
              <span className={on ? "text-[#f5f0e8]" : "text-neutral-600"}>{opt.icon}</span>
            </div>
            <div className="relative z-10 flex-1 min-w-0">
              <p className="font-semibold text-sm">{opt.label}</p>
              <p className={cn("text-xs mt-0.5", on ? "text-white/70" : "text-neutral-400")}>{opt.detail}</p>
            </div>
            <div className="relative z-10 h-5 w-5 shrink-0">
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
            </div>
          </div>
        );
      })}
    </div>
  );
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

  const statusColor = statusSuccess ? "bg-emerald-500" : statusSkipped ? "bg-neutral-300" : "bg-red-400";
  const statusLabel = statusSuccess ? `Updated ${lastUpdated ?? ""}` : statusSkipped ? "No new data" : "Error";

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
      <div className="relative h-32 shrink-0 overflow-hidden">
        <img src={imageSrc} alt={label} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        {/* close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {/* status pill */}
        <div className="absolute left-4 bottom-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 backdrop-blur-sm">
          <span className={cn("h-1.5 w-1.5 rounded-full", statusColor)} />
          <span className="text-[10px] font-semibold text-white">{statusLabel}</span>
        </div>
        {/* category */}
        <div className="absolute right-4 bottom-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{category}</span>
        </div>
      </div>

      {/* ── Body (scrollable, no visible scrollbar) ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-none [&::-webkit-scrollbar]:hidden">

        {/* Title row: icon + title + expiry-like meta */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <MeridianMark />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                <span className="text-xs text-neutral-500">Cadence</span>
              </div>
              <p className="font-bold text-[#0a0a0a] capitalize">{cadence}</p>
              <p className="text-[11px] text-neutral-400 capitalize">{METHOD_LABELS[method] ?? method}</p>
            </div>
          </div>
          {/* dataset image indicator */}
          <div className="h-14 w-14 rounded-xl overflow-hidden border border-black/10 shrink-0">
            <img src={imageSrc} alt={label} className="h-full w-full object-cover" />
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

            <FormatSelector selected={format} onChange={setFormat} />

            {/* Download buttons — full width, tall, easy to tap */}
            <div className="flex flex-col gap-2.5 pt-1">
              {history && (
                <button
                  onClick={() => {
                    const url = format === "csv" ? history.csv_url : history.xlsx_url;
                    triggerDownload(url, `meridian_${id}_history.${format === "csv" ? "csv" : "xlsx"}`);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-5 py-4 text-left transition-all hover:border-black/20 hover:shadow-md active:scale-[0.99]"
                >
                  <div>
                    <p className="text-sm font-bold text-[#0a0a0a]">Full history</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{history.rows.toLocaleString()} rows · all periods · ~15 yr</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/8 bg-neutral-50">
                    <Download className="h-4 w-4 text-neutral-600" />
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
                    <p className="text-xs text-white/50 mt-0.5">{latest.period} · {latest.rows.toLocaleString()} rows</p>
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
