"use client";
import { motion } from "motion/react";

const links = {
  Datasets: ["Crime Statistics", "Eskom Load-Shedding", "Water & Sanitation", "Housing Data"],
  Platform: ["Browse All", "Power BI Guides", "Download CSVs", "GitHub"],
  Project: ["About Meridian", "How It Works", "Open Source", "Contact"],
};

export default function Footer() {
  return (
    <footer className="border-t border-black/8 bg-[#f5f0e8]">
      {/* Top CTA band */}
      <div className="border-b border-black/8 px-4 py-16">
        <div className="mx-auto max-w-6xl flex flex-col items-center text-center gap-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xs font-semibold uppercase tracking-widest text-neutral-400"
          >
            Free & Open Source
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="text-4xl font-bold tracking-[-0.03em] text-[#0a0a0a] sm:text-5xl"
          >
            Start building with<br />SA government data.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <a
              href="#datasets"
              className="rounded-lg bg-[#0a0a0a] px-6 py-3 text-sm font-medium text-[#f5f0e8] transition-all hover:bg-neutral-800 active:scale-[0.98]"
            >
              Browse Datasets
            </a>
            <a
              href="#"
              className="rounded-lg border border-black/15 bg-white/60 px-6 py-3 text-sm font-medium text-[#0a0a0a] transition-all hover:bg-white/80 active:scale-[0.98]"
            >
              View on GitHub
            </a>
          </motion.div>
        </div>
      </div>

      {/* Links grid */}
      <div className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0a0a0a]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#f5f0e8]">
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                    <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-sm font-semibold tracking-tight text-[#0a0a0a]">Meridian</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-500 max-w-[200px]">
                Weekly SA government data — scraped, cleaned, and ready for your Power BI dashboards.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(links).map(([heading, items]) => (
              <div key={heading}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">{heading}</p>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item}>
                      <a href="#" className="text-sm text-neutral-500 transition-colors hover:text-[#0a0a0a]">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-black/8 pt-6 sm:flex-row">
            <p className="text-xs text-neutral-400">
              &copy; 2026 Meridian. Data sourced from official SA government portals.
            </p>
            <p className="text-xs text-neutral-400">
              Built by Tessyc &middot; MIT License
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
