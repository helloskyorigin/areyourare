'use client';

import React, { useEffect } from 'react';
import { X, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AdSlot } from '@/components/ads/AdSlot';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FaqModal({ isOpen, onClose }: FaqModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'What is AREYOURARE?',
      a: 'AREYOURARE is a discovery experience that analyzes astronomical and celestial birth-time configurations against a defined reference population to identify your single rarest pattern.',
    },
    {
      q: 'How does the search work?',
      a: 'You enter your birth date, time, and birthplace. The system maps the precise celestial configuration at that exact moment and compares it against statistical distributions across our reference population.',
    },
    {
      q: 'What if I do not know my exact birth time?',
      a: 'An approximate time can still reveal overarching planetary configurations, though exact minute precision allows for the most precise angle and house calculations.',
    },
    {
      q: 'Is my personal data saved or shared?',
      a: 'No. Searches run without creating an account, and your birth details stay private without being sold or tracked.',
    },
    {
      q: 'Is this a horoscope or future prediction tool?',
      a: 'No. AREYOURARE does not provide daily horoscopes or future predictions. It is focused strictly on identifying unique geometric and statistical patterns at the moment of your birth.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0e0e12] border border-white/[0.12] rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="faq-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-2 text-[#F6F5F2]">
            <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
            <h3 id="faq-title" className="font-serif text-2xl font-normal">
              Frequently Asked Questions
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#A3A099] hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-200/50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FAQs List */}
        <div className="space-y-6">
          {faqs.map((item, idx) => (
            <div key={idx} className="border-b border-white/[0.04] pb-5 last:border-b-0">
              <h4 className="text-base font-medium text-[#F6F5F2] mb-2 tracking-tight">
                {item.q}
              </h4>
              <p className="text-sm text-[#A3A099] leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* Lower FAQ Ad Slot (collapses cleanly when unconfigured) */}
        <AdSlot placement="faq_lower_content" className="my-4 px-0" />

        {/* Footer CTA */}
        <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-[#73716B]">Ready to discover your pattern?</span>
          <Link
            href="/discover"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-xs font-medium hover:bg-white transition-all"
          >
            <span>Start Discovery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
