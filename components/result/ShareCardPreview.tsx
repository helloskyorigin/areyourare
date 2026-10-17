'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Download, Link2, Check, ArrowRight } from 'lucide-react';
import { CanonicalSharePayload } from '@/lib/types/result';

interface ShareCardPreviewProps {
  sharePayload: CanonicalSharePayload;
}

/**
 * Sanitizes optional user-provided display name for client-side share card personalization only.
 * Never persisted to a database or transmitted to calculation engines.
 */
function sanitizeDisplayName(raw: string): string {
  return raw
    .replace(/[<>'"&\\/`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24);
}

function formatCardOwnerLabel(
  cleanName: string,
  discoveryType: 'MATCHED_PATTERN' | 'CONTINUOUS_FEATURE' = 'MATCHED_PATTERN'
): string {
  const noun = discoveryType === 'CONTINUOUS_FEATURE' ? 'DISCOVERY' : 'RARITY';
  if (!cleanName) return `MY ${noun}`;
  const upper = cleanName.toUpperCase();
  return `${upper}'S ${noun}`;
}

export function ShareCardPreview({ sharePayload }: ShareCardPreviewProps) {
  const [nameInput, setNameInput] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = sessionStorage.getItem('outlier_share_name');
      if (savedName) {
        const clean = sanitizeDisplayName(savedName);
        const timer = setTimeout(() => {
          setNameInput(clean);
          setAppliedName(clean);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleApplyName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeDisplayName(nameInput);
    setNameInput(clean);
    setAppliedName(clean);
    if (typeof window !== 'undefined') {
      if (clean) {
        sessionStorage.setItem('outlier_share_name', clean);
      } else {
        sessionStorage.removeItem('outlier_share_name');
      }
    }
  };

  const formattedPercentage = `${sharePayload.frequencyPercent.toFixed(2)}%`;
  const ownerHeader = formatCardOwnerLabel(
    appliedName,
    sharePayload.discoveryType || 'MATCHED_PATTERN'
  );

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.origin;
      navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${ownerHeader} — ${formattedPercentage}`,
          text: `${sharePayload.patternName} (${formattedPercentage} ${sharePayload.referenceLabel}). Find your rarity:`,
          url: window.location.origin,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadImage = () => {
    setDownloading(true);

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350; // 4:5 vertical format
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Dark background
      ctx.fillStyle = '#070709';
      ctx.fillRect(0, 0, 1080, 1350);

      // Subtle warm gold radial glow
      const grad = ctx.createRadialGradient(540, 460, 50, 540, 520, 600);
      grad.addColorStop(0, 'rgba(212, 175, 55, 0.14)');
      grad.addColorStop(1, 'rgba(7, 7, 9, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1350);

      // Outer Card border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 60, 960, 1230);

      // Header logo: concentric circle + wordmark
      ctx.strokeStyle = 'rgba(244, 241, 234, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(365, 180, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#F4F1EA';
      ctx.beginPath();
      ctx.arc(365, 180, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F4F1EA';
      ctx.font = '600 32px sans-serif';
      ctx.letterSpacing = '10px';
      ctx.fillText('AREYOURARE', 405, 192);

      // Owner Header ("MY RARITY" / "MY DISCOVERY" or "<NAME>'S RARITY" / "<NAME>'S DISCOVERY")
      ctx.fillStyle = '#A3A099';
      ctx.font = '500 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '6px';
      ctx.fillText(ownerHeader, 540, 440);

      // Verified Percentage from calculation engine
      ctx.fillStyle = '#F6F5F2';
      ctx.font = 'normal 130px serif';
      ctx.letterSpacing = '0px';
      ctx.fillText(formattedPercentage, 540, 595);

      // Pattern or Feature name
      ctx.fillStyle = '#F6F5F2';
      ctx.font = 'normal 44px serif';
      ctx.fillText(sharePayload.patternName, 540, 745);

      // Brand footer
      ctx.fillStyle = '#D4AF37';
      ctx.font = '600 20px sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('AREYOURARE', 540, 1140);

      const link = document.createElement('a');
      link.download = `AREYOURARE-${sharePayload.frequencyPercent.toFixed(2)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    setTimeout(() => setDownloading(false), 900);
  };

  return (
    <section className="border-t border-white/[0.06] pt-10 sm:pt-14 relative overflow-hidden">
      <div className="max-w-3xl mx-auto">
        
        {/* Optional Name Personalization */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/80 p-6 sm:p-7 mb-10 sm:mb-12 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#F6F5F2] font-normal tracking-tight mb-1">
                Make your Rarity yours.
              </h3>
              <p className="text-xs sm:text-sm text-[#A3A099]">
                Add your name to your share card.
              </p>
            </div>

            <form onSubmit={handleApplyName} className="flex items-center gap-2.5 w-full sm:w-auto">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                maxLength={24}
                aria-label="Your name for share card"
                className="w-full sm:w-44 px-4 py-2.5 rounded-full bg-[#141419] border border-white/[0.12] text-sm text-[#F6F5F2] placeholder:text-[#6E6C66] focus:outline-none focus:border-amber-200/50 transition-colors"
              />
              <button
                type="submit"
                className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-xs sm:text-sm font-medium text-[#F4F1EA] transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Share Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#F6F5F2] font-normal tracking-tight mb-2">
            Share your discovery.
          </h2>
          <p className="text-sm sm:text-base text-[#A3A099] max-w-md mx-auto leading-relaxed">
            Turn your Rarity into a card worth sharing.
          </p>
        </div>

        {/* Share Card & Action Controls */}
        <div className="flex flex-col items-center">
          
          {/* Privacy-Safe Share Card */}
          <div className="relative group mb-8 w-full max-w-[290px] sm:max-w-[320px]">
            <div className="absolute -inset-6 bg-radial from-amber-500/[0.12] via-yellow-200/[0.04] to-transparent rounded-3xl blur-2xl pointer-events-none group-hover:scale-105 transition-transform duration-500" />

            <div
              ref={cardRef}
              className="relative w-full aspect-[4/5] rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#18181c]/95 via-[#101014]/95 to-[#070709]/95 p-6 sm:p-7 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] backdrop-blur-md transform -rotate-1 hover:rotate-0 transition-transform duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />

              {/* Card Top: Brand */}
              <div className="relative z-10 flex items-center justify-center gap-2 pt-1">
                <div className="relative flex items-center justify-center w-3.5 h-3.5">
                  <span className="w-3.5 h-3.5 rounded-full border border-[#F4F1EA]/80" />
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-[#F4F1EA]" />
                </div>
                <span className="text-[11px] font-sans font-medium tracking-[0.3em] text-[#F4F1EA]">
                  AREYOURARE
                </span>
              </div>

              {/* Card Center: Personalized Header + Percentage + Pattern Name */}
              <div className="relative z-10 flex flex-col items-center text-center my-auto py-3">
                <span className="text-[10px] tracking-[0.25em] text-[#A3A099] uppercase font-medium mb-3">
                  {ownerHeader}
                </span>

                <div className="font-serif text-5xl sm:text-6xl text-[#F6F5F2] font-normal tracking-tight mb-4">
                  {formattedPercentage}
                </div>

                <div className="font-serif text-lg sm:text-xl text-[#F6F5F2] font-normal leading-snug max-w-[230px]">
                  {sharePayload.patternName}
                </div>
              </div>

              {/* Card Bottom: Brand Mark */}
              <div className="relative z-10 flex justify-center pb-1">
                <span className="text-[10px] font-mono tracking-[0.28em] text-[#D4AF37] uppercase">
                  AREYOURARE
                </span>
              </div>

              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.1] pointer-events-none" />
            </div>
          </div>

          {/* Primary CTA + Secondary Actions */}
          <div className="flex flex-col items-center gap-3.5 w-full max-w-sm">
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-sm sm:text-base font-medium shadow-[0_0_25px_rgba(244,241,234,0.25)] hover:bg-white hover:shadow-[0_0_35px_rgba(244,241,234,0.4)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 stroke-[2]" />
              <span>Share My Rarity</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs sm:text-sm text-[#F6F5F2] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Preparing...' : 'Download'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs sm:text-sm text-[#F6F5F2] active:scale-[0.98] transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy link'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
