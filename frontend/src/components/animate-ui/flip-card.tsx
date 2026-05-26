"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export function FlipCard({ front, back, className }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={cn("group h-64 w-full cursor-pointer perspective-distant", className)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-2xl border border-black/8 bg-white/80 p-7 shadow-sm backdrop-blur-sm backface-hidden">
          {front}
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-2xl bg-[#0a0a0a] p-7 backface-hidden transform-[rotateY(180deg)]">
          {back}
        </div>
      </motion.div>
    </div>
  );
}
