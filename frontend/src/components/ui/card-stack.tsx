"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SquareArrowOutUpRight } from "lucide-react";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export type CardStackItem = {
  id: string | number;
  title: string;
  description?: string;
  imageSrc?: string;
  href?: string;
  tag?: string;
  rows?: string;
  category?: string;
  onOpen?: () => void;
};

export type CardStackProps<T extends CardStackItem> = {
  items: T[];
  initialIndex?: number;
  maxVisible?: number;
  cardWidth?: number;
  cardHeight?: number;
  overlap?: number;
  spreadDeg?: number;
  perspectivePx?: number;
  depthPx?: number;
  tiltXDeg?: number;
  activeLiftPx?: number;
  activeScale?: number;
  inactiveScale?: number;
  springStiffness?: number;
  springDamping?: number;
  loop?: boolean;
  autoAdvance?: boolean;
  intervalMs?: number;
  pauseOnHover?: boolean;
  showDots?: boolean;
  className?: string;
  onChangeIndex?: (index: number, item: T) => void;
  renderCard?: (item: T, state: { active: boolean }) => React.ReactNode;
};

function wrapIndex(n: number, len: number) {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

function signedOffset(i: number, active: number, len: number, loop: boolean) {
  const raw = i - active;
  if (!loop || len <= 1) return raw;
  const alt = raw > 0 ? raw - len : raw + len;
  return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

export function CardStack<T extends CardStackItem>({
  items,
  initialIndex = 0,
  maxVisible = 7,
  cardWidth = 460,
  cardHeight = 280,
  overlap = 0.48,
  spreadDeg = 40,
  perspectivePx = 1100,
  depthPx = 120,
  tiltXDeg = 10,
  activeLiftPx = 20,
  activeScale = 1.03,
  inactiveScale = 0.94,
  springStiffness = 280,
  springDamping = 28,
  loop = true,
  autoAdvance = false,
  intervalMs = 2800,
  pauseOnHover = true,
  showDots = true,
  className,
  onChangeIndex,
  renderCard,
}: CardStackProps<T>) {
  const reduceMotion = useReducedMotion();
  const len = items.length;
  const [active, setActive] = React.useState(() => wrapIndex(initialIndex, len));
  const [hovering, setHovering] = React.useState(false);

  React.useEffect(() => { setActive((a) => wrapIndex(a, len)); }, [len]);
  React.useEffect(() => {
    if (!len) return;
    onChangeIndex?.(active, items[active]!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const maxOffset = Math.max(0, Math.floor(maxVisible / 2));
  const cardSpacing = Math.max(10, Math.round(cardWidth * (1 - overlap)));
  const stepDeg = maxOffset > 0 ? spreadDeg / maxOffset : 0;

  const canGoPrev = loop || active > 0;
  const canGoNext = loop || active < len - 1;

  const prev = React.useCallback(() => {
    if (!len || !canGoPrev) return;
    setActive((a) => wrapIndex(a - 1, len));
  }, [canGoPrev, len]);

  const next = React.useCallback(() => {
    if (!len || !canGoNext) return;
    setActive((a) => wrapIndex(a + 1, len));
  }, [canGoNext, len]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  React.useEffect(() => {
    if (!autoAdvance || reduceMotion || !len) return;
    if (pauseOnHover && hovering) return;
    const id = window.setInterval(() => {
      if (loop || active < len - 1) next();
    }, Math.max(700, intervalMs));
    return () => window.clearInterval(id);
  }, [autoAdvance, intervalMs, hovering, pauseOnHover, reduceMotion, len, loop, active, next]);

  if (!len) return null;
  const activeItem = items[active]!;

  return (
    <div
      className={cn("w-full", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className="relative w-full"
        style={{ height: Math.max(340, cardHeight + 60) }}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute inset-x-0 top-6 mx-auto h-40 w-[60%] rounded-full bg-black/[0.04] blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-32 w-[70%] rounded-full bg-black/[0.06] blur-3xl" aria-hidden />

        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ perspective: `${perspectivePx}px` }}
        >
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const off = signedOffset(i, active, len, loop);
              const abs = Math.abs(off);
              if (abs > maxOffset) return null;

              const rotateZ = off * stepDeg;
              const x = off * cardSpacing;
              const y = abs * 10;
              const z = -abs * depthPx;
              const isActive = off === 0;
              const scale = isActive ? activeScale : inactiveScale;
              const lift = isActive ? -activeLiftPx : 0;
              const rotateX = isActive ? 0 : tiltXDeg;
              const zIndex = 100 - abs;

              const dragProps = isActive ? {
                drag: "x" as const,
                dragConstraints: { left: 0, right: 0 },
                dragElastic: 0.18,
                onDragEnd: (_e: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
                  if (reduceMotion) return;
                  const travel = info.offset.x;
                  const v = info.velocity.x;
                  const threshold = Math.min(140, cardWidth * 0.22);
                  if (travel > threshold || v > 600) prev();
                  else if (travel < -threshold || v < -600) next();
                },
              } : {};

              return (
                <motion.div
                  key={item.id}
                  className={cn(
                    "absolute bottom-0 rounded-2xl overflow-hidden shadow-xl will-change-transform select-none",
                    "border border-black/10",
                    isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                  )}
                  style={{ width: cardWidth, height: cardHeight, zIndex, transformStyle: "preserve-3d" }}
                  initial={reduceMotion ? false : { opacity: 0, y: y + 40, x, rotateZ, rotateX, scale }}
                  animate={{ opacity: 1, x, y: y + lift, rotateZ, rotateX, scale }}
                  transition={{ type: "spring", stiffness: springStiffness, damping: springDamping }}
                  onClick={() => isActive ? item.onOpen?.() : setActive(i)}
                  {...dragProps}
                >
                  <div className="h-full w-full" style={{ transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }}>
                    {renderCard ? renderCard(item, { active: isActive }) : (
                      <DefaultCard item={item} active={isActive} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {showDots && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            {items.map((it, idx) => (
              <button
                key={it.id}
                onClick={() => setActive(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === active ? "w-5 bg-[#0a0a0a]" : "w-1.5 bg-black/20 hover:bg-black/40",
                )}
                aria-label={`Go to ${it.title}`}
              />
            ))}
          </div>
          {activeItem.onOpen && (
            <button
              onClick={activeItem.onOpen}
              className="text-neutral-400 hover:text-[#0a0a0a] transition-colors"
              aria-label="Open dataset"
            >
              <SquareArrowOutUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DefaultCard({ item, active }: { item: CardStackItem; active: boolean }) {
  return (
    <div className="relative h-full w-full bg-white/80">
      {item.imageSrc ? (
        <img src={item.imageSrc} alt={item.title} className="h-full w-full object-cover" draggable={false} loading="eager" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">No image</div>
      )}
      {/* gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* top-left badge */}
      {item.tag && (
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">{item.tag}</span>
        </div>
      )}

      {/* active indicator */}
      {active && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-semibold text-white">Popular</span>
        </div>
      )}

      {/* bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        {item.category && (
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/60">{item.category}</p>
        )}
        <p className="text-lg font-bold leading-tight text-white">{item.title}</p>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-white/75">{item.description}</p>
        )}
        {item.rows && (
          <p className="mt-2 text-[11px] font-semibold text-white/50">{item.rows} rows available</p>
        )}
      </div>
    </div>
  );
}
