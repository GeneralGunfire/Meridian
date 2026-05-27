"use client";
import { motion } from "motion/react";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () => import("@/components/ui/particle-field").then((m) => ({ default: m.ParticleField })),
  { ssr: false }
);

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-[#f5f0e8] px-4 text-center">
      {/* Particle canvas — fills section, beige bg, warm amber particles */}
      <ParticleField />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          className="mb-10 text-5xl font-semibold tracking-[-0.035em] leading-[1.05] text-[#0a0a0a] sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
        >
          Meridian
        </motion.h1>

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
