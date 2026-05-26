"use client";
import { motion } from "motion/react";
import dynamic from "next/dynamic";

const LiquidMetalBg = dynamic(
  () => import("@/components/ui/liquid-metal-bg").then((m) => ({ default: m.LiquidMetalBg })),
  { ssr: false }
);

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-[#f5f0e8] px-4 text-center">
      <LiquidMetalBg />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="mb-6 inline-block rounded-full border border-black/10 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-500 backdrop-blur-sm">
            SA Government Data — Weekly Updates
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          className="mb-6 text-5xl font-bold tracking-[-0.04em] text-[#0a0a0a] sm:text-6xl lg:text-7xl xl:text-8xl"
        >
          South Africa&apos;s data,<br />
          <span className="text-neutral-400">clean and ready.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.16 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-neutral-500 leading-relaxed"
        >
          Crime statistics, Eskom load-shedding, water access, and housing data — scraped weekly from official government sources and served as clean CSVs ready for Power BI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.24 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#datasets"
            className="rounded-lg bg-[#0a0a0a] px-8 py-3.5 text-sm font-semibold text-[#f5f0e8] shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98]"
          >
            Browse Datasets
          </a>
          <a
            href="#"
            className="rounded-lg border border-black/15 bg-white/60 px-8 py-3.5 text-sm font-semibold text-[#0a0a0a] backdrop-blur-sm transition-all hover:bg-white/90 active:scale-[0.98]"
          >
            View on GitHub
          </a>
        </motion.div>

        {/* Stat row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-black/8 pt-10"
        >
          {[
            { value: "4", label: "Datasets" },
            { value: "Weekly", label: "Auto-refresh" },
            { value: "CSV + Excel", label: "Formats" },
            { value: "Free", label: "Always" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold tracking-tight text-[#0a0a0a]">{stat.value}</p>
              <p className="mt-0.5 text-xs font-medium text-neutral-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
