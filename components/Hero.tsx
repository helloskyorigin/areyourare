'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Clock, Lock } from 'lucide-react';

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = setTimeout(() => setPrefersReducedMotion(motionQuery.matches), 0);

    const handleScroll = () => {
      if (!motionQuery.matches) {
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Compute restrained, quiet scroll-linked parallax and subtle depth scale
  const maxScroll = 600;
  const progress = Math.min(scrollY / maxScroll, 1);
  const translateY = prefersReducedMotion ? 0 : -progress * 28;
  const scale = prefersReducedMotion ? 1 : 1 - progress * 0.04;
  const opacity = prefersReducedMotion ? 1 : 1 - progress * 0.25;
  const glowOpacity = prefersReducedMotion ? 0.12 : Math.max(0.04, 0.12 - progress * 0.08);

  return (
    <section className="relative w-full pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 md:pb-20 flex items-center overflow-hidden border-b border-white/[0.02]">
      {/* Restrained background ambient aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-amber-500/[0.014] rounded-full blur-[150px]" />
        <div className="absolute top-12 right-12 w-[380px] h-[380px] bg-amber-400/[0.018] rounded-full blur-[130px]" />
      </div>

      <div className="max-w-6xl w-full mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start">
            {/* Eyebrow */}
            <div className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A3A099] uppercase mb-4 sm:mb-6 flex items-center gap-2">
              <span>A GLOBAL BIRTH-PATTERN DISCOVERY</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[66px] xl:text-[74px] font-normal tracking-tight text-[#F6F5F2] leading-[1.08] sm:leading-[1.04] text-balance mb-5 sm:mb-6">
              Find what makes your birth unusual.
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg md:text-xl text-[#A3A099] font-normal leading-relaxed max-w-lg mb-8 sm:mb-9">
              Enter your date, time and place.
              <br className="hidden sm:inline" />
              We&apos;ll search for your rarest pattern.
            </p>

            {/* Primary CTA */}
            <div className="w-full sm:w-auto mb-8 sm:mb-10">
              <Link
                href="/discover"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-base font-medium shadow-[0_0_30px_rgba(244,241,234,0.25)] hover:bg-white hover:shadow-[0_0_40px_rgba(244,241,234,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <span>Find My Rarity</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-3.5 sm:gap-x-5 text-xs sm:text-[13px] text-[#A3A099] font-normal">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#D4AF37] stroke-[2]" />
                <span>No account</span>
              </div>
              <span className="text-[#55534E]" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37] stroke-[2]" />
                <span>Takes seconds</span>
              </div>
              <span className="text-[#55534E]" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#D4AF37] stroke-[2]" />
                <span>Your data stays private</span>
              </div>
            </div>
          </div>

          {/* Right Quiet Earth Visual Anchor (~22% smaller, restrained glow, subtle parallax) */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-end relative pt-2 lg:pt-0">
            <div
              className="relative w-[190px] h-[190px] sm:w-[250px] sm:h-[250px] md:w-[310px] md:h-[310px] lg:w-[370px] lg:h-[370px] xl:w-[395px] xl:h-[395px] will-change-transform"
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity: opacity,
                transition: prefersReducedMotion ? 'none' : 'transform 0.12s ease-out, opacity 0.12s ease-out',
              }}
            >
              {/* Restrained, quiet atmospheric rim glow */}
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-amber-400/[0.04] to-amber-200/[0.12] blur-2xl transform scale-95 pointer-events-none transition-opacity duration-300"
                style={{ opacity: glowOpacity / 0.12 }}
              />

              {/* Single quiet hairline ring */}
              <div className="absolute -inset-3.5 sm:-inset-5 rounded-full border border-white/[0.03] pointer-events-none" />

              {/* Main Earth Container (No spinning animation, quiet visual anchor) */}
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_0_40px_-15px_rgba(230,195,130,0.14)] bg-gradient-to-br from-[#0a0a0c] via-[#050506] to-[#000000]">
                <img
                  src="/images/globe.jpg"
                  alt="Global night view of Earth with subtle gold city lights"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none transform scale-[1.03] opacity-90"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.classList.add('globe-fallback');
                    }
                  }}
                />

                {/* Soft vignette to blend quietly into obsidian background */}
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/[0.09] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050506]/45 via-transparent to-[#050506]/20 pointer-events-none" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
