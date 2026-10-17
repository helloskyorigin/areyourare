'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { ConvergingFieldCanvas } from '@/components/searching/ConvergingFieldCanvas';

interface BirthData {
  date: string;
  time: string;
  place: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

const STAGES = [
  { id: '01', title: 'BUILDING YOUR BIRTH PATTERN' },
  { id: '02', title: 'CHECKING UNUSUAL COMBINATIONS' },
  { id: '03', title: 'COMPARING AGAINST THE REFERENCE POPULATION' },
  { id: '04', title: 'FINDING YOUR RARITY' },
];

export default function SearchingPage() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [isFound, setIsFound] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [hasError, setHasError] = useState(false);

  // Load real validated birth data from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('outlier_birth_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.date && parsed.time && parsed.place) {
            const timer = setTimeout(() => setBirthData(parsed), 0);
            return () => clearTimeout(timer);
          } else {
            const timer = setTimeout(() => setHasError(true), 0);
            return () => clearTimeout(timer);
          }
        } catch {
          const timer = setTimeout(() => setHasError(true), 0);
          return () => clearTimeout(timer);
        }
      } else {
        // If visited directly without session data, fallback to neutral demo state
        const timer = setTimeout(
          () =>
            setBirthData({
              date: 'CURRENT SESSION',
              time: 'BIRTH TIME',
              place: 'GLOBAL COORDINATE',
            }),
          0
        );
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Stage progression timing
  useEffect(() => {
    if (hasError) return;

    // 0.0 -> 1.2s: Stage 01
    const t1 = setTimeout(() => setCurrentStage(1), 1200);
    // 1.2 -> 2.4s: Stage 02
    const t2 = setTimeout(() => setCurrentStage(2), 2400);
    // 2.4 -> 3.8s: Stage 03
    const t3 = setTimeout(() => setCurrentStage(3), 3800);
    // 3.8 -> 5.0s: Stage 04
    const t4 = setTimeout(() => {
      setCurrentStage(4);
      setIsFound(true);
    }, 5000);
    // 5.0s+: FOUND & READY
    const t5 = setTimeout(() => {
      setIsReady(true);
    }, 5600);
    // Navigate to /result
    const t6 = setTimeout(() => {
      router.push('/result');
    }, 6600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [router, hasError]);

  if (hasError) {
    return (
      <div className="w-full min-h-[100svh] bg-[#050506] text-[#E8E6E3] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center text-red-400 mb-6">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#F6F5F2] font-normal mb-3">
          We couldn&apos;t complete the search.
        </h1>
        <p className="text-sm text-[#A3A099] mb-8 max-w-md leading-relaxed">
          Please check your birth details and try again.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-sm font-medium hover:bg-white transition-all shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100svh] bg-[#050506] text-[#E8E6E3] flex flex-col justify-between selection:bg-[#EAE6DF] selection:text-[#0A0A0B] px-6 sm:px-8 py-6 sm:py-8 relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-amber-400/[0.025] rounded-full blur-[150px] pointer-events-none" />

      {/* Screen reader live announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isReady
          ? 'Your rarity is ready. Navigating to results.'
          : isFound
          ? 'Pattern found.'
          : `Stage: ${STAGES[Math.min(currentStage, 3)].title}`}
      </div>

      {/* Top Header: Brand Lockup */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 z-10">
        <Link
          href="/"
          className="flex items-center gap-3 text-[#F4F1EA] tracking-[0.28em] text-xs sm:text-sm font-semibold select-none group"
        >
          <div className="relative flex items-center justify-center w-4 h-4">
            <span className="w-4 h-4 rounded-full border border-[#F4F1EA]/80 group-hover:border-white transition-colors" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-[#F4F1EA]" />
          </div>
          <span className="font-sans font-medium tracking-[0.3em]">AREYOURARE</span>
        </Link>

        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-[#73716B] hover:text-[#A3A099] transition-colors py-1 px-3 rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </Link>
      </header>

      {/* Center Discovery Processing Block */}
      <main className="max-w-xl w-full mx-auto my-auto py-6 sm:py-10 text-center z-10 flex flex-col items-center">
        
        {/* Eyebrow */}
        <div className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A3A099] uppercase mb-2 sm:mb-3">
          ANALYZING YOUR BIRTH PATTERN
        </div>

        {/* Large Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#F6F5F2] font-normal tracking-tight mb-5 sm:mb-6">
          Finding your rarity.
        </h1>

        {/* Central Orbital / Data Visualization */}
        <div className="mb-6 sm:mb-8 w-full max-w-[280px] sm:max-w-[340px]">
          <ConvergingFieldCanvas isCompleted={isFound} />
        </div>

        {/* Completion Announcement vs 4 Progress Stages */}
        <div className="w-full max-w-sm px-2">
          {isReady ? (
            <div className="py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-[11px] font-mono tracking-[0.25em] text-[#D4AF37] uppercase mb-2">
                FOUND.
              </div>
              <div className="font-serif text-2xl sm:text-3xl text-[#F6F5F2] font-normal tracking-tight">
                YOUR RARITY IS READY.
              </div>
            </div>
          ) : isFound ? (
            <div className="py-4 animate-in fade-in duration-200">
              <div className="font-serif text-2xl sm:text-3xl text-[#F6F5F2] font-normal tracking-tight animate-pulse text-[#D4AF37]">
                FOUND.
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-3.5 text-left pt-1">
              {STAGES.map((stage, idx) => {
                const isCompleted = currentStage > idx;
                const isCurrent = currentStage === idx;

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-3.5 transition-all duration-300 ${
                      isCompleted
                        ? 'text-[#8E8B84] opacity-75'
                        : isCurrent
                        ? 'text-[#F6F5F2] opacity-100'
                        : 'text-[#3f3f46] opacity-35'
                    }`}
                  >
                    {/* Stage Indicator Icon */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                        isCompleted
                          ? 'border-amber-200/40 bg-amber-400/[0.08]'
                          : isCurrent
                          ? 'border-amber-300/80 bg-amber-400/[0.15]'
                          : 'border-white/[0.08] bg-transparent'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 text-amber-200 stroke-[2.5]" />
                      ) : isCurrent ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_#D4AF37] animate-pulse" />
                      ) : (
                        <span className="text-[9px] font-mono text-[#55534E]">{stage.id}</span>
                      )}
                    </div>

                    {/* Stage Label */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-mono tracking-wider opacity-60">
                        {stage.id}
                      </span>
                      <span
                        className={`text-xs sm:text-[13px] tracking-wider uppercase font-medium ${
                          isCurrent
                            ? 'text-[#F6F5F2] drop-shadow-[0_0_12px_rgba(244,241,234,0.3)]'
                            : ''
                        }`}
                      >
                        {stage.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real User Birth Details Summary */}
        {birthData && !isReady && (
          <div className="mt-8 text-[11px] font-mono text-[#73716B] max-w-sm truncate">
            <span>{birthData.date}</span>
            <span className="mx-2 text-[#3f3f46]">·</span>
            <span>{birthData.time}</span>
            <span className="mx-2 text-[#3f3f46]">·</span>
            <span>{birthData.place}</span>
          </div>
        )}
      </main>

      {/* Quiet micro footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-2 text-[11px] text-[#55534E] z-10">
        Reference population matrix · Non-predictive statistical discovery
      </footer>
    </div>
  );
}
