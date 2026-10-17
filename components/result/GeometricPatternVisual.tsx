'use client';

import React from 'react';

interface GeometricPatternVisualProps {
  category?: string;
  patternName?: string;
}

export function GeometricPatternVisual({ category, patternName }: GeometricPatternVisualProps) {
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square mx-auto flex items-center justify-center select-none pointer-events-none">
      {/* Background radial warmth */}
      <div className="absolute inset-0 rounded-full bg-radial from-amber-400/[0.05] via-transparent to-transparent blur-xl" />

      <svg
        className="w-full h-full text-white/[0.12]"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Reference Circles */}
        <circle cx="150" cy="150" r="130" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 4" />
        <circle cx="150" cy="150" r="95" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="150" cy="150" r="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />

        {/* Minimal Geometric Resonance Polygon */}
        <polygon
          points="150,55 232,198 68,198"
          stroke="#D4AF37"
          strokeWidth="1.25"
          fill="rgba(212, 175, 55, 0.03)"
        />

        {/* Inverted Harmonic Triad */}
        <polygon
          points="150,245 68,102 232,102"
          stroke="rgba(244, 241, 234, 0.25)"
          strokeWidth="0.75"
          strokeDasharray="2 4"
        />

        {/* Meridian Crosshairs */}
        <line x1="150" y1="20" x2="150" y2="280" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        <line x1="20" y1="150" x2="280" y2="150" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />

        {/* Golden Alignment Vertex Nodes */}
        <circle cx="150" cy="55" r="3.5" fill="#F4F1EA" stroke="#D4AF37" strokeWidth="1.5" />
        <circle cx="232" cy="198" r="3.5" fill="#F4F1EA" stroke="#D4AF37" strokeWidth="1.5" />
        <circle cx="68" cy="198" r="3.5" fill="#F4F1EA" stroke="#D4AF37" strokeWidth="1.5" />

        {/* Central Core Harmonic Point */}
        <circle cx="150" cy="150" r="2" fill="#D4AF37" />
        <circle cx="150" cy="150" r="8" stroke="#D4AF37" strokeWidth="0.5" opacity="0.6" />
      </svg>

      {/* Subtle Micro-Label */}
      <div className="absolute bottom-1 text-[10px] font-mono tracking-[0.2em] text-[#73716B] uppercase">
        {category || 'GEOMETRIC MATRIX'}
      </div>
    </div>
  );
}
