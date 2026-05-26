"use client"

import { motion, useAnimationFrame, useMotionValue, useTransform } from "motion/react"
import { useRef } from "react"

const items = [
  "Crime Statistics",
  "Eskom Load-Shedding",
  "Water Access",
  "Housing Data",
  "Weekly Refresh",
  "Open Source",
  "CSV + Excel",
  "Power BI Ready",
  "100% Free",
  "South Africa",
]

function MarqueeTrack({ reversed = false }: { reversed?: boolean }) {
  const baseX = useMotionValue(0)
  const velocity = reversed ? 30 : -30

  useAnimationFrame((_, delta) => {
    baseX.set(baseX.get() + velocity * (delta / 1000))
  })

  const x = useTransform(baseX, (v) => {
    const range = 100
    const wrapped = ((v % range) + range) % range
    return reversed ? `-${wrapped}%` : `-${wrapped}%`
  })

  const repeated = [...items, ...items, ...items, ...items]

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-0 whitespace-nowrap"
        style={{ x }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 px-6 text-sm font-medium uppercase tracking-widest text-[#0a0a0a]/60 shrink-0"
          >
            <span className="h-1 w-1 rounded-full bg-[#0a0a0a]/30 shrink-0" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function DataTicker() {
  return (
    <section className="relative border-b border-black/10 bg-[#f5f0e8] py-4 overflow-hidden select-none">
      <MarqueeTrack />
    </section>
  )
}
