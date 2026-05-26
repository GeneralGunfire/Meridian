"use client";
import { motion } from "motion/react";
import { NotificationList } from "@/components/animate-ui/notification-list";

export default function LatestUpdates() {
  return (
    <section className="border-t border-black/8 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="shrink-0 lg:w-80"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Live</p>
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#0a0a0a]">
              Always up<br />to date.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              Every dataset is refreshed automatically. No manual downloads, no stale numbers.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="w-full lg:flex-1"
          >
            <NotificationList />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
