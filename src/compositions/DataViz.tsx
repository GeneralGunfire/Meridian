import { Composition } from "remotion";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useEffect, useRef } from "react";

const DataVizScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fps, durationInFrames, width, height } = useVideoConfig();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = (frameNumber: number) => {
      const progress = frameNumber / durationInFrames;

      // Clear background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      // Draw animated particles representing data points
      const particleCount = 100;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + progress * Math.PI;
        const radius = 150 + Math.sin(progress * Math.PI * 2 + i) * 50;
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;

        // Color cycling through neon colors
        const hue = (i / particleCount * 360 + progress * 120) % 360;
        ctx.fillStyle =
          hue < 120
            ? `hsl(${hue}, 100%, 60%)`
            : hue < 240
              ? `hsl(${hue}, 100%, 50%)`
              : `hsl(${hue}, 100%, 55%)`;

        const size = 2 + Math.sin(progress * Math.PI * 2 + i / 10) * 2;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }

      // Draw connecting lines (network effect)
      ctx.strokeStyle = "rgba(34, 197, 94, 0.3)";
      ctx.lineWidth = 1;
      for (let i = 0; i < particleCount; i += 5) {
        const angle1 = (i / particleCount) * Math.PI * 2 + progress * Math.PI;
        const radius1 = 150 + Math.sin(progress * Math.PI * 2 + i) * 50;
        const x1 = width / 2 + Math.cos(angle1) * radius1;
        const y1 = height / 2 + Math.sin(angle1) * radius1;

        const nextI = (i + 1) % particleCount;
        const angle2 = (nextI / particleCount) * Math.PI * 2 + progress * Math.PI;
        const radius2 = 150 + Math.sin(progress * Math.PI * 2 + nextI) * 50;
        const x2 = width / 2 + Math.cos(angle2) * radius2;
        const y2 = height / 2 + Math.sin(angle2) * radius2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw rotating geometric shapes
      const shapeRotation = progress * Math.PI * 2;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(shapeRotation);

      // Outer hexagon
      ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 200;
        const y = Math.sin(angle) * 200;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner triangle (counter-rotating)
      ctx.rotate(-shapeRotation * 2);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.5)";
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const x = Math.cos(angle) * 100;
        const y = Math.sin(angle) * 100;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.restore();

      // Add text overlay with fade in/out
      const textAlpha = Math.sin(progress * Math.PI) * 0.8;
      ctx.fillStyle = `rgba(248, 250, 252, ${textAlpha})`;
      ctx.font = "bold 48px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Meridian Data", width / 2, height / 2 + 250);
      ctx.font = "24px system-ui";
      ctx.fillStyle = `rgba(100, 255, 200, ${textAlpha})`;
      ctx.fillText("South African Data at a Glance", width / 2, height / 2 + 300);
    };

    animate(0);
  }, [durationInFrames, width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "block" }}
      />
    </AbsoluteFill>
  );
};

export const DataVizComposition = () => {
  return (
    <Composition
      id="DataViz"
      component={DataVizScene}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
