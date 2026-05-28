"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExpandableCardProps {
  title: string;
  src: string;
  category: string;
  children?: React.ReactNode;
  className?: string;
}

export function ExpandableCard({
  title,
  src,
  category,
  children,
  className,
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(false); };
    const onClickOutside = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setActive(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(10,10,10,0.55)", backdropFilter: "blur(6px)" }}
          />
        )}
      </AnimatePresence>

      {/* Expanded panel */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              layoutId={`card-${title}-${id}`}
              ref={cardRef}
              className="w-full sm:max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
              style={{
                background: "rgba(245,240,232,0.92)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.2)",
              }}
            >
              {/* Mobile drag handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="h-1 w-10 rounded-full bg-black/20" />
              </div>

              {/* Hero image */}
              <motion.div layoutId={`image-${title}-${id}`} className="relative shrink-0">
                <img
                  src={src}
                  alt={title}
                  className="w-full h-56 sm:h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f5f0e8]/60 to-transparent" />
              </motion.div>

              {/* Header row */}
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 shrink-0">
                <div>
                  <motion.p
                    layoutId={`cat-${category}-${id}`}
                    className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-1"
                  >
                    {category}
                  </motion.p>
                  <motion.h3
                    layoutId={`title-${title}-${id}`}
                    className="text-2xl font-bold text-[#0a0a0a] leading-tight"
                  >
                    {title}
                  </motion.h3>
                </div>
                <motion.button
                  layoutId={`btn-${title}-${id}`}
                  onClick={() => setActive(false)}
                  aria-label="Close"
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full border border-black/12 bg-white/80 text-neutral-600 hover:bg-white hover:text-[#0a0a0a] transition-colors"
                >
                  <motion.div animate={{ rotate: active ? 45 : 0 }} transition={{ duration: 0.3 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="M12 5v14" />
                    </svg>
                  </motion.div>
                </motion.button>
              </div>

              <div className="mx-6 h-px bg-black/8 shrink-0" />

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm text-neutral-600 leading-relaxed">
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {children}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Collapsed card */}
      <motion.div
        layoutId={`card-${title}-${id}`}
        onClick={() => setActive(true)}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-white/70",
          "transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:border-black/18",
          className
        )}
      >
        {/* Image */}
        <motion.div layoutId={`image-${title}-${id}`} className="relative overflow-hidden">
          <img
            src={src}
            alt={title}
            className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <motion.p
              layoutId={`cat-${category}-${id}`}
              className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-0.5"
            >
              {category}
            </motion.p>
            <motion.h3
              layoutId={`title-${title}-${id}`}
              className="text-sm font-bold text-[#0a0a0a] leading-tight truncate"
            >
              {title}
            </motion.h3>
          </div>
          <motion.div
            layoutId={`btn-${title}-${id}`}
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white/80 text-neutral-500 group-hover:border-black/25 group-hover:text-[#0a0a0a] transition-colors"
          >
            <motion.div animate={{ rotate: 0 }} transition={{ duration: 0.3 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5v14" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
