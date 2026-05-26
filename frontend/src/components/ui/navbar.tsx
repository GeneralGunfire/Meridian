"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { label: "Datasets", href: "#datasets" },
  { label: "Dashboards", href: "#dashboards" },
  { label: "How It Works", href: "#" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f0e8]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0a0a0a]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#f5f0e8]">
                <circle cx="8" cy="8" r="3" fill="currentColor" />
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-bold tracking-tight text-[#0a0a0a]">Meridian</span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="relative inline-block group px-0.5">
                  {/* Text */}
                  <span className="relative z-10 block px-3 py-2 text-sm font-medium text-neutral-500 transition-colors duration-200 group-hover:text-white">
                    {link.label}
                  </span>
                  {/* Top + bottom border */}
                  <span className="absolute inset-0 border-t-[1.5px] border-b-[1.5px] border-[#0a0a0a] origin-center scale-y-[2] opacity-0 transition-all duration-250 group-hover:scale-y-100 group-hover:opacity-100 rounded-[1px]" />
                  {/* Fill */}
                  <span className="absolute top-[1.5px] left-0 w-full h-[calc(100%-3px)] bg-[#0a0a0a] origin-top scale-y-0 opacity-0 transition-all duration-250 group-hover:scale-y-100 group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="#datasets"
              className="hidden rounded-md bg-[#0a0a0a] px-4 py-2 text-sm font-semibold text-[#f5f0e8] transition-all hover:bg-neutral-800 active:scale-[0.98] md:block"
            >
              Get Datasets
            </a>

            {/* Mobile hamburger */}
            <button
              className="relative flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span className={cn("block h-[1.5px] w-5 bg-[#0a0a0a] transition-all duration-300 origin-center", mobileOpen && "translate-y-[6.5px] rotate-45")} />
              <span className={cn("block h-[1.5px] w-5 bg-[#0a0a0a] transition-all duration-300", mobileOpen && "opacity-0 scale-x-0")} />
              <span className={cn("block h-[1.5px] w-5 bg-[#0a0a0a] transition-all duration-300 origin-center", mobileOpen && "-translate-y-[6.5px] -rotate-45")} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-black/10 md:hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-black/5 hover:text-[#0a0a0a]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#datasets"
                className="mt-2 block rounded-md bg-[#0a0a0a] px-3 py-2.5 text-center text-sm font-semibold text-[#f5f0e8]"
                onClick={() => setMobileOpen(false)}
              >
                Get Datasets
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
