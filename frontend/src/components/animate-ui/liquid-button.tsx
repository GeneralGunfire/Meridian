"use client";
import { motion, useAnimation } from "motion/react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ children, className, variant = "primary", onClick, ...props }, ref) => {
    const controls = useAnimation();

    const handleMouseEnter = () => {
      controls.start({
        scaleY: 1,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
      });
    };
    const handleMouseLeave = () => {
      controls.start({
        scaleY: 0,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      });
    };

    const isPrimary = variant === "primary";

    return (
      <button
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={cn(
          "relative overflow-hidden rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-200 active:scale-[0.98]",
          isPrimary
            ? "bg-[#0a0a0a] text-[#f5f0e8] ring ring-black/20 ring-offset-2 ring-offset-[#f5f0e8] hover:text-[#f5f0e8]"
            : "border border-black/15 bg-white/60 text-[#0a0a0a] hover:text-white",
          className
        )}
        {...props}
      >
        <motion.span
          aria-hidden
          initial={{ scaleY: 0 }}
          animate={controls}
          style={{ originY: "bottom" }}
          className={cn(
            "absolute inset-0 z-0",
            isPrimary ? "bg-neutral-700" : "bg-[#0a0a0a]"
          )}
        />
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);
LiquidButton.displayName = "LiquidButton";
