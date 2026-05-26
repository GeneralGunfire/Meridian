"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const notifications = [
  { id: 1, title: "Crime Stats Updated", desc: "Q1 2026 SAPS data now available", time: "just now", icon: "🔴" },
  { id: 2, title: "Eskom Week 21", desc: "Load-shedding patterns scraped", time: "2 hours ago", icon: "⚡" },
  { id: 3, title: "Water Report", desc: "StatsSA GHS 2025 processed", time: "1 day ago", icon: "💧" },
];

export function NotificationList() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative w-full max-w-sm"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {notifications.map((n, i) => (
        <motion.div
          key={n.id}
          layout
          animate={{
            y: expanded ? 0 : i * -10,
            scale: expanded ? 1 : 1 - i * 0.04,
            zIndex: notifications.length - i,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 28, delay: expanded ? i * 0.05 : 0 }}
          className="relative rounded-xl border border-black/10 bg-white/80 p-4 backdrop-blur-sm shadow-sm"
          style={{ marginBottom: expanded ? 8 : i < notifications.length - 1 ? -44 : 0 }}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">{n.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#0a0a0a]">{n.title}</p>
                <span className="text-xs text-neutral-400 shrink-0">{n.time}</span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">{n.desc}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
