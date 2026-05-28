"use client";

import { motion } from "motion/react";
import Link from "next/link";

const stats = [
  { value: "15", label: "Datasets" },
  { value: "4", label: "Categories" },
  { value: "CSV + Excel", label: "Formats" },
  { value: "~15yr", label: "History" },
];

export default function DownloadHero() {
  return (
    <section className="px-4 pt-20 pb-14">
      <div className="mx-auto max-w-6xl">

        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free &amp; Open Source
          </span>
        </motion.div>

        {/* Heading + description — two-column on large screens */}
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.06 }}
          >
            <h1 className="text-5xl font-bold tracking-[-0.04em] leading-[1.02] text-[#0a0a0a] sm:text-6xl">
              Get the<br />
              <span className="text-neutral-400">datasets.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
            className="md:pb-1"
          >
            <p className="text-base text-neutral-500 leading-relaxed max-w-sm">
              Official SA government data — scraped weekly, versioned in Git, ready for Power BI.
              No sign-up. No paywalls.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="#datasets"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0a0a0a] px-5 py-2.5 text-sm font-semibold text-[#f5f0e8] transition-all hover:bg-neutral-800 active:scale-95"
              >
                Browse datasets
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-black/12 bg-white/70 px-5 py-2.5 text-sm font-semibold text-neutral-700 backdrop-blur-sm transition-all hover:border-black/25 hover:bg-white active:scale-95"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                </svg>
                GitHub
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.22 }}
          className="mt-10 flex flex-wrap gap-2.5"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-black/8 bg-white/60 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-xl font-bold tracking-tight text-[#0a0a0a]">{s.value}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="mt-12 h-px bg-black/8" />
      </div>
    </section>
  );
}
