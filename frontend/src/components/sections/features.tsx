"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: "Crime Statistics",
    description:
      "SAPS-sourced crime data by province and category. Quarterly updates covering murder, robbery, assault, and more — structured and ready for Power BI.",
    badge: "Quarterly",
    accent: "text-rose-400",
    border: "hover:border-rose-400/30",
    glow: "hover:shadow-[0_0_30px_rgba(251,113,133,0.05)]",
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: "Eskom Load-Shedding",
    description:
      "Stage tracking from the official Eskom API. Historical patterns, duration breakdowns by province, and weekly trend data.",
    badge: "Weekly",
    accent: "text-amber-400",
    border: "hover:border-amber-400/30",
    glow: "hover:shadow-[0_0_30px_rgba(251,191,36,0.05)]",
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h.01M7 10h.01M11 10h.01M15 10h.01M19 10h.01M3 14h.01M7 14h.01M11 14h.01M15 14h.01M19 14h.01M3 6h18M3 18h18"
        />
      </svg>
    ),
    title: "Water & Sanitation",
    description:
      "Municipal access rates from StatsSA General Household Surveys. Track water supply coverage and sanitation access across South Africa.",
    badge: "Annual",
    accent: "text-sky-400",
    border: "hover:border-sky-400/30",
    glow: "hover:shadow-[0_0_30px_rgba(56,189,248,0.05)]",
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    title: "Housing Data",
    description:
      "GHS household survey data on formal dwellings, electricity access, and infrastructure. Yearly SA-wide coverage for trend analysis.",
    badge: "Annual",
    accent: "text-emerald-400",
    border: "hover:border-emerald-400/30",
    glow: "hover:shadow-[0_0_30px_rgba(52,211,153,0.05)]",
  },
];

export default function Features() {
  return (
    <section id="datasets" className="px-4 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Datasets
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Everything you need, scraped weekly.
          </h2>
          <p className="mt-3 text-neutral-400">
            Official government sources. Clean CSVs. Ready for analysis.
          </p>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 ${feature.border} ${feature.glow}`}
            >
              {/* Icon */}
              <div
                className={`mb-4 inline-flex rounded-lg border border-white/10 bg-white/5 p-2.5 ${feature.accent}`}
              >
                {feature.icon}
              </div>

              {/* Badge */}
              <span
                className={`absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium ${feature.accent}`}
              >
                {feature.badge}
              </span>

              {/* Title */}
              <h3 className="mb-2 text-sm font-semibold text-white">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-xs leading-relaxed text-neutral-500">
                {feature.description}
              </p>

              {/* Download link */}
              <div className="mt-5 flex items-center gap-1 text-xs text-neutral-600 transition-colors group-hover:text-neutral-400">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download CSV
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
