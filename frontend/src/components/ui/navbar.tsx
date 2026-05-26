"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Components", href: "#" },
  { label: "Datasets", href: "#datasets" },
  { label: "Dashboards", href: "#dashboards" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b border-black/10 bg-[#f5f0e8]/90 backdrop-blur-md"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-black">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-[#f5f0e8]"
              >
                <circle cx="8" cy="8" r="3" fill="currentColor" />
                <path
                  d="M8 1v2M8 13v2M1 8h2M13 8h2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight text-[#0a0a0a]">Meridian</span>
          </div>

          {/* Nav links — desktop */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-black/5 hover:text-black"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href="#datasets"
              className="hidden rounded-md bg-black px-3.5 py-1.5 text-sm font-medium text-[#f5f0e8] transition hover:bg-neutral-800 md:block"
            >
              Get Datasets
            </a>
            {/* Mobile hamburger */}
            <button
              className="flex flex-col gap-1 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span className="block h-0.5 w-5 bg-black" />
              <span className="block h-0.5 w-5 bg-black" />
              <span className="block h-0.5 w-5 bg-black" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-black/10 pb-3 pt-2 md:hidden">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm text-neutral-500 hover:bg-black/5 hover:text-black"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#datasets"
              className="mt-2 block rounded-md bg-black px-3 py-2 text-center text-sm font-medium text-[#f5f0e8]"
              onClick={() => setMobileOpen(false)}
            >
              Get Datasets
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
