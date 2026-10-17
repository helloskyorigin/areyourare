'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Link2, MessageCircle, Instagram, Download, Check, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

export function ShareSection() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1500);
  };

  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setCardTilt({ x, y });
  };

  const handleCardLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  return (
    <section ref={ref} className="w-full py-16 sm:py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-6xl w-full mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8 items-center">
          
          {/* Left Copy & Action Icons */}
          <div
            className={`lg:col-span-6 flex flex-col items-start transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A3A099] uppercase mb-4">
              A RESULT WORTH SHARING
            </span>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-[#F6F5F2] tracking-tight leading-[1.08] mb-5">
              Found something unusual?
            </h2>

            <p className="text-base sm:text-lg text-[#A3A099] leading-relaxed max-w-md mb-8 sm:mb-9">
              Get a clean share card and let your friends find their rarity too.
            </p>

            {/* Social / Action Icon Buttons */}
            <div className="flex items-center gap-3">
              {/* Copy Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="relative w-11 h-11 rounded-full border border-white/[0.12] bg-[#0c0c0e] hover:bg-[#18181c] hover:border-white/30 text-[#E8E6E3] flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-200/50 group cursor-pointer"
                aria-label="Copy share link"
                title="Copy share link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-amber-300" />
                ) : (
                  <Link2 className="w-4 h-4 stroke-[1.8]" />
                )}
                {copied && (
                  <span className="absolute -top-8 px-2 py-0.5 bg-white text-black text-[10px] rounded font-medium whitespace-nowrap animate-in fade-in">
                    Copied!
                  </span>
                )}
              </button>

              {/* WhatsApp */}
              <a
                href="https://api.whatsapp.com/send?text=Find%20what%20makes%20your%20birth%20unusual%20with%20AREYOURARE"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-white/[0.12] bg-[#0c0c0e] hover:bg-[#18181c] hover:border-white/30 text-[#E8E6E3] flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-200/50"
                aria-label="Share on WhatsApp"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 stroke-[1.8]" />
              </a>

              {/* Instagram */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-11 h-11 rounded-full border border-white/[0.12] bg-[#0c0c0e] hover:bg-[#18181c] hover:border-white/30 text-[#E8E6E3] flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-200/50 cursor-pointer"
                aria-label="Share on Instagram Stories"
                title="Share on Instagram"
              >
                <Instagram className="w-4 h-4 stroke-[1.8]" />
              </button>

              {/* X / Twitter */}
              <a
                href="https://twitter.com/intent/tweet?text=Find%20what%20makes%20your%20birth%20unusual%20with%20AREYOURARE"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-white/[0.12] bg-[#0c0c0e] hover:bg-[#18181c] hover:border-white/30 text-[#E8E6E3] flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-200/50"
                aria-label="Share on X"
                title="Share on X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Download */}
              <button
                type="button"
                onClick={handleDownload}
                className="w-11 h-11 rounded-full border border-white/[0.12] bg-[#0c0c0e] hover:bg-[#18181c] hover:border-white/30 text-[#E8E6E3] flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-200/50 cursor-pointer"
                aria-label="Download Share Card"
                title="Download share card"
              >
                {downloading ? (
                  <Check className="w-4 h-4 text-amber-300" />
                ) : (
                  <Download className="w-4 h-4 stroke-[1.8]" />
                )}
              </button>
            </div>
          </div>

          {/* Right Tilted OUTLIER Share Card Preview with 3D Parallax */}
          <div
            className={`lg:col-span-6 flex justify-center lg:justify-end transition-all duration-700 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div
              onMouseMove={handleCardMove}
              onMouseLeave={handleCardLeave}
              className="relative group w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px]"
            >
              {/* Outer Golden Aura Glow */}
              <div className="absolute -inset-6 bg-gradient-to-tr from-amber-500/[0.12] via-yellow-200/[0.08] to-transparent rounded-3xl blur-2xl pointer-events-none transform -rotate-3 group-hover:scale-105 transition-transform duration-500" />
              
              {/* Subtle ambient star sparkles around the card */}
              <div className="absolute -top-3 -right-3 w-1.5 h-1.5 rounded-full bg-amber-200/80 blur-[0.5px] animate-pulse" />
              <div className="absolute -bottom-2 -left-2 w-1 h-1 rounded-full bg-amber-300/60 blur-[0.5px]" />
              <div className="absolute top-1/2 -left-5 w-1 h-1 rounded-full bg-white/40" />

              {/* 3D Tilted Card Container */}
              <div
                style={{
                  transform: `perspective(1000px) rotateX(${cardTilt.y}deg) rotateY(${cardTilt.x - 4}deg)`,
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="relative w-full aspect-[4/5] rounded-2xl border border-white/[0.18] bg-gradient-to-b from-[#151518]/95 via-[#0e0e11]/95 to-[#070709]/95 p-7 sm:p-8 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] backdrop-blur-md will-change-transform"
              >
                {/* Internal card background texture */}
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />

                {/* Card Top: Brand */}
                <div className="relative z-10 flex items-center justify-center gap-2 pt-2">
                  <div className="relative flex items-center justify-center w-3.5 h-3.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-[#F4F1EA]/80" />
                    <span className="absolute w-1.5 h-1.5 rounded-full bg-[#F4F1EA]" />
                  </div>
                  <span className="text-[11px] font-sans font-medium tracking-[0.3em] text-[#F4F1EA]">
                    AREYOURARE
                  </span>
                </div>

                {/* Card Center: Subtitle + Rarity Metric */}
                <div className="relative z-10 flex flex-col items-center text-center my-auto py-4">
                  <span className="text-[10px] tracking-[0.25em] text-[#A3A099] uppercase font-medium mb-3">
                    MY RARITY
                  </span>
                  
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="font-serif italic text-2xl sm:text-3xl text-[#E8E6E3] font-normal tracking-wide">
                      TOP
                    </span>
                    <span className="font-serif text-5xl sm:text-6xl text-[#F6F5F2] font-semibold tracking-tight">
                      0.42%
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Find yours CTA link */}
                <div className="relative z-10 flex justify-center pb-2">
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#E8E6E3] hover:text-white transition-colors group/link"
                  >
                    <span>Find yours.</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Hairline highlight border */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.12] pointer-events-none" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
