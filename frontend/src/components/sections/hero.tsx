"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const avatarColors = [
  "bg-stone-800",
  "bg-stone-700",
  "bg-stone-600",
  "bg-stone-500",
  "bg-stone-400",
];

const avatarInitials = ["TM", "KN", "SP", "LB", "RD"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay },
  }),
};

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      {/* Subtle dot grid — beige-tinted */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Radial vignette — fades dots toward edges */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_40%,#f5f0e8_100%)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Badge */}
        <motion.a
          href="#"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="group mb-8 inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-black/5 px-4 py-1.5 text-xs font-medium text-neutral-600 backdrop-blur-sm transition hover:border-black/25 hover:bg-black/10"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          New — Weekly SA Data Updates
          <ArrowRight className="ml-0.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.1}
          className="text-balance text-5xl font-bold leading-[1.1] tracking-[-0.03em] text-[#0a0a0a] sm:text-6xl lg:text-7xl"
        >
          Make sense of{" "}
          <span className="bg-linear-to-b from-[#0a0a0a] to-neutral-500 bg-clip-text text-transparent">
            South Africa&apos;s data.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.2}
          className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-neutral-500 sm:text-lg"
        >
          Weekly scraped government datasets — crime, Eskom load-shedding, water
          access, housing. Download CSVs, explore trends, power your Power BI
          dashboards.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.3}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {/* Primary */}
          <a
            href="#datasets"
            className="rounded-lg bg-[#0a0a0a] px-5 py-2.5 text-sm font-medium text-[#f5f0e8] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)_inset] ring ring-black/20 ring-offset-2 ring-offset-[#f5f0e8] transition-all hover:shadow-[0px_0px_20px_0px_rgba(0,0,0,0.25)_inset] hover:ring-black/40 active:scale-[0.98]"
          >
            Browse Datasets
          </a>
          {/* Secondary */}
          <a
            href="#dashboards"
            className="rounded-lg border border-black/15 bg-white/60 px-5 py-2.5 text-sm font-medium text-[#0a0a0a] backdrop-blur-sm transition-all hover:border-black/30 hover:bg-white/80 active:scale-[0.98]"
          >
            View Dashboards
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.45}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <div className="flex items-center -space-x-2">
            {avatarInitials.map((initials, i) => (
              <div
                key={initials}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f5f0e8] text-xs font-semibold text-white ${avatarColors[i]}`}
              >
                {initials}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-xs text-neutral-400">
              Trusted by data analysts across South Africa
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
