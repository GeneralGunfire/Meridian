"use client";

import { motion } from "motion/react";

export default function DownloadHero() {
  return (
    <section className="border-b border-black/8 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Free &amp; Open Source
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.035em] leading-[1.05] text-[#0a0a0a] sm:text-5xl lg:text-6xl">
            Get the datasets.
          </h1>
          <p className="mt-5 max-w-xl text-base text-neutral-500 leading-relaxed">
            Every dataset scraped weekly from official SA government sources. Clean CSVs, stable column names, Power BI ready. No sign-up required — just download and connect.
          </p>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
          className="mt-10 flex flex-wrap gap-6"
        >
          {[
            { value: "15", label: "Datasets" },
            { value: "4", label: "Categories" },
            { value: "CSV + Excel", label: "Formats" },
            { value: "~15yr", label: "History" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-black/10 bg-white/60 px-5 py-3 backdrop-blur-sm">
              <p className="text-lg font-bold tracking-tight text-[#0a0a0a]">{s.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
