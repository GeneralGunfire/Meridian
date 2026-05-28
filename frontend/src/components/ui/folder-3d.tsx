"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, forwardRef } from "react";
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface FolderItem {
  id: string;
  image: string;
  title: string;
  /** Called when "View dataset" is clicked inside the lightbox */
  onOpen?: () => void;
}

export interface FolderProps {
  label: string;
  /** Gradient string e.g. "linear-gradient(135deg, #1a6b4a, #0d4a30)" */
  gradient?: string;
  items: FolderItem[];
  className?: string;
}

// ── Mini card that fans out on hover ─────────────────────────────────────────
interface ProjectCardProps {
  image: string;
  title: string;
  delay: number;
  isVisible: boolean;
  index: number;
  totalCount: number;
  onClick: () => void;
  isSelected: boolean;
}

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ image, title, delay, isVisible, index, totalCount, onClick, isSelected }, ref) => {
    const middleIndex = (totalCount - 1) / 2;
    const factor = totalCount > 1 ? (index - middleIndex) / middleIndex : 0;
    const rotation = factor * 25;
    const translationX = factor * 85;
    const translationY = Math.abs(factor) * 12;

    return (
      <div
        ref={ref}
        className={cn("absolute w-20 h-28 cursor-pointer group/card", isSelected && "opacity-0 pointer-events-none")}
        style={{
          transform: isVisible
            ? `translateY(calc(-100px + ${translationY}px)) translateX(${translationX}px) rotate(${rotation}deg) scale(1)`
            : "translateY(0px) translateX(0px) rotate(0deg) scale(0.4)",
          opacity: isSelected ? 0 : isVisible ? 1 : 0,
          transition: `all 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
          zIndex: 10 + index,
          left: "-40px",
          top: "-56px",
          willChange: "transform, opacity",
        }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <div className={cn(
          "w-full h-full rounded-lg overflow-hidden shadow-xl border border-white/10 relative",
          "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "group-hover/card:-translate-y-6 group-hover/card:shadow-2xl group-hover/card:ring-2 group-hover/card:ring-black/20 group-hover/card:scale-125",
        )}>
          <img
            src={image || PLACEHOLDER}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
          <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] font-black uppercase tracking-tighter text-white truncate drop-shadow-md">
            {title}
          </p>
        </div>
      </div>
    );
  }
);
ProjectCard.displayName = "ProjectCard";

// ── Lightbox ─────────────────────────────────────────────────────────────────
interface LightboxProps {
  items: FolderItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  sourceRect: DOMRect | null;
  onCloseComplete?: () => void;
  onNavigate: (index: number) => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  items, currentIndex, isOpen, onClose, sourceRect, onCloseComplete, onNavigate,
}) => {
  const [phase, setPhase] = useState<"initial" | "animating" | "complete">("initial");
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [idx, setIdx] = useState(currentIndex);
  const [isSliding, setIsSliding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = items.length;
  const hasNext = idx < total - 1;
  const hasPrev = idx > 0;
  const current = items[idx];

  useEffect(() => {
    if (isOpen && currentIndex !== idx && !isSliding) {
      setIsSliding(true);
      const t = setTimeout(() => { setIdx(currentIndex); setIsSliding(false); }, 400);
      return () => clearTimeout(t);
    }
  }, [currentIndex, isOpen, idx, isSliding]);

  useEffect(() => { if (isOpen) { setIdx(currentIndex); setIsSliding(false); } }, [isOpen, currentIndex]);

  const navigateNext = useCallback(() => { if (idx < total - 1 && !isSliding) onNavigate(idx + 1); }, [idx, total, isSliding, onNavigate]);
  const navigatePrev = useCallback(() => { if (idx > 0 && !isSliding) onNavigate(idx - 1); }, [idx, isSliding, onNavigate]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    onClose();
    setTimeout(() => { setIsClosing(false); setShouldRender(false); setPhase("initial"); onCloseComplete?.(); }, 500);
  }, [onClose, onCloseComplete]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") navigateNext();
      if (e.key === "ArrowLeft") navigatePrev();
    };
    window.addEventListener("keydown", handler);
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [isOpen, handleClose, navigateNext, navigatePrev]);

  useLayoutEffect(() => {
    if (isOpen && sourceRect) {
      setShouldRender(true);
      setPhase("initial");
      setIsClosing(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("animating")));
      const t = setTimeout(() => setPhase("complete"), 700);
      return () => clearTimeout(t);
    }
  }, [isOpen, sourceRect]);

  if (!shouldRender || !current) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const tW = Math.min(800, vw - 64);
  const tH = Math.min(vh * 0.85, 600);
  const tX = (vw - tW) / 2;
  const tY = (vh - tH) / 2;

  const getInitialStyles = (): React.CSSProperties => {
    if (!sourceRect) return {};
    const scaleX = sourceRect.width / tW;
    const scaleY = sourceRect.height / tH;
    const scale = Math.max(scaleX, scaleY);
    const translateX = sourceRect.left + sourceRect.width / 2 - (tX + tW / 2) + window.scrollX;
    const translateY = sourceRect.top + sourceRect.height / 2 - (tY + tH / 2) + window.scrollY;
    return { transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`, opacity: 0.5, borderRadius: "12px" };
  };

  const getFinalStyles = (): React.CSSProperties => ({ transform: "translate(0, 0) scale(1)", opacity: 1, borderRadius: "24px" });
  const currentStyles = phase === "initial" && !isClosing ? getInitialStyles() : getFinalStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={handleClose}
      style={{ opacity: isClosing ? 0 : 1, transition: "opacity 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {/* backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(245,240,232,0.92)",
          backdropFilter: "blur(24px)",
          opacity: phase === "initial" && !isClosing ? 0 : 1,
          transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* close */}
      <button
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        className="absolute top-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/80 text-neutral-600 shadow-lg backdrop-blur-sm hover:bg-white hover:text-[#0a0a0a] transition-all duration-300"
        style={{
          opacity: phase === "complete" && !isClosing ? 1 : 0,
          transform: phase === "complete" && !isClosing ? "translateY(0)" : "translateY(-30px)",
          transition: "opacity 400ms ease-out 400ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 400ms",
        }}
      >
        <X className="h-5 w-5" strokeWidth={2.5} />
      </button>

      {/* prev */}
      <button
        onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
        disabled={!hasPrev || isSliding}
        className="absolute left-4 md:left-10 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white/80 text-neutral-600 shadow-lg backdrop-blur-sm hover:scale-110 hover:bg-white active:scale-95 transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none"
        style={{
          opacity: phase === "complete" && !isClosing && hasPrev ? 1 : 0,
          transform: phase === "complete" && !isClosing ? "translateX(0)" : "translateX(-40px)",
          transition: "opacity 400ms ease-out 600ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 600ms",
        }}
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={3} />
      </button>

      {/* next */}
      <button
        onClick={(e) => { e.stopPropagation(); navigateNext(); }}
        disabled={!hasNext || isSliding}
        className="absolute right-4 md:right-10 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white/80 text-neutral-600 shadow-lg backdrop-blur-sm hover:scale-110 hover:bg-white active:scale-95 transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none"
        style={{
          opacity: phase === "complete" && !isClosing && hasNext ? 1 : 0,
          transform: phase === "complete" && !isClosing ? "translateX(0)" : "translateX(40px)",
          transition: "opacity 400ms ease-out 600ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 600ms",
        }}
      >
        <ChevronRight className="h-6 w-6" strokeWidth={3} />
      </button>

      {/* main container */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...currentStyles,
          transform: isClosing ? "translate(0, 0) scale(0.92)" : currentStyles.transform,
          transition: phase === "initial" && !isClosing ? "none" : "transform 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 600ms ease-out, border-radius 700ms ease",
          transformOrigin: "center center",
        }}
      >
        <div className="relative overflow-hidden rounded-[inherit] bg-white border border-black/10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.25)]">
          {/* image carousel */}
          <div className="relative overflow-hidden aspect-4/3 md:aspect-16/10">
            <div
              className="flex w-full h-full"
              style={{
                transform: `translateX(-${idx * 100}%)`,
                transition: isSliding ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)" : "none",
                willChange: "transform",
              }}
            >
              {items.map((item) => (
                <div key={item.id} className="min-w-full h-full relative">
                  <img
                    src={item.image || PLACEHOLDER}
                    alt={item.title}
                    className="w-full h-full object-cover select-none"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>

          {/* bottom bar */}
          <div
            className="px-8 py-6 border-t border-black/8"
            style={{
              opacity: phase === "complete" && !isClosing ? 1 : 0,
              transform: phase === "complete" && !isClosing ? "translateY(0)" : "translateY(40px)",
              transition: "opacity 500ms ease-out 500ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 500ms",
            }}
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-[#0a0a0a] tracking-tight truncate">{current?.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 rounded-full border border-black/8 bg-neutral-50 px-2.5 py-1">
                    {items.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { if (!isSliding && i !== idx) onNavigate(i); }}
                        className={cn("h-1.5 rounded-full transition-all duration-500", i === idx ? "w-4 bg-[#0a0a0a]" : "w-1.5 bg-black/20 hover:bg-black/40")}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{idx + 1} / {total}</p>
                </div>
              </div>
              {current?.onOpen && (
                <button
                  onClick={(e) => { e.stopPropagation(); current.onOpen?.(); handleClose(); }}
                  className="flex items-center gap-2 rounded-xl bg-[#0a0a0a] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#f5f0e8] shadow-lg transition-all duration-300 hover:bg-neutral-800 hover:scale-105 active:scale-95"
                >
                  <span>View dataset</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── AnimatedFolder ─────────────────────────────────────────────────────────────
export function Folder({ label, gradient, items, className }: FolderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
  const [hiddenCardId, setHiddenCardId] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const previewItems = items.slice(0, 5);

  const handleCardClick = (item: FolderItem, index: number) => {
    const el = cardRefs.current[index];
    if (el) setSourceRect(el.getBoundingClientRect());
    setSelectedIndex(index);
    setHiddenCardId(item.id);
  };

  const handleCloseLightbox = () => { setSelectedIndex(null); setSourceRect(null); };
  const handleCloseComplete = () => { setHiddenCardId(null); };
  const handleNavigate = (newIndex: number) => {
    setSelectedIndex(newIndex);
    setHiddenCardId(items[newIndex]?.id ?? null);
  };

  // Glassy monochrome panels — back is slightly darker, front is near-white
  const gradientStr = gradient ?? "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(220,220,218,0.85) 100%)";
  const backBg  = "linear-gradient(145deg, rgba(200,200,198,0.95) 0%, rgba(170,170,168,0.9) 100%)";
  const tabBg   = "linear-gradient(145deg, rgba(180,180,178,0.95) 0%, rgba(155,155,153,0.9) 100%)";
  const frontBg = gradientStr; // uses the passed gradient (lighter)

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer",
          "border border-black/10 backdrop-blur-xl",
          "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "hover:border-black/18",
          className,
        )}
        style={{
          background: "rgba(255,255,255,0.55)",
          boxShadow: isHovered
            ? "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"
            : "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)",
          minWidth: "260px",
          minHeight: "300px",
          perspective: "1200px",
          transform: isHovered ? "scale(1.04) rotate(-1deg)" : "scale(1) rotate(0deg)",
          willChange: "transform",
          transition: "transform 700ms cubic-bezier(0.16,1,0.3,1), box-shadow 500ms ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* subtle glass highlight on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-700"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%)",
            opacity: isHovered ? 1 : 0.4,
          }}
        />

        {/* 3-D folder body */}
        <div className="relative flex items-center justify-center mb-4" style={{ height: "160px", width: "200px" }}>
          {/* back panel */}
          <div
            className="absolute w-32 h-24 rounded-lg"
            style={{
              background: backBg,
              boxShadow: "0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.5)",
              border: "1px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(8px)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(-20deg) scaleY(1.05)" : "rotateX(0deg) scaleY(1)",
              transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 10,
            }}
          />
          {/* tab */}
          <div
            className="absolute w-12 h-4 rounded-t-md"
            style={{
              background: tabBg,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderBottom: "none",
              backdropFilter: "blur(8px)",
              top: "calc(50% - 48px - 12px)",
              left: "calc(50% - 64px + 16px)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(-30deg) translateY(-3px)" : "rotateX(0deg) translateY(0)",
              transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 10,
            }}
          />

          {/* fanned cards */}
          <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 20 }}>
            {previewItems.map((item, i) => (
              <ProjectCard
                key={item.id}
                ref={(el) => { cardRefs.current[i] = el; }}
                image={item.image}
                title={item.title}
                delay={i * 50}
                isVisible={isHovered}
                index={i}
                totalCount={previewItems.length}
                onClick={() => handleCardClick(item, i)}
                isSelected={hiddenCardId === item.id}
              />
            ))}
          </div>

          {/* front flap */}
          <div
            className="absolute w-32 h-24 rounded-lg"
            style={{
              background: frontBg,
              boxShadow: "0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.75)",
              border: "1px solid rgba(0,0,0,0.07)",
              backdropFilter: "blur(12px)",
              top: "calc(50% - 48px + 4px)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(35deg) translateY(12px)" : "rotateX(0deg) translateY(0)",
              transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 30,
            }}
          />
          {/* front glass shine */}
          <div
            className="pointer-events-none absolute w-32 h-24 rounded-lg overflow-hidden"
            style={{
              top: "calc(50% - 48px + 4px)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(35deg) translateY(12px)" : "rotateX(0deg) translateY(0)",
              transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 31,
            }}
          />
        </div>

        {/* label */}
        <div className="text-center">
          <h3
            className="text-base font-bold text-[#0a0a0a] mt-4 transition-all duration-500"
            style={{ transform: isHovered ? "translateY(2px)" : "translateY(0)" }}
          >
            {label}
          </h3>
          <p className="text-xs font-medium text-neutral-500 mt-0.5 transition-all duration-500">
            {items.length} dataset{items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* idle hint */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 transition-all duration-500"
          style={{ opacity: isHovered ? 0 : 1, transform: isHovered ? "translateY(10px)" : "translateY(0)" }}
        >
          Hover to explore
        </div>
      </div>

      <Lightbox
        items={items}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={handleCloseLightbox}
        sourceRect={sourceRect}
        onCloseComplete={handleCloseComplete}
        onNavigate={handleNavigate}
      />
    </>
  );
}
