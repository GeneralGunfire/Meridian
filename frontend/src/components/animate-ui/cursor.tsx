"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 400, damping: 35, bounce: 0 });
  const springY = useSpring(cursorY, { stiffness: 400, damping: 35, bounce: 0 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a,button,[data-cursor-hover]")) setHovered(true);
    };
    const out = () => setHovered(false);
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [cursorX, cursorY, visible]);

  return (
    <>
      {/* Inject cursor:none globally */}
      <style>{`* { cursor: none !important; }`}</style>

      {/* Dot — follows exactly */}
      <motion.div
        className="pointer-events-none fixed z-[9999] h-2.5 w-2.5 rounded-full bg-[#0a0a0a]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Ring — spring lag */}
      <motion.div
        className="pointer-events-none fixed z-[9998] rounded-full border border-[#0a0a0a]/50"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
        animate={{
          width: hovered ? 52 : 36,
          height: hovered ? 52 : 36,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      />

      {children}
    </>
  );
}
