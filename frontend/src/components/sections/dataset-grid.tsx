"use client";

import { motion } from "motion/react";
import { useState } from "react";

const datasets = [
  {
    id: "crime",
    title: "Crime Statistics",
    source: "SAPS",
    sourceUrl: "https://www.saps.gov.za/services/crimestats.php",
    frequency: "Quarterly",
    format: "CSV",
    description: "Province-level crime data by category — murder, robbery, assault, and more. Sourced directly from the South African Police Service quarterly release.",
    columns: ["Province", "Crime_Type", "Count", "Year_Quarter"],
    latestFile: "crime_stats_2026-Q1.csv",
    size: "~180 KB",
    color: "bg-red-50 border-red-100",
    badge: "bg-red-100 text-red-700",
  },
  {
    id: "eskom",
    title: "Eskom Load-Shedding",
    source: "Eskom",
    sourceUrl: "https://loadshedding.eskom.co.za/",
    frequency: "Weekly",
    format: "CSV",
    description: "Stage tracking from the official Eskom API. Historical load-shedding stages, duration breakdowns, and weekly trend data going back two years.",
    columns: ["Date", "Stage", "Duration_Hours", "Province", "Year_Week"],
    latestFile: "eskom_2026-W21.csv",
    size: "~95 KB",
    color: "bg-yellow-50 border-yellow-100",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "water",
    title: "Water & Sanitation",
    source: "StatsSA",
    sourceUrl: "https://www.statssa.gov.za/?cat=26",
    frequency: "Annual",
    format: "CSV",
    description: "Municipal water supply and sanitation access rates from the StatsSA General Household Survey. Track coverage across all provinces over time.",
    columns: ["Municipality", "Water_Supply_%", "Sanitation_Access_%", "Date_Year"],
    latestFile: "water_2025.csv",
    size: "~64 KB",
    color: "bg-blue-50 border-blue-100",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    id: "housing",
    title: "Housing Data",
    source: "StatsSA",
    sourceUrl: "https://www.statssa.gov.za/publications/",
    frequency: "Annual",
    format: "CSV",
    description: "Household survey data on formal dwellings, electricity access, and infrastructure from the GHS. Yearly SA-wide coverage for trend analysis.",
    columns: ["Year", "Total_Households", "Formal_Dwellings_%", "Electricity_%", "Water_Access_%"],
    latestFile: "housing_2025.csv",
    size: "~42 KB",
    color: "bg-green-50 border-green-100",
    badge: "bg-green-100 text-green-700",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="ml-auto shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-600"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function DatasetGrid() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-6">
        {datasets.map((ds, i) => (
          <motion.div
            key={ds.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.07 }}
            className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm overflow-hidden"
          >
            {/* Card header */}
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="text-base font-bold text-[#0a0a0a]">{ds.title}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ds.badge}`}>
                    {ds.frequency}
                  </span>
                  <span className="rounded-full border border-black/10 bg-black/4 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                    {ds.format}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
                  {ds.description}
                </p>
                <a
                  href={ds.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Source: {ds.source}
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Download button */}
              <div className="flex flex-col items-start gap-2 sm:items-end shrink-0">
                <button className="flex items-center gap-2 rounded-lg bg-[#0a0a0a] px-5 py-2.5 text-sm font-semibold text-[#f5f0e8] transition-all hover:bg-neutral-800 active:scale-[0.98]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download latest
                </button>
                <p className="text-[11px] text-neutral-400">{ds.latestFile} &middot; {ds.size}</p>
              </div>
            </div>

            {/* Column schema */}
            <div className="border-t border-black/6 bg-black/2 px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mr-1">
                  Columns
                </span>
                {ds.columns.map((col) => (
                  <span
                    key={col}
                    className="rounded-md border border-black/8 bg-white/80 px-2.5 py-1 font-mono text-[11px] text-neutral-600"
                  >
                    {col}
                  </span>
                ))}
                {/* Copy schema snippet */}
                <CopyButton text={ds.columns.join(", ")} />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-center text-xs text-neutral-400 pt-4"
        >
          All datasets scraped from official SA government sources and versioned in Git.
          New files are added weekly — previous versions are never deleted.
        </motion.p>
      </div>
    </section>
  );
}
