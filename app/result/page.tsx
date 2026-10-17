'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { calculateBirthChart } from '@/lib/astronomy/engine';
import { evaluatePatterns } from '@/lib/patterns/evaluator';
import { calculateUserRarity } from '@/lib/rarity/engine';
import { buildVerifiedResult } from '@/lib/result/builder';
import { createFallbackExplanation, formatMeasuredEvidenceText } from '@/lib/explanation/service';
import { DiscoverResponse } from '@/lib/types/birth-input';
import { CanonicalVerifiedResult } from '@/lib/types/result';
import { RarityCountUp } from '@/components/result/RarityCountUp';
import { GeometricPatternVisual } from '@/components/result/GeometricPatternVisual';
import { ShareCardPreview } from '@/components/result/ShareCardPreview';
import { AdSlot } from '@/components/ads/AdSlot';

export default function ResultPage() {
  const [sessionResponse, setSessionResponse] = useState<DiscoverResponse | null>(null);
  const [storedBirthData, setStoredBirthData] = useState<{
    date?: string;
    isoDate?: string;
    time?: string;
    isoTime?: string;
    place?: string;
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    discoveryId?: string;
    calculation_mode?: 'FULL_TIME' | 'DATE_ONLY';
  } | null>(null);

  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Load session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const respRaw = sessionStorage.getItem('outlier_discovery_response');
      if (respRaw) {
        try {
          const parsed = JSON.parse(respRaw) as DiscoverResponse;
          if (parsed && parsed.result && parsed.chart) {
            const timer = setTimeout(() => {
              setSessionResponse(parsed);
              setHasCheckedSession(true);
            }, 0);
            return () => clearTimeout(timer);
          }
        } catch {
          // ignore
        }
      }

      const birthRaw = sessionStorage.getItem('outlier_birth_data');
      if (birthRaw) {
        try {
          const parsed = JSON.parse(birthRaw);
          if (parsed && parsed.date && parsed.time && parsed.place) {
            const timer = setTimeout(() => {
              setStoredBirthData(parsed);
              setHasCheckedSession(true);
            }, 0);
            return () => clearTimeout(timer);
          }
        } catch {
          // ignore
        }
      }

      const timer = setTimeout(() => setHasCheckedSession(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Canonical verified result (Phase 5 truth object, supporting both MATCHED_PATTERN and CONTINUOUS_FEATURE)
  const canonicalResult: CanonicalVerifiedResult | null = useMemo(() => {
    if (sessionResponse?.result) {
      return sessionResponse.result;
    }

    // If sessionResponse had an older structure without continuous fallback, recompute deterministically from chart
    if (sessionResponse?.chart) {
      try {
        const isDateOnly = sessionResponse.result?.calculation_mode === 'DATE_ONLY';
        const patterns = evaluatePatterns(sessionResponse.chart);
        const rarity = calculateUserRarity(patterns, undefined, isDateOnly ? 'DATE_ONLY' : 'FULL_TIME');
        const explanation = rarity.rarestPattern
          ? createFallbackExplanation({
              discoveryType: 'MATCHED_PATTERN',
              patternId: rarity.rarestPattern.patternId,
              patternName: rarity.rarestPattern.patternName,
              patternDescription: rarity.rarestPattern.description,
              category: rarity.rarestPattern.category,
              frequencyPercent: rarity.rarestPattern.frequencyPercent,
              referenceSampleSize: rarity.rarestPattern.validSampleSize,
              evidence: rarity.rarestPattern.evidence,
            })
          : rarity.bestContinuousFeature
          ? createFallbackExplanation({
              discoveryType: 'CONTINUOUS_FEATURE',
              patternId: rarity.bestContinuousFeature.featureId,
              patternName: rarity.bestContinuousFeature.featureName,
              patternDescription: rarity.bestContinuousFeature.description,
              category: rarity.bestContinuousFeature.category,
              frequencyPercent: rarity.bestContinuousFeature.referencePercentile,
              referenceSampleSize: rarity.bestContinuousFeature.validSampleSize,
              evidence: rarity.bestContinuousFeature.evidence,
            })
          : null;

        return buildVerifiedResult({
          discoveryId: sessionResponse.discoveryId || 'disc_recomputed',
          chart: sessionResponse.chart,
          patterns,
          rarity,
          explanation,
          calculation_mode: isDateOnly ? 'DATE_ONLY' : 'FULL_TIME',
        });
      } catch {
        // continue to storedBirthData fallback
      }
    }

    if (
      storedBirthData &&
      storedBirthData.isoDate &&
      storedBirthData.latitude !== undefined &&
      storedBirthData.longitude !== undefined &&
      storedBirthData.timezone
    ) {
      try {
        const isDateOnly = storedBirthData.calculation_mode === 'DATE_ONLY';
        const chart = calculateBirthChart({
          birthDate: storedBirthData.isoDate,
          birthTime: isDateOnly ? '' : (storedBirthData.isoTime || ''),
          location: {
            city: storedBirthData.city || storedBirthData.place || 'Unknown',
            region: storedBirthData.region,
            country: storedBirthData.country || 'Global',
            latitude: storedBirthData.latitude,
            longitude: storedBirthData.longitude,
            timezone: storedBirthData.timezone,
          },
          calculation_mode: isDateOnly ? 'DATE_ONLY' : 'FULL_TIME',
        });
        const patterns = evaluatePatterns(chart);
        const rarity = calculateUserRarity(patterns, undefined, isDateOnly ? 'DATE_ONLY' : 'FULL_TIME');
        const explanation = rarity.rarestPattern
          ? createFallbackExplanation({
              discoveryType: 'MATCHED_PATTERN',
              patternId: rarity.rarestPattern.patternId,
              patternName: rarity.rarestPattern.patternName,
              patternDescription: rarity.rarestPattern.description,
              category: rarity.rarestPattern.category,
              frequencyPercent: rarity.rarestPattern.frequencyPercent,
              referenceSampleSize: rarity.rarestPattern.validSampleSize,
              evidence: rarity.rarestPattern.evidence,
            })
          : rarity.bestContinuousFeature
          ? createFallbackExplanation({
              discoveryType: 'CONTINUOUS_FEATURE',
              patternId: rarity.bestContinuousFeature.featureId,
              patternName: rarity.bestContinuousFeature.featureName,
              patternDescription: rarity.bestContinuousFeature.description,
              category: rarity.bestContinuousFeature.category,
              frequencyPercent: rarity.bestContinuousFeature.referencePercentile,
              referenceSampleSize: rarity.bestContinuousFeature.validSampleSize,
              evidence: rarity.bestContinuousFeature.evidence,
            })
          : null;

        return buildVerifiedResult({
          discoveryId: storedBirthData.discoveryId || 'disc_local',
          chart,
          patterns,
          rarity,
          explanation,
          calculation_mode: isDateOnly ? 'DATE_ONLY' : 'FULL_TIME',
        });
      } catch {
        return null;
      }
    }

    return null;
  }, [sessionResponse, storedBirthData]);

  // Handle Missing Session Data (when user visits /result directly without submitting birth details)
  if (
    hasCheckedSession &&
    canonicalResult?.status === 'NO_VALID_PATTERN' &&
    canonicalResult?.calculation_mode === 'DATE_ONLY'
  ) {
    return (
      <div className="w-full min-h-[100svh] bg-[#050506] text-[#E8E6E3] flex flex-col justify-between p-6 sm:p-8 selection:bg-[#EAE6DF] selection:text-[#0A0A0B]">
        <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-2.5 text-[#F4F1EA] tracking-[0.25em] text-xs sm:text-sm font-semibold">
            <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
              <span className="w-4 h-4 rounded-full border border-[#F4F1EA]/80" />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-[#F4F1EA]" />
            </div>
            <span className="font-sans font-medium tracking-[0.28em]">AREYOURARE</span>
          </Link>
        </header>

        <main className="max-w-md w-full mx-auto my-auto text-center py-12">
          <div className="w-12 h-12 rounded-full border border-white/[0.12] bg-white/[0.04] flex items-center justify-center text-amber-200 mx-auto mb-6">
            <AlertCircle className="w-5 h-5" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#F6F5F2] font-normal mb-3 leading-tight text-balance">
            We couldn&apos;t find a strong date-based discovery yet.
          </h1>
          <p className="text-sm text-[#A3A099] mb-8 leading-relaxed">
            Planetary patterns alone on this date did not exceed our strict rarity thresholds. Including your exact birth time allows us to check unique rising alignments, houses, and precise angles.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-sm font-medium hover:bg-white shadow-lg transition-all"
          >
            <span>Try again with exact birth time &rarr;</span>
          </Link>
        </main>

        <footer className="text-center text-xs text-[#55534E] py-4">
          © {new Date().getFullYear()} AREYOURARE · Statistical Discovery
        </footer>
      </div>
    );
  }

  // Handle Missing Session Data (when user visits /result directly without submitting birth details)
  if (
    hasCheckedSession &&
    (!canonicalResult || !canonicalResult.primaryPattern || !canonicalResult.rarity)
  ) {
    return (
      <div className="w-full min-h-[100svh] bg-[#050506] text-[#E8E6E3] flex flex-col justify-between p-6 sm:p-8 selection:bg-[#EAE6DF] selection:text-[#0A0A0B]">
        <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-2.5 text-[#F4F1EA] tracking-[0.25em] text-xs sm:text-sm font-semibold">
            <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
              <span className="w-4 h-4 rounded-full border border-[#F4F1EA]/80" />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-[#F4F1EA]" />
            </div>
            <span className="font-sans font-medium tracking-[0.28em]">AREYOURARE</span>
          </Link>
        </header>

        <main className="max-w-md w-full mx-auto my-auto text-center py-12">
          <div className="w-12 h-12 rounded-full border border-white/[0.12] bg-white/[0.04] flex items-center justify-center text-amber-200 mx-auto mb-6">
            <AlertCircle className="w-5 h-5" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#F6F5F2] font-normal mb-3">
            We couldn&apos;t complete your discovery.
          </h1>
          <p className="text-sm text-[#A3A099] mb-8 leading-relaxed">
            Please enter your birth date, time, and location to search for your pattern.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-sm font-medium hover:bg-white shadow-lg transition-all"
          >
            <span>Start Discovery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </main>

        <footer className="text-center text-xs text-[#55534E] py-4">
          © {new Date().getFullYear()} AREYOURARE · Statistical Discovery
        </footer>
      </div>
    );
  }

  // Loading state while checking session
  if (!canonicalResult || !canonicalResult.primaryPattern || !canonicalResult.rarity) {
    return (
      <div className="w-full min-h-[100svh] bg-[#050506] text-[#E8E6E3] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-amber-200 animate-ping" />
      </div>
    );
  }

  const {
    discoveryType = 'MATCHED_PATTERN',
    discovery,
    primaryPattern,
    rarity,
    explanation,
    otherPatterns,
    rarityProfile,
    sharePayload,
  } = canonicalResult;

  const isContinuousFeature = discoveryType === 'CONTINUOUS_FEATURE';
  const formattedWhatWeFound = formatMeasuredEvidenceText(primaryPattern.evidence, primaryPattern.description);

  // Build active rarity profile columns only when 2+ items exist (never show empty '—' placeholders)
  const activeProfileMetrics =
    otherPatterns.length > 0
      ? [
          { label: isContinuousFeature ? 'STRONGEST' : 'RAREST', value: rarityProfile.rarest, highlight: true },
          ...(rarityProfile.second && rarityProfile.second !== '—'
            ? [{ label: 'SECOND', value: rarityProfile.second, highlight: false }]
            : []),
          ...(rarityProfile.third && rarityProfile.third !== '—'
            ? [{ label: 'THIRD', value: rarityProfile.third, highlight: false }]
            : []),
        ]
      : [];

  return (
    <div className="w-full min-h-[100svh] bg-[#050506] text-[#E8E6E3] flex flex-col justify-between selection:bg-[#EAE6DF] selection:text-[#0A0A0B] relative overflow-x-hidden">
      {/* Ambient warm gold aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-amber-400/[0.025] rounded-full blur-[150px] pointer-events-none" />

      {/* Top Navigation (Responsive, zero overflow on mobile) */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#050506]/85 backdrop-blur-md border-b border-white/[0.06] py-3.5 sm:py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#F4F1EA] text-xs sm:text-sm font-semibold group focus:outline-none shrink-0"
          >
            <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
              <span className="w-4 h-4 rounded-full border border-[#F4F1EA]/80 group-hover:border-[#F4F1EA] transition-colors" />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-[#F4F1EA]" />
            </div>
            <span className="font-sans font-medium tracking-[0.24em] sm:tracking-[0.3em]">AREYOURARE</span>
          </Link>

          <Link
            href="/discover"
            className="shrink-0 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs text-[#A3A099] hover:text-[#F4F1EA] hover:bg-white/[0.04] transition-colors"
          >
            <span>Start another</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.8] shrink-0" />
          </Link>
        </div>
      </header>

      {/* Main Content Stream (Compact, intentional vertical rhythm) */}
      <main className="max-w-4xl mx-auto w-full px-5 sm:px-8 pt-28 sm:pt-32 pb-20 space-y-12 sm:space-y-16 z-10">
        
        {/* ================================================== */}
        {/* 1. RESULT HERO & PRIMARY HIERARCHY */}
        {/* ================================================== */}
        <section className="text-center pt-2 sm:pt-4 flex flex-col items-center">
          {/* Eyebrow */}
          <div className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A3A099] uppercase mb-3 animate-in fade-in duration-500">
            {canonicalResult?.calculation_mode === 'DATE_ONLY' ? 'DATE-ONLY DISCOVERY' : 'YOUR GLOBAL DISCOVERY'}
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#F6F5F2] font-normal tracking-tight mb-5 animate-in fade-in duration-700">
            {canonicalResult?.calculation_mode === 'DATE_ONLY' ? 'We found your date-based pattern.' : isContinuousFeature ? 'We found your most unusual alignment.' : 'We found your rarity.'}
          </h1>

          {/* Enormous Rarity / Benchmark Number */}
          <div className="font-serif text-7xl sm:text-8xl md:text-9xl text-[#F6F5F2] font-normal tracking-tight leading-none mb-4 drop-shadow-[0_0_40px_rgba(244,241,234,0.12)]">
            <RarityCountUp target={rarity.frequencyPercent} />
          </div>

          {/* Supporting Safe Reference Population Text */}
          <p className="text-base sm:text-lg text-[#A3A099] max-w-lg leading-relaxed">
            {canonicalResult?.calculation_mode === 'DATE_ONLY' ? (
              <>
                This pattern appears in{' '}
                <span className="text-[#F6F5F2] font-medium">{rarity.formattedPercent}</span> of our reference population based on your birth date.
              </>
            ) : isContinuousFeature ? (
              <>
                An alignment this close occurs in{' '}
                <span className="text-[#F6F5F2] font-medium">{rarity.formattedPercent}</span> of our reference population.
              </>
            ) : (
              <>
                This pattern appears in{' '}
                <span className="text-[#F6F5F2] font-medium">{rarity.formattedPercent}</span> of our reference population.
              </>
            )}
          </p>
        </section>


        {/* ================================================== */}
        {/* 2. PRIMARY DISCOVERY CARD (MATCHED_PATTERN OR CONTINUOUS_FEATURE) */}
        {/* ================================================== */}
        <section className="relative rounded-2xl md:rounded-3xl border border-white/[0.1] bg-gradient-to-b from-[#111115]/90 via-[#0c0c0f]/90 to-[#070709]/95 p-7 sm:p-10 md:p-12 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
          
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/[0.03] rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
            {/* Left Copy */}
            <div className="md:col-span-7 flex flex-col items-start w-full">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#D4AF37] uppercase mb-2.5 font-semibold">
                {isContinuousFeature ? 'YOUR MOST UNUSUAL ALIGNMENT' : 'YOUR STRONGEST DISCOVERY'}
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl text-[#F6F5F2] font-normal tracking-tight mb-4">
                {primaryPattern.name}
              </h2>

              <p className="text-sm sm:text-base text-[#A3A099] leading-relaxed mb-6">
                {primaryPattern.description}
              </p>

              {/* Native WHY IT STANDS OUT block */}
              <div className="w-full border-t border-white/[0.08] pt-5 mt-1 mb-6 text-left">
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#D4AF37] uppercase mb-2 font-semibold block">
                  WHY IT STANDS OUT
                </span>
                <p className="text-sm sm:text-base text-[#E8E6E3] leading-relaxed font-normal">
                  {explanation?.evidenceExplanation || formattedWhatWeFound}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-[#E8E6E3] font-mono">
                  <span>Category:</span>
                  <span className="text-amber-200 font-semibold uppercase">{primaryPattern.category}</span>
                </div>

                {discovery?.type === 'CONTINUOUS_FEATURE' && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-[#E8E6E3] font-mono">
                    <span>Deviation:</span>
                    <span className="text-amber-200 font-semibold">{discovery.measurement.formattedDistance}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Abstract Visual */}
            <div className="md:col-span-5 flex justify-center">
              <GeometricPatternVisual
                category={primaryPattern.category}
                patternName={primaryPattern.name}
              />
            </div>
          </div>
        </section>

        {/* Approved Result Ad #1: After main discovery card and before detailed explanation */}
        <AdSlot placement="result_after_primary_card" className="my-2 px-0" />


        {/* ================================================== */}
        {/* 3. WHY IT STANDS OUT (CONCISE & SCANNABLE) */}
        {/* ================================================== */}
        <section className="border-t border-white/[0.06] pt-10 sm:pt-12">
          <div className="max-w-2xl space-y-5">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#F6F5F2] font-normal tracking-tight">
              Why it stands out
            </h3>

            {/* What we found */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-semibold">
                WHAT WE FOUND
              </span>
              <p className="text-sm sm:text-base text-[#A3A099] leading-relaxed">
                {formattedWhatWeFound}
              </p>
            </div>

            {/* Why it stands out */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-semibold">
                WHY IT STANDS OUT
              </span>
              <p className="text-sm sm:text-base text-[#A3A099] leading-relaxed">
                {isContinuousFeature
                  ? `An alignment this close occurs in ${rarity.formattedPercent} of our reference population.`
                  : `This pattern occurs in ${rarity.formattedPercent} of our reference population.`}
              </p>
            </div>
          </div>
        </section>


        {/* ================================================== */}
        {/* 4. WE FOUND MORE (SECONDARY DISCOVERIES) */}
        {/* ================================================== */}
        {otherPatterns.length > 0 && (
          <section className="border-t border-white/[0.06] pt-10 sm:pt-12">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#F6F5F2] font-normal tracking-tight mb-6">
              We found more.
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {otherPatterns.map((pat, idx) => (
                <div
                  key={pat.id}
                  className="rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/80 p-6 backdrop-blur-sm flex flex-col justify-between hover:border-white/[0.16] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono tracking-widest text-[#73716B]">
                        CARD {String(idx + 2).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-mono text-amber-200 bg-amber-400/[0.08] border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                        {pat.formattedPercent}
                      </span>
                    </div>

                    <h4 className="text-lg font-medium text-[#F6F5F2] mb-2 tracking-tight">
                      {pat.name}
                    </h4>

                    <p className="text-sm text-[#A3A099] leading-relaxed mb-4">
                      {formatMeasuredEvidenceText(pat.evidence, pat.description)}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] font-mono text-[#73716B] uppercase">
                    {pat.category}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* ================================================== */}
        {/* 5. YOUR RARITY PROFILE (ONLY WHEN 2+ ITEMS EXIST) */}
        {/* ================================================== */}
        {activeProfileMetrics.length >= 2 && (
          <section className="border-t border-white/[0.06] pt-10 sm:pt-12">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#F6F5F2] font-normal tracking-tight mb-6">
              {isContinuousFeature ? 'Your alignment profile' : 'Your rarity profile'}
            </h3>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/80 p-6 sm:p-7 backdrop-blur-sm">
              <div
                className={`grid grid-cols-1 ${
                  activeProfileMetrics.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
                } gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]`}
              >
                {activeProfileMetrics.map((metric) => (
                  <div key={metric.label} className="pt-4 first:pt-0 sm:pt-0 sm:px-4">
                    <span className="text-[10px] font-mono tracking-[0.2em] text-[#A3A099] uppercase block mb-2">
                      {metric.label}
                    </span>
                    <span
                      className={`font-serif text-3xl sm:text-4xl font-normal ${
                        metric.highlight ? 'text-[#F6F5F2]' : 'text-[#E8E6E3]'
                      }`}
                    >
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}


        {/* ================================================== */}
        {/* 6. THE SHARE MOMENT (PERSONALIZED & PRIVACY-SAFE) */}
        {/* ================================================== */}
        {sharePayload && <ShareCardPreview sharePayload={sharePayload} />}

        {/* Approved Result Ad #2: Below primary sharing controls */}
        <AdSlot placement="result_below_share_controls" className="my-2 px-0" />


        {/* ================================================== */}
        {/* 7. SECONDARY NAVIGATION */}
        {/* ================================================== */}
        <section className="text-center pt-2 flex flex-col items-center">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm text-[#A3A099] hover:text-[#F6F5F2] transition-colors py-2 px-4"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Find another</span>
          </Link>
        </section>

      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-white/[0.06] py-10 bg-[#050506] text-xs text-[#73716B] z-10">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#E8E6E3]">
            <span className="w-2 h-2 rounded-full bg-amber-200" />
            <span className="font-mono text-[11px] tracking-wider">
              DATASET {canonicalResult.reference.datasetVersion.toUpperCase()} · GLOBAL REFERENCE BASELINE
            </span>
          </div>
          <div className="max-w-md text-center sm:text-right text-[#55534E] text-[11px] leading-relaxed">
            AREYOURARE calculations represent symbolic planetary geometry and statistical pattern frequencies against reference populations for insight and exploration.
          </div>
        </div>
      </footer>
    </div>
  );
}
