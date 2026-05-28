"use client";

import React, { useState, useEffect, useRef } from "react";

interface DotCardProps {
  target?: number;
  duration?: number;
  label?: string;
  sublabel?: string;
}

export default function DotCard({
  target = 20000,
  duration = 2000,
  label = "Data rows compiled",
  sublabel = "across all datasets",
}: DotCardProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const steps = Math.ceil(duration / 40);
    const increment = Math.ceil(target / steps);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      setCount(current);
    }, 40);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  const display = count >= 1000
    ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
    : count.toString();

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-10 backdrop-blur-sm"
      style={{ minHeight: 200 }}
    >
      {/* Animated dot perimeter */}
      <div
        className="absolute h-3 w-3 rounded-full bg-[#0a0a0a]"
        style={{ animation: "moveDot 4s ease-in-out infinite", boxShadow: "0 0 10px rgba(10,10,10,0.3)" }}
      />

      {/* Subtle corner marks */}
      <div className="pointer-events-none absolute inset-0">
        {/* top-left */}
        <div className="absolute left-0 top-0 h-4 w-px bg-black/15" />
        <div className="absolute left-0 top-0 h-px w-4 bg-black/15" />
        {/* top-right */}
        <div className="absolute right-0 top-0 h-4 w-px bg-black/15" />
        <div className="absolute right-0 top-0 h-px w-4 bg-black/15" />
        {/* bottom-left */}
        <div className="absolute bottom-0 left-0 h-4 w-px bg-black/15" />
        <div className="absolute bottom-0 left-0 h-px w-4 bg-black/15" />
        {/* bottom-right */}
        <div className="absolute bottom-0 right-0 h-4 w-px bg-black/15" />
        <div className="absolute bottom-0 right-0 h-px w-4 bg-black/15" />
      </div>

      <div className="text-center">
        <p className="text-6xl font-bold tracking-tight text-[#0a0a0a] tabular-nums">{display}</p>
        <p className="mt-3 text-sm font-semibold text-[#0a0a0a]">{label}</p>
        <p className="mt-1 text-xs text-neutral-500">{sublabel}</p>
      </div>
    </div>
  );
}
