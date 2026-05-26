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
      className={cn("group h-52 w-full cursor-pointer [perspective:1000px]", className)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-xl border border-black/10 bg-white/70 p-6 backdrop-blur-sm [backface-visibility:hidden]">
          {front}
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-xl border border-black/10 bg-[#0a0a0a] p-6 text-[#f5f0e8] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </motion.div>
    </div>
  );
}
