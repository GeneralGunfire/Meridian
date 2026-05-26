"use client";
import { motion } from "motion/react";
import { GitBranch, X, ExternalLink } from "lucide-react";
import { LogoCloud } from "@/components/ui/logo-cloud";

const links = {
  Datasets: [
    { label: "Crime Statistics", href: "#" },
    { label: "Eskom Load-Shedding", href: "#" },
    { label: "Water & Sanitation", href: "#" },
    { label: "Housing Data", href: "#" },
  ],
  Platform: [
    { label: "Browse All Datasets", href: "#datasets" },
    { label: "Power BI Integration", href: "#" },
    { label: "Download CSVs", href: "#" },
    { label: "API Reference", href: "#" },
  ],
  Project: [
    { label: "About Meridian", href: "#" },
    { label: "How It Works", href: "#" },
    { label: "GitHub Repository", href: "#" },
    { label: "MIT License", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-black/8 bg-[#f5f0e8]">
      {/* CTA Band */}
      <div className="border-b border-black/8 px-4 py-20">
        <div className="mx-auto max-w-6xl flex flex-col items-center text-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-4"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Free &amp; Open Source
            </p>
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-[#0a0a0a] sm:text-5xl lg:text-6xl">
              Start building with<br />SA government data.
            </h2>
            <p className="mx-auto max-w-xl text-base text-neutral-500 leading-relaxed">
              Every dataset scraped weekly from official government sources. Clean CSVs, consistent schema, Power BI ready. No sign-up required.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <a
              href="#datasets"
              className="rounded-lg bg-[#0a0a0a] px-7 py-3.5 text-sm font-semibold text-[#f5f0e8] transition-all hover:bg-neutral-800 active:scale-[0.98]"
            >
              Browse Datasets
            </a>
            <a
              href="#"
              className="group flex items-center gap-2 rounded-lg border border-black/15 bg-white/60 px-7 py-3.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              <GitBranch className="h-4 w-4" />
              View on GitHub
              <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-70 transition-opacity" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Logo Cloud */}
      <div className="border-b border-black/8 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Built with tools analysts already use
          </p>
          <LogoCloud />
        </div>
      </div>

      {/* Links grid */}
      <div className="px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0a0a0a]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#f5f0e8]">
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                    <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-sm font-bold tracking-tight text-[#0a0a0a]">Meridian</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-500 max-w-[190px]">
                Weekly SA government datasets — scraped, cleaned, and ready for Power BI dashboards.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a href="#" className="text-neutral-400 transition-colors hover:text-[#0a0a0a]" aria-label="GitHub">
                  <GitBranch className="h-4 w-4" />
                </a>
                <a href="#" className="text-neutral-400 transition-colors hover:text-[#0a0a0a]" aria-label="Twitter">
                  <X className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(links).map(([heading, items]) => (
              <div key={heading}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">{heading}</p>
                <ul className="space-y-2.5">
                  {items.map(item => (
                    <li key={item.label}>
                      <a href={item.href} className="group flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-[#0a0a0a]">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-black/8 pt-7 sm:flex-row">
            <p className="text-xs text-neutral-400">
              &copy; 2026 Meridian. Data sourced from official SA government portals.
            </p>
            <p className="text-xs text-neutral-400">
              Built by Tessyc &middot; Open Source &middot; MIT License
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
