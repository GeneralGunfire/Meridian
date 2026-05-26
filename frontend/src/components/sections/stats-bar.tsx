"use client"

import { useRef } from "react"
import { useInView } from "motion/react"
import NumberTicker from "@/components/fancy/basic-number-ticker"

const stats = [
  { label: "Datasets", value: 4, suffix: "" },
  { label: "Weekly Updates", value: 52, suffix: "+" },
  { label: "Free Forever", value: 100, suffix: "%" },
  { label: "Open Source", value: 1, suffix: "" },
]

function StatItem({
  value,
  label,
  suffix,
}: {
  value: number
  label: string
  suffix: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1 px-8 py-6 first:border-l-0"
    >
      <p className="text-4xl font-bold tracking-tight text-[#0a0a0a] tabular-nums sm:text-5xl">
        {inView ? (
          <NumberTicker
            from={0}
            target={value}
            duration={1.8}
            autoStart={true}
          />
        ) : (
          <span>0</span>
        )}
        <span>{suffix}</span>
      </p>
      <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">
        {label}
      </p>
    </div>
  )
}

export default function StatsBar() {
  return (
    <section className="relative border-y border-black/10 bg-[#f5f0e8] overflow-hidden">
      {/* Subtle rule lines */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 divide-x divide-black/10 sm:grid-cols-4">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
