"use client";
import { LiquidMetal, liquidMetalPresets } from "@paper-design/shaders-react";

export function LiquidMetalBg() {
  return (
    <LiquidMetal
      {...liquidMetalPresets[2]}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity: 0.08,
        pointerEvents: "none",
      }}
    />
  );
}
