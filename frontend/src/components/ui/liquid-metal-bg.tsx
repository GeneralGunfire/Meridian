"use client";
import { useEffect, useRef } from "react";

// Pure CSS animated gradient — no cursor tracking, no lag, predetermined movement
export function LiquidMetalBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Slow-drifting blob 1 */}
      <div
        className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full opacity-[0.18]"
        style={{
          background: "radial-gradient(circle, #b8a898 0%, transparent 70%)",
          animation: "drift1 18s ease-in-out infinite alternate",
        }}
      />
      {/* Slow-drifting blob 2 */}
      <div
        className="absolute -bottom-40 -right-40 h-[700px] w-[700px] rounded-full opacity-[0.14]"
        style={{
          background: "radial-gradient(circle, #a09080 0%, transparent 70%)",
          animation: "drift2 22s ease-in-out infinite alternate",
        }}
      />
      {/* Centre shimmer */}
      <div
        className="absolute top-1/2 left-1/2 h-[400px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.10]"
        style={{
          background: "radial-gradient(ellipse, #c8b8a0 0%, transparent 60%)",
          animation: "drift3 14s ease-in-out infinite alternate",
        }}
      />
      <style>{`
        @keyframes drift1 {
          from { transform: translate(0px, 0px) scale(1); }
          to   { transform: translate(80px, 60px) scale(1.12); }
        }
        @keyframes drift2 {
          from { transform: translate(0px, 0px) scale(1); }
          to   { transform: translate(-60px, -80px) scale(1.08); }
        }
        @keyframes drift3 {
          from { transform: translate(-50%, -50%) scaleX(1); }
          to   { transform: translate(-50%, -50%) scaleX(1.25) scaleY(0.85); }
        }
      `}</style>
    </div>
  );
}
