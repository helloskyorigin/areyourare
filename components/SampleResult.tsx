'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

export function SampleResult() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6; // max 3deg tilt
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section ref={ref} className="w-full py-14 sm:py-18 md:py-22 relative">
      <div className="max-w-6xl w-full mx-auto px-6 sm:px-8">
        
        {/* Outer Sample Result Box with Scroll Reveal */}
        <div
          className={`relative w-full rounded-2xl md:rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0e0e11]/80 to-[#070709]/90 backdrop-blur-xl p-8 sm:p-10 md:p-14 lg:p-16 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-700 ${
            isVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-[0.98]'
          }`}
        >
          {/* Subtle gold ambient glow in top-right */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-400/[0.05] rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 flex flex-col items-start">
              {/* Subtle Premium Label */}
              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A3A099] uppercase mb-4">
                <span>SAMPLE RESULT</span>
              </div>

              {/* Large Metric */}
              <div className="font-serif text-7xl sm:text-8xl md:text-9xl text-[#F6F5F2] font-normal tracking-tight leading-none mb-6">
                0.42%
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#A3A099] leading-relaxed max-w-md mb-8">
                A pattern this unusual appeared in 0.42% of our reference population.
              </p>

              {/* CTA Button */}
              <Link
                href="/discover"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-sm sm:text-base font-medium hover:bg-white hover:shadow-[0_0_25px_rgba(244,241,234,0.35)] active:scale-[0.98] transition-all duration-200"
              >
                <span>Find My Rarity</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </Link>
            </div>

            {/* Right Sample Result Preview Card (with subtle 3D hover depth) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="relative w-full max-w-md aspect-[16/10] sm:aspect-[16/9] rounded-2xl border border-white/[0.12] bg-[#0c0c10]/95 overflow-hidden flex flex-col items-center justify-between p-6 sm:p-7 text-center shadow-[0_0_40px_-10px_rgba(212,175,55,0.14)] will-change-transform"
              >
                {/* Subtle cosmic / coordinate vector hairlines */}
                <div className="absolute inset-0 opacity-25 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 400 250" fill="none">
                    <circle cx="200" cy="125" r="95" stroke="#F4F1EA" strokeWidth="0.6" strokeDasharray="3 4" />
                    <circle cx="200" cy="125" r="65" stroke="#D4AF37" strokeWidth="0.8" />
                    <circle cx="200" cy="125" r="25" stroke="#F4F1EA" strokeWidth="0.5" />
                    <line x1="80" y1="125" x2="320" y2="125" stroke="#F4F1EA" strokeWidth="0.5" strokeDasharray="2 3" />
                    <line x1="200" y1="20" x2="200" y2="230" stroke="#F4F1EA" strokeWidth="0.5" strokeDasharray="2 3" />
                    <circle cx="200" cy="60" r="2.5" fill="#D4AF37" />
                    <circle cx="256" cy="160" r="2.5" fill="#F4F1EA" />
                    <circle cx="144" cy="160" r="2.5" fill="#F4F1EA" />
                  </svg>
                </div>

                {/* Card Top: Brand / Type */}
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#A3A099] uppercase font-medium">
                    MY RARITY
                  </span>
                </div>

                {/* Card Center: Clean Sample Preview */}
                <div className="relative z-10 flex flex-col items-center my-auto py-1">
                  <div className="font-serif text-3xl sm:text-4xl text-[#F6F5F2] font-semibold tracking-tight mb-1">
                    TOP 0.42%
                  </div>
                  <div className="text-xs font-mono text-amber-200/90 tracking-wider">
                    Triple Meridian Alignment
                  </div>
                </div>

                {/* Card Bottom: Explanatory Sample Subtitle */}
                <div className="relative z-10 flex items-center gap-1.5 text-[11px] sm:text-xs text-[#8E8B84]">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>A sample of what your discovery could look like.</span>
                </div>

                {/* Subtle edge highlight */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.08] pointer-events-none" />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
