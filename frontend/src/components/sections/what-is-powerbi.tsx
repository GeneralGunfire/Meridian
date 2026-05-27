"use client";

import { motion } from "motion/react";

const bullets = [
  {
    title: "Connect any data source",
    body: "Pull in CSVs, APIs, databases, or live feeds. Power BI handles the ingestion — you focus on the story.",
  },
  {
    title: "Build interactive dashboards",
    body: "Drag-and-drop visuals, slicers, and drill-throughs. No code required to go from raw numbers to insight.",
  },
  {
    title: "Share & embed anywhere",
    body: "Publish to the web, embed in reports, or export to PDF. Your audience sees live data — always up to date.",
  },
];

export default function WhatIsPowerBI() {
  return (
    <section id="dashboards" className="px-4 py-28 bg-[#f5f0e8]">
      <div className="mx-auto max-w-6xl">

        {/* Section label + heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end"
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              The tool
            </p>
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-[#0a0a0a] sm:text-5xl leading-[1.05]">
              What is<br />Power BI?
            </h2>
          </div>
          <p className="text-base text-neutral-600 leading-relaxed md:max-w-sm md:text-right md:ml-auto">
            Microsoft&apos;s industry-standard analytics platform — used by data analysts worldwide to turn raw data into visual, shareable insights.
          </p>
        </motion.div>

        {/* Two-column layout: images left, bullets right */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">

          {/* Images stacked */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex flex-col gap-4"
          >
            {/* Primary image */}
            <div className="overflow-hidden rounded-2xl border border-black/8 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
              <img
                src="/images/powerbi-what.png"
                alt="Power BI dashboard overview"
                className="w-full object-cover"
              />
            </div>

            {/* Secondary image — offset card */}
            <div className="ml-8 overflow-hidden rounded-2xl border border-black/8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
              <img
                src="/images/powerbi-features-bigdata.jpg"
                alt="Power BI big data features"
                className="w-full object-cover"
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-2 rounded-xl border border-black/8 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-bold text-[#0a0a0a]">Microsoft Power BI</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Industry standard analytics</p>
            </div>
          </motion.div>

          {/* Bullets */}
          <div className="flex flex-col gap-0">
            {bullets.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
                className="group border-t border-black/8 py-8 last:border-b"
              >
                <div className="flex items-start gap-5">
                  {/* Step number */}
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/12 text-[10px] font-bold text-neutral-400 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#0a0a0a] mb-1.5">{b.title}</p>
                    <p className="text-sm leading-relaxed text-neutral-600">{b.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.28 }}
              className="mt-8"
            >
              <a
                href="https://powerbi.microsoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-black/12 bg-white/70 px-6 py-3 text-sm font-semibold text-[#0a0a0a] backdrop-blur-sm transition-all hover:bg-white hover:border-black/25 hover:shadow-sm active:scale-[0.98]"
              >
                Learn more about Power BI
                <svg className="h-3.5 w-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
