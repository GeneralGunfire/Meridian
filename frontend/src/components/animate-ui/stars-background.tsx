"use client";
import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  vx: number;
  vy: number;
}

export function StarsBackground({
  count = 80,
  starColor = "rgba(0,0,0,0.18)",
  className = "",
}: {
  count?: number;
  starColor?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.3 + 0.05,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }));

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX.current = e.clientX - rect.left;
      mouseY.current = e.clientY - rect.top;
    };
    canvas.addEventListener("mousemove", onMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      starsRef.current.forEach((star) => {
        const dx = mouseX.current - star.x;
        const dy = mouseY.current - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          star.vx += (dx / dist) * 0.01;
          star.vy += (dy / dist) * 0.01;
        }
        star.vx *= 0.98;
        star.vy *= 0.98;
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.globalAlpha = star.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animRef.current);
    };
  }, [count, starColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
    />
  );
}
