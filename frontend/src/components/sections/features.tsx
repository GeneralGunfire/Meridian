"use client";

import { motion } from "motion/react";

const features = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Economy",
    description: "Tax revenue (SARS), national budget & spending (Treasury), GDP and macro indicators (StatsSA), monetary data (SARB), and municipal finances.",
    badge: "5 datasets",
    count: 5,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Energy",
    description: "Eskom power supply & demand, generation infrastructure health (EAF), financial spending and revenue — national and provincial breakdowns.",
    badge: "4 datasets",
    count: 4,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Social",
    description: "Water & sanitation access, housing and formal dwellings, unemployment and labour force participation — from StatsSA GHS and QLFS surveys.",
    badge: "3 datasets",
    count: 3,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Safety",
    description: "SAPS-sourced crime data by province and police station — murder, assault, robbery, sexual offences, and more. Quarterly updates.",
    badge: "3 datasets",
    count: 3,
  },
];

export default function Features() {
  return (
    <section id="datasets" className="px-4 py-24">
      <div className="mx-auto max-w-7xl">

        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            15 Datasets · 4 Categories
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#0a0a0a] sm:text-4xl">
            The most comprehensive SA<br className="hidden sm:block" /> government data collection.
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Official sources. Clean CSVs. Up to 15 years of history. Ready for Power BI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
              className="group relative rounded-xl border border-black/12 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-black/25 hover:bg-white hover:shadow-[0_6px_28px_rgba(0,0,0,0.1)]"
            >
              <div className="mb-4 inline-flex rounded-lg border border-black/10 bg-black/6 p-2.5 text-[#0a0a0a]">
                {feature.icon}
              </div>

              <span className="absolute right-4 top-4 rounded-full border border-black/12 bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                {feature.badge}
              </span>

              <h3 className="mb-2 text-sm font-bold text-[#0a0a0a]">
                {feature.title}
              </h3>

              <p className="text-xs leading-relaxed text-neutral-600">
                {feature.description}
              </p>

              <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors group-hover:text-[#0a0a0a]">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                View datasets →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
