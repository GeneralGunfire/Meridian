"use client";

import React from "react";

/**
 * Hero background — soft animated data-grid lines.
 * Thin warm-toned horizontal rules + faint diagonal connectors on the
 * left and right thirds only. Centre stays fully clear for hero text.
 * Palette stays within the beige (#f5f0e8) scheme — no black dots.
 */
export function ParticleField() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = 0; // global time counter for slow drift

    // ── node type ──────────────────────────────────────────────────
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      ox: number; // original x (used for drift)
      oy: number;
    }

    let leftNodes: Node[] = [];
    let rightNodes: Node[] = [];

    function buildNodes() {
      leftNodes = [];
      rightNodes = [];
      const W = canvas!.width;
      const H = canvas!.height;
      const zoneW = W * 0.28; // 28% on each side
      const cols = 4;
      const rows = 6;

      function makeGrid(xMin: number, xMax: number): Node[] {
        const nodes: Node[] = [];
        const cw = (xMax - xMin) / (cols - 1);
        const rh = H / (rows - 1);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            // jitter so it doesn't look mechanical
            const jx = (Math.random() - 0.5) * cw * 0.45;
            const jy = (Math.random() - 0.5) * rh * 0.45;
            const x = xMin + c * cw + jx;
            const y = r * rh + jy;
            nodes.push({
              x, y,
              ox: x, oy: y,
              vx: (Math.random() - 0.5) * 0.012,
              vy: (Math.random() - 0.5) * 0.012,
            });
          }
        }
        return nodes;
      }

      leftNodes = makeGrid(0, zoneW);
      rightNodes = makeGrid(W - zoneW, W);
    }

    const resize = () => {
      canvas!.width = window.innerWidth;
      canvas!.height = canvas!.parentElement?.offsetHeight ?? window.innerHeight;
      buildNodes();
    };
    window.addEventListener("resize", resize);
    resize();

    // ── helpers ────────────────────────────────────────────────────
    function driftNode(n: Node, boundary: { xMin: number; xMax: number }) {
      // slow sinusoidal drift around origin
      n.x = n.ox + Math.sin(t * n.vx * 60 + n.oy) * 18;
      n.y = n.oy + Math.cos(t * n.vy * 60 + n.ox) * 12;
      // clamp to zone
      n.x = Math.max(boundary.xMin, Math.min(boundary.xMax, n.x));
    }

    /** Fade multiplier based on distance from inner edge of zone */
    function edgeFade(x: number, xInner: number, isLeft: boolean): number {
      const dist = isLeft ? xInner - x : x - xInner;
      return Math.min(1, Math.max(0, dist / (canvas!.width * 0.10)));
    }

    function drawNodes(nodes: Node[], xMin: number, xMax: number, isLeft: boolean) {
      const xInner = isLeft ? xMax : xMin;

      // Draw connecting lines between nearby nodes
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const dx = nodes[a].x - nodes[b].x;
          const dy = nodes[a].y - nodes[b].y;
          const distSq = dx * dx + dy * dy;
          const maxDist = canvas!.width * 0.13;
          if (distSq > maxDist * maxDist) continue;

          const proximity = 1 - Math.sqrt(distSq) / maxDist;
          const fadeA = edgeFade(nodes[a].x, xInner, isLeft);
          const fadeB = edgeFade(nodes[b].x, xInner, isLeft);
          const opacity = proximity * proximity * Math.min(fadeA, fadeB) * 0.22;

          ctx!.beginPath();
          ctx!.moveTo(nodes[a].x, nodes[a].y);
          ctx!.lineTo(nodes[b].x, nodes[b].y);
          ctx!.strokeStyle = `rgba(120, 90, 50, ${opacity})`;
          ctx!.lineWidth = 0.8;
          ctx!.stroke();
        }
      }

      // Draw nodes as tiny warm dots
      for (const n of nodes) {
        const fade = edgeFade(n.x, xInner, isLeft);
        const alpha = fade * 0.30;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(100, 72, 35, ${alpha})`;
        ctx!.fill();
      }
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      t += 0.003; // very slow

      ctx!.fillStyle = "#f5f0e8";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      const W = canvas!.width;
      const zoneW = W * 0.28;

      // Drift nodes
      for (const n of leftNodes) driftNode(n, { xMin: 0, xMax: zoneW });
      for (const n of rightNodes) driftNode(n, { xMin: W - zoneW, xMax: W });

      // Draw
      drawNodes(leftNodes, 0, zoneW, true);
      drawNodes(rightNodes, W - zoneW, W, false);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
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
