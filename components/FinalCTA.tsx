'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

export function FinalCTA() {
  const { ref, isVisible } = useScrollReveal(0.12);

  return (
    <section ref={ref} className="w-full py-20 sm:py-28 md:py-32 relative text-center">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-amber-400/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div
        className={`max-w-4xl w-full mx-auto px-6 sm:px-8 relative z-10 flex flex-col items-center transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Eyebrow */}
        <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A3A099] uppercase mb-4">
          YOU KNOW WHEN YOU WERE BORN.
        </span>

        {/* Headline */}
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-[#F6F5F2] tracking-tight leading-[1.08] text-balance mb-8">
          Now find what makes it unusual.
        </h2>

        {/* CTA Button */}
        <div className="w-full sm:w-auto mb-8">
          <Link
            href="/discover"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-base font-medium shadow-[0_0_30px_rgba(244,241,234,0.25)] hover:bg-white hover:shadow-[0_0_40px_rgba(244,241,234,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span>Find My Rarity</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </Link>
        </div>

        {/* Supporting Microcopy */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[#A3A099] font-normal">
          <span>No account</span>
          <span className="text-[#55534E]" aria-hidden="true">·</span>
          <span>Takes seconds</span>
          <span className="text-[#55534E]" aria-hidden="true">·</span>
          <span>Your data stays private</span>
        </div>
      </div>
    </section>
  );
}
