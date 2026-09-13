"use client";

import { useEffect, useRef } from "react";

export default function SpiderWebBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawWeb = (cx: number, cy: number, radius: number, rotation: number, opacity: number, color: string) => {
      const spokes = 18;
      const rings = 10;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Radial spokes
      for (let i = 0; i < spokes; i++) {
        const angle = (i / spokes) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const endX = Math.cos(angle) * radius;
        const endY = Math.sin(angle) * radius;
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Concentric rings with wobble
      for (let r = 1; r <= rings; r++) {
        const ringRadius = (r / rings) * radius;
        ctx.beginPath();
        for (let i = 0; i <= spokes; i++) {
          const angle = (i / spokes) * Math.PI * 2;
          const wobble = Math.sin(angle * 4 + time * 0.8 + r * 0.5) * (ringRadius * 0.04);
          const x = Math.cos(angle) * (ringRadius + wobble);
          const y = Math.sin(angle) * (ringRadius + wobble);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      ctx.restore();
    };

    const draw = () => {
      time += 0.006;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = Math.max(canvas.width, canvas.height) * 0.75;

      // Main web — red, slow rotation
      drawWeb(cx, cy, maxR, time * 0.08, 0.5, "rgba(220, 38, 38, 0.18)");

      // Secondary web — darker red, counter-rotate
      drawWeb(
        cx + Math.sin(time * 0.3) * 40,
        cy + Math.cos(time * 0.2) * 30,
        maxR * 0.55,
        -time * 0.12,
        0.3,
        "rgba(185, 28, 28, 0.14)"
      );

      // Third web — faint blue accent
      drawWeb(
        cx + Math.cos(time * 0.4) * 25,
        cy + Math.sin(time * 0.35) * 20,
        maxR * 0.35,
        time * 0.18,
        0.15,
        "rgba(59, 130, 246, 0.1)"
      );

      // Red center glow
      const pulseR = 120 + Math.sin(time * 1.5) * 30;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
      grad.addColorStop(0, "rgba(220, 38, 38, 0.12)");
      grad.addColorStop(0.4, "rgba(185, 28, 28, 0.05)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer ambient glow
      const outerGrad = ctx.createRadialGradient(cx, cy, maxR * 0.3, cx, cy, maxR);
      outerGrad.addColorStop(0, "transparent");
      outerGrad.addColorStop(0.7, "rgba(220, 38, 38, 0.02)");
      outerGrad.addColorStop(1, "transparent");
      ctx.fillStyle = outerGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating nodes on web — red glow
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + time * 0.15;
        const dist = 120 + Math.sin(time * 0.7 + i * 1.2) * 100;
        const nx = cx + Math.cos(angle) * dist;
        const ny = cy + Math.sin(angle) * dist;
        const nodeR = 1.5 + Math.sin(time * 2 + i) * 0.8;

        ctx.beginPath();
        ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(time + i) * 0.2})`;
        ctx.fill();

        // Glow halo
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nodeR * 6);
        ng.addColorStop(0, "rgba(220, 38, 38, 0.12)");
        ng.addColorStop(1, "transparent");
        ctx.fillStyle = ng;
        ctx.fillRect(nx - nodeR * 6, ny - nodeR * 6, nodeR * 12, nodeR * 12);
      }

      // Spider silk threads between random nodes
      ctx.globalAlpha = 0.06;
      for (let i = 0; i < 8; i++) {
        const a1 = (i / 8) * Math.PI * 2 + time * 0.1;
        const a2 = ((i + 3) / 8) * Math.PI * 2 + time * 0.1;
        const d1 = 100 + Math.sin(time + i) * 60;
        const d2 = 150 + Math.cos(time + i) * 50;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a1) * d1, cy + Math.sin(a1) * d1);
        ctx.quadraticCurveTo(
          cx + Math.cos((a1 + a2) / 2) * 80,
          cy + Math.sin((a1 + a2) / 2) * 80,
          cx + Math.cos(a2) * d2,
          cy + Math.sin(a2) * d2
        );
        ctx.strokeStyle = "rgba(220, 38, 38, 0.3)";
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
