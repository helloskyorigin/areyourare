'use client';

import React, { useEffect, useRef } from 'react';

interface ConvergingFieldCanvasProps {
  isCompleted: boolean;
}

export function ConvergingFieldCanvas({ isCompleted }: ConvergingFieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const displayWidth = canvas.offsetWidth;
    const displayHeight = canvas.offsetHeight;
    const centerX = displayWidth / 2;
    const centerY = displayHeight / 2;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Generate ~60 subtle reference particles distributed across the field
    const particleCount = 55;
    const particles = Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
      const initialDist = 40 + Math.random() * (displayWidth * 0.38);
      return {
        x: centerX + Math.cos(angle) * initialDist,
        y: centerY + Math.sin(angle) * initialDist,
        originX: centerX + Math.cos(angle) * initialDist,
        originY: centerY + Math.sin(angle) * initialDist,
        angle,
        distance: initialDist,
        speed: 0.15 + Math.random() * 0.35,
        radius: Math.random() > 0.8 ? 1.5 : 1,
        opacity: 0.2 + Math.random() * 0.5,
        orbitSpeed: (Math.random() - 0.5) * 0.008,
      };
    });

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      time += 0.02;

      // Draw subtle outer coordinate rings
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, displayWidth * 0.38, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, displayWidth * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // If completed, converge all particles tightly to the center
      particles.forEach((p, idx) => {
        if (!prefersReducedMotion) {
          if (isCompleted) {
            // Rapid convergence into central node
            p.distance += (0 - p.distance) * 0.08;
            p.x += (centerX - p.x) * 0.08;
            p.y += (centerY - p.y) * 0.08;
            p.opacity = Math.max(0.1, p.opacity * 0.96);
          } else {
            // Slow orbital convergence flow
            p.angle += p.orbitSpeed;
            p.distance -= p.speed * 0.12;

            if (p.distance < 8) {
              p.distance = displayWidth * 0.38 + Math.random() * 20;
            }

            p.x = centerX + Math.cos(p.angle) * p.distance;
            p.y = centerY + Math.sin(p.angle) * p.distance;
          }
        }

        // Draw faint connecting hairlines between nearby particles
        if (idx % 2 === 0 && !isCompleted) {
          const neighbor = particles[(idx + 1) % particles.length];
          const dist = Math.hypot(p.x - neighbor.x, p.y - neighbor.y);
          if (dist < 55) {
            ctx.strokeStyle = `rgba(220, 195, 140, ${(1 - dist / 55) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(neighbor.x, neighbor.y);
            ctx.stroke();
          }
        }

        // Draw particle dot
        ctx.fillStyle = idx % 5 === 0 ? 'rgba(230, 200, 140, 0.8)' : 'rgba(244, 241, 234, 0.5)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central convergence focal point
      ctx.save();
      const pulse = Math.sin(time * 3) * 0.15 + 0.85;

      // Center subtle glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        isCompleted ? 30 : 20
      );
      glowGrad.addColorStop(
        0,
        isCompleted ? 'rgba(244, 241, 234, 0.9)' : 'rgba(220, 190, 130, 0.35)'
      );
      glowGrad.addColorStop(
        0.5,
        isCompleted ? 'rgba(212, 175, 55, 0.4)' : 'rgba(220, 190, 130, 0.08)'
      );
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, isCompleted ? 35 : 22, 0, Math.PI * 2);
      ctx.fill();

      // Core anchor node
      ctx.fillStyle = '#F4F1EA';
      ctx.beginPath();
      ctx.arc(centerX, centerY, (isCompleted ? 3.5 : 2.5) * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isCompleted]);

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-square mx-auto flex items-center justify-center">
      {/* Background radial highlight */}
      <div className="absolute inset-0 rounded-full bg-radial from-amber-400/[0.04] via-transparent to-transparent blur-xl pointer-events-none" />
      <canvas
        ref={canvasRef}
        className="w-full h-full block select-none pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
