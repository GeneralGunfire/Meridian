"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

interface ScrollReveal3DProps {
  children: React.ReactNode;
  /** "up" = slide + rotate in from below (default). "down" = from above. */
  direction?: "up" | "down";
  className?: string;
}

/**
 * Wraps a section with a MacBook-style 3D depth scroll animation:
 * - Enters with a slight Y translate + rotateX (perspective tilt)
 * - Settles flat when centred in view
 * - Reverses when scrolling back up
 */
export function ScrollReveal3D({
  children,
  direction = "up",
  className,
}: ScrollReveal3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Scroll progress 0 = just entered viewport (bottom), 0.5 = centred, 1 = exiting top
  // We want the 3D effect on enter (0→0.35) and on exit (0.65→1)

  const yRaw = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    direction === "up"
      ? [60, 0, 0, -40]
      : [-60, 0, 0, 40]
  );
  const rotateRaw = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    direction === "up"
      ? [6, 0, 0, -4]
      : [-6, 0, 0, 4]
  );
  const scaleRaw = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.94, 1, 1, 0.96]
  );
  const opacityRaw = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0]
  );

  const y = useSpring(yRaw, { stiffness: 80, damping: 22, bounce: 0 });
  const rotateX = useSpring(rotateRaw, { stiffness: 80, damping: 22, bounce: 0 });
  const scale = useSpring(scaleRaw, { stiffness: 80, damping: 22, bounce: 0 });

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        style={{ y, rotateX, scale, opacity: opacityRaw, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
