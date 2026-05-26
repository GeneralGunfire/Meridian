"use client";

import React from "react";

/**
 * Particle field background — adapted from AetherFlow to match Meridian's
 * beige (#f5f0e8) colour scheme. Warm amber/gold particles with connecting
 * lines, mouse-repulsion on hover. Pure canvas, no external deps.
 */
export function ParticleField() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const mouse = { x: null as number | null, y: null as number | null, radius: 160 };

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor(
        x: number,
        y: number,
        directionX: number,
        directionY: number,
        size: number,
        color: string
      ) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx!.fillStyle = this.color;
        ctx!.fill();
      }

      update() {
        if (this.x > canvas!.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas!.height || this.y < 0) this.directionY = -this.directionY;

        // Mouse repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius + this.size) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 4;
            this.y -= (dy / distance) * force * 4;
          }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    let particles: Particle[] = [];

    const PARTICLE_COLORS = [
      "rgba(160, 120, 70, 0.75)",  // warm brown
      "rgba(180, 140, 85, 0.65)",  // amber
      "rgba(140, 100, 55, 0.60)",  // dark amber
      "rgba(200, 165, 110, 0.55)", // light gold
    ];

    function init() {
      particles = [];
      const count = Math.floor((canvas!.height * canvas!.width) / 10000);
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 1.8 + 0.6;
        const x = Math.random() * (canvas!.width - size * 4) + size * 2;
        const y = Math.random() * (canvas!.height - size * 4) + size * 2;
        const dirX = (Math.random() * 0.35) - 0.175;
        const dirY = (Math.random() * 0.35) - 0.175;
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        particles.push(new Particle(x, y, dirX, dirY, size, color));
      }
    }

    const resizeCanvas = () => {
      canvas!.width = window.innerWidth;
      canvas!.height = canvas!.parentElement?.offsetHeight ?? window.innerHeight;
      init();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function connect() {
      const thresholdSq = (canvas!.width / 7) * (canvas!.height / 7);
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < thresholdSq) {
            const opacity = Math.max(0, 1 - distSq / 22000) * 0.45;

            // Lines near mouse get a warmer, slightly brighter tone
            let lineColor = `rgba(150, 110, 65, ${opacity})`;
            if (mouse.x !== null && mouse.y !== null) {
              const dxm = particles[a].x - mouse.x;
              const dym = particles[a].y - mouse.y;
              if (Math.sqrt(dxm * dxm + dym * dym) < mouse.radius) {
                lineColor = `rgba(200, 155, 90, ${opacity * 1.6})`;
              }
            }

            ctx!.strokeStyle = lineColor;
            ctx!.lineWidth = 0.8;
            ctx!.beginPath();
            ctx!.moveTo(particles[a].x, particles[a].y);
            ctx!.lineTo(particles[b].x, particles[b].y);
            ctx!.stroke();
          }
        }
      }
    }

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      // Clear with the beige background colour
      ctx!.fillStyle = "#f5f0e8";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) p.update();
      connect();
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
