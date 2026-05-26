"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 400, damping: 35, bounce: 0 });
  const springY = useSpring(cursorY, { stiffness: 400, damping: 35, bounce: 0 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  // Use ref so event listeners always read fresh value
  const visibleRef = useRef(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a,button,[data-cursor-hover]")) setHovered(true);
      else setHovered(false);
    };
    const leave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <style>{`html, html * { cursor: none !important; }`}</style>

      {/* Dot — snaps to cursor */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-9999 h-2.5 w-2.5 rounded-full bg-[#0a0a0a]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />

      {/* Ring — spring lag */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-9998 rounded-full border border-[#0a0a0a]/40"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: visible ? 1 : 0,
          width: hovered ? 52 : 34,
          height: hovered ? 52 : 34,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      />

      {children}
    </>
  );
}
