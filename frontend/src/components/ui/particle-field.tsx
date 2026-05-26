"use client";

import React from "react";

/**
 * Two flanking particle-constellation clusters — left edge and right edge.
 * Centre ~50% of the canvas stays clear so the hero text is unobstructed.
 * Black/dark particles with connecting lines on the beige background.
 */
export function ParticleField() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const mouse = { x: null as number | null, y: null as number | null, radius: 140 };

    // Each particle knows which "zone" (left strip or right strip) it belongs to
    // so it stays confined there and never drifts into the centre.
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      /** left: 0..zoneW   right: (W-zoneW)..W */
      zoneLeft: number;
      zoneRight: number;

      constructor(x: number, y: number, vx: number, vy: number, size: number, zoneLeft: number, zoneRight: number) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.zoneLeft = zoneLeft;
        this.zoneRight = zoneRight;
      }

      draw() {
        // Fade out near the inner edge of the zone (soft vignette)
        const distToInner = Math.min(
          this.x - this.zoneLeft,
          this.zoneRight - this.x
        );
        const alpha = Math.min(1, distToInner / 60) * 0.85;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(10, 10, 10, ${alpha})`;
        ctx!.fill();
      }

      update() {
        // Bounce within zone horizontally
        if (this.x + this.vx > this.zoneRight || this.x + this.vx < this.zoneLeft) {
          this.vx = -this.vx;
        }
        // Bounce on top/bottom
        if (this.y + this.vy > canvas!.height || this.y + this.vy < 0) {
          this.vy = -this.vy;
        }

        // Mouse repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const nx = dx / dist;
            const ny = dy / dist;
            // Push away, but clamp so it stays in zone
            const nx_ = this.x - nx * force * 5;
            const ny_ = this.y - ny * force * 5;
            if (nx_ >= this.zoneLeft && nx_ <= this.zoneRight) this.x = nx_;
            if (ny_ >= 0 && ny_ <= canvas!.height) this.y = ny_;
          }
        }

        this.x += this.vx;
        this.y += this.vy;
        this.draw();
      }
    }

    let particles: Particle[] = [];

    function init() {
      particles = [];
      const W = canvas!.width;
      const H = canvas!.height;

      // Zone width: 26% of canvas on each side
      const zoneW = W * 0.26;

      // Particle density: one per ~3500px² in each zone
      const zoneArea = zoneW * H;
      const perSide = Math.max(18, Math.floor(zoneArea / 3500));

      function spawnZone(xMin: number, xMax: number) {
        for (let i = 0; i < perSide; i++) {
          const size = Math.random() * 2.5 + 1.2; // 1.2 – 3.7 px — noticeable dots
          const x = Math.random() * (xMax - xMin) + xMin;
          const y = Math.random() * H;
          const speed = 0.18 + Math.random() * 0.22;
          const angle = Math.random() * Math.PI * 2;
          particles.push(
            new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, size, xMin, xMax)
          );
        }
      }

      spawnZone(0, zoneW);           // left cluster
      spawnZone(W - zoneW, W);       // right cluster
    }

    const resizeCanvas = () => {
      canvas!.width = window.innerWidth;
      canvas!.height = canvas!.parentElement?.offsetHeight ?? window.innerHeight;
      init();
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function connect() {
      const W = canvas!.width;
      // Only draw lines within each zone — don't cross the centre
      const zoneW = W * 0.26;
      const maxDistSq = (zoneW * 0.55) * (zoneW * 0.55); // connect within ~55% of zone width

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          // Skip if they belong to opposite zones
          if (particles[a].zoneLeft !== particles[b].zoneLeft) continue;

          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const t = 1 - distSq / maxDistSq;
            const opacity = t * t * 0.55; // quadratic falloff, max 0.55

            // Brighten lines near mouse
            let finalOpacity = opacity;
            if (mouse.x !== null && mouse.y !== null) {
              const dxm = particles[a].x - mouse.x;
              const dym = particles[a].y - mouse.y;
              if (dxm * dxm + dym * dym < mouse.radius * mouse.radius) {
                finalOpacity = Math.min(0.85, opacity * 2.2);
              }
            }

            ctx!.strokeStyle = `rgba(10, 10, 10, ${finalOpacity})`;
            ctx!.lineWidth = 0.9;
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
      ctx!.fillStyle = "#f5f0e8";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) p.update();
      connect();
    }

    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseOut = () => { mouse.x = null; mouse.y = null; };
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
