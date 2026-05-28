"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AnimatedCard({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "group/animated-card relative overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: CardProps) {
  return (
    <div className={cn("flex flex-col space-y-1 border-t border-black/8 px-4 py-3", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-bold text-[#0a0a0a] leading-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-neutral-500", className)} {...props} />;
}

export function CardVisual({ className, ...props }: CardProps) {
  return <div className={cn("h-[160px] w-full overflow-hidden", className)} {...props} />;
}

// ── Meridian-themed animated bar chart visual ─────────────────────────────────
interface DataVisualProps {
  mainColor?: string;
  secondaryColor?: string;
}

export function DataVisual({
  mainColor = "#0a0a0a",
  secondaryColor = "#a3a3a3",
}: DataVisualProps) {
  const [hovered, setHovered] = useState(false);

  const bars = [
    { x: 18,  h: 35, hy: 55,  hh: 95,  p: true  },
    { x: 38,  h: 60, hy: 30,  hh: 120, p: false },
    { x: 58,  h: 45, hy: 45,  hh: 105, p: true  },
    { x: 78,  h: 80, hy: 10,  hh: 140, p: false },
    { x: 98,  h: 30, hy: 70,  hh: 80,  p: true  },
    { x: 118, h: 65, hy: 25,  hh: 125, p: false },
    { x: 138, h: 50, hy: 40,  hh: 110, p: true  },
    { x: 158, h: 40, hy: 50,  hh: 100, p: false },
    { x: 178, h: 75, hy: 15,  hh: 135, p: true  },
    { x: 198, h: 55, hy: 35,  hh: 115, p: false },
    { x: 218, h: 25, hy: 65,  hh: 85,  p: true  },
    { x: 238, h: 70, hy: 20,  hh: 130, p: false },
    { x: 258, h: 45, hy: 45,  hh: 105, p: true  },
    { x: 278, h: 85, hy: 5,   hh: 145, p: false },
  ];

  const BASE_Y = 150;

  return (
    <div
      className="relative h-[160px] w-full overflow-hidden rounded-t-2xl bg-[#f5f0e8]/60"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg width="100%" height="160" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id={`glow-${mainColor.replace("#","")}`} cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor={mainColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor={mainColor} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="160" fill={`url(#glow-${mainColor.replace("#","")})`} />
        </svg>
      </div>

      {/* Bars */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.6,0.6,0,1)]"
        style={{ transform: hovered ? "scaleY(1.06)" : "scaleY(1)", transformOrigin: "bottom" }}
      >
        <svg width="100%" height="160" viewBox="0 0 320 160" preserveAspectRatio="xMidYMax meet">
          {bars.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={hovered ? BASE_Y - b.hh : BASE_Y - b.h}
              width={16}
              height={hovered ? b.hh : b.h}
              rx={3}
              fill={b.p ? mainColor : secondaryColor}
              opacity={b.p ? 0.9 : 0.3}
              className="transition-all duration-500 ease-[cubic-bezier(0.6,0.6,0,1)]"
            />
          ))}
        </svg>
      </div>

      {/* Hover tooltip */}
      <div
        className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border border-black/10 bg-white/90 px-2.5 py-1.5 backdrop-blur-sm transition-all duration-300 ${
          hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        }`}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-[#0a0a0a]" />
        <span className="text-[10px] font-semibold text-[#0a0a0a]">Data trends</span>
      </div>

      {/* Default label (hides on hover) */}
      <div
        className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border border-black/10 bg-white/80 px-2.5 py-1.5 backdrop-blur-sm transition-all duration-300 ${
          hovered ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: mainColor }} />
        <span className="text-[10px] font-medium text-neutral-500">Hover to explore</span>
      </div>
    </div>
  );
}
