"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const avatarColors = [
  "bg-rose-400",
  "bg-sky-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-violet-400",
];

const avatarInitials = ["TM", "KN", "SP", "LB", "RD"];

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Radial fade overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,black_100%)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Badge */}
        <motion.a
          href="#"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="group mb-8 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          New — Weekly SA Data Updates
          <ArrowRight className="ml-0.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-balance text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Make sense of{" "}
          <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            South Africa&apos;s data.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-neutral-400 sm:text-lg"
        >
          Weekly scraped government datasets — crime, Eskom load-shedding, water
          access, housing. Download CSVs, explore trends, power your Power BI
          dashboards.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {/* Primary */}
          <a
            href="#datasets"
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-[0px_0px_10px_0px_rgba(255,255,255,0.2)_inset] ring ring-white/20 ring-offset-2 ring-offset-neutral-900 transition-all hover:shadow-[0px_0px_20px_0px_rgba(255,255,255,0.4)_inset] hover:ring-white/40"
          >
            Browse Datasets
          </a>
          {/* Secondary */}
          <a
            href="#dashboards"
            className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
          >
            View Dashboards
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          {/* Avatars */}
          <div className="flex items-center -space-x-2">
            {avatarInitials.map((initials, i) => (
              <div
                key={initials}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-xs font-semibold text-white ${avatarColors[i]}`}
              >
                {initials}
              </div>
            ))}
          </div>

          {/* Stars + text */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-xs text-neutral-500">
              Trusted by data analysts across South Africa
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
