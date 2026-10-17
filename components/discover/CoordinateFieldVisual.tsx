'use client';

import React from 'react';

export function CoordinateFieldVisual() {
  return (
    <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center select-none pointer-events-none">
      {/* Soft warm aura */}
      <div className="absolute inset-0 rounded-full bg-radial from-amber-400/[0.04] via-transparent to-transparent blur-2xl" />

      {/* Subtle Coordinate Grid Lines */}
      <svg
        className="w-full h-full text-white/[0.08]"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Orbit / Reference Ring */}
        <circle cx="150" cy="150" r="130" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />
        <circle cx="150" cy="150" r="100" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="150" cy="150" r="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
        <circle cx="150" cy="150" r="20" stroke="currentColor" strokeWidth="0.5" />

        {/* Coordinate Meridian Lines */}
        <ellipse cx="150" cy="150" rx="100" ry="40" stroke="currentColor" strokeWidth="0.5" transform="rotate(-25 150 150)" />
        <ellipse cx="150" cy="150" rx="100" ry="75" stroke="currentColor" strokeWidth="0.5" transform="rotate(-25 150 150)" />
        <ellipse cx="150" cy="150" rx="35" ry="100" stroke="currentColor" strokeWidth="0.5" transform="rotate(-25 150 150)" />
        <ellipse cx="150" cy="150" rx="70" ry="100" stroke="currentColor" strokeWidth="0.5" transform="rotate(-25 150 150)" />

        {/* Global Reference Crosshairs */}
        <line x1="150" y1="10" x2="150" y2="290" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        <line x1="10" y1="150" x2="290" y2="150" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />

        {/* Subtle reference nodes */}
        <circle cx="150" cy="150" r="2" fill="#F4F1EA" opacity="0.6" />
        <circle cx="195" cy="120" r="1.5" fill="#D4AF37" opacity="0.7" />
        <circle cx="105" cy="180" r="1.5" fill="#F4F1EA" opacity="0.4" />
        <circle cx="210" cy="175" r="1" fill="#F4F1EA" opacity="0.5" />
        <circle cx="90" cy="110" r="1" fill="#D4AF37" opacity="0.5" />
      </svg>

      {/* Micro-label for aesthetic depth */}
      <div className="absolute bottom-2 text-center text-[10px] font-mono tracking-[0.2em] text-[#73716B] uppercase">
        REF·POPULATION GRID
      </div>
    </div>
  );
}
