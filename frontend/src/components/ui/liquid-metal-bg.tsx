"use client";

// Pure CSS animated gradient — no cursor tracking, no lag, predetermined movement
export function LiquidMetalBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Large warm blob — top-left */}
      <div
        className="absolute -top-24 -left-24 h-162.5 w-162.5 rounded-full"
        style={{
          background: "radial-gradient(circle, #c9a87c 0%, #b89060 40%, transparent 72%)",
          opacity: 0.28,
          animation: "drift1 18s ease-in-out infinite alternate",
          filter: "blur(8px)",
        }}
      />
      {/* Deep warm blob — bottom-right */}
      <div
        className="absolute -bottom-32 -right-32 h-187.5 w-187.5 rounded-full"
        style={{
          background: "radial-gradient(circle, #a07850 0%, #8a6040 40%, transparent 70%)",
          opacity: 0.22,
          animation: "drift2 22s ease-in-out infinite alternate",
          filter: "blur(12px)",
        }}
      />
      {/* Centre shimmer — wide horizontal ellipse */}
      <div
        className="absolute top-1/2 left-1/2 h-87.5 w-250 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(ellipse, #d4b896 0%, #c0a070 30%, transparent 65%)",
          opacity: 0.16,
          animation: "drift3 14s ease-in-out infinite alternate",
          filter: "blur(20px)",
        }}
      />
      {/* Accent — small bright highlight top-right */}
      <div
        className="absolute top-8 right-[10%] h-70 w-70 rounded-full"
        style={{
          background: "radial-gradient(circle, #e8c89a 0%, #d4a870 50%, transparent 75%)",
          opacity: 0.20,
          animation: "drift4 16s ease-in-out infinite alternate",
          filter: "blur(6px)",
        }}
      />
      {/* Subtle noise texture overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
          mixBlendMode: "overlay",
        }}
      />
      <style>{`
        @keyframes drift1 {
          from { transform: translate(0px, 0px) scale(1); }
          to   { transform: translate(90px, 70px) scale(1.15); }
        }
        @keyframes drift2 {
          from { transform: translate(0px, 0px) scale(1); }
          to   { transform: translate(-70px, -90px) scale(1.1); }
        }
        @keyframes drift3 {
          from { transform: translate(-50%, -50%) scaleX(1) scaleY(1); }
          to   { transform: translate(-50%, -52%) scaleX(1.3) scaleY(0.8); }
        }
        @keyframes drift4 {
          from { transform: translate(0px, 0px) scale(1); }
          to   { transform: translate(-50px, 60px) scale(1.2); }
        }
      `}</style>
    </div>
  );
}
