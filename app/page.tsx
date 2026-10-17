'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { SampleResult } from '@/components/SampleResult';
import { ShareSection } from '@/components/ShareSection';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';
import { FaqModal } from '@/components/FaqModal';
import { AdSlot } from '@/components/ads/AdSlot';

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#050506] text-[#E8E6E3] selection:bg-[#EAE6DF] selection:text-[#0A0A0B] relative overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar onOpenFaq={() => setFaqOpen(true)} />

      {/* Main Content Sections in exact approved order */}
      <main className="w-full">
        <Hero />
        <HowItWorks />
        <AdSlot placement="landing_after_how_it_works" />
        <SampleResult />
        <ShareSection />
        <FinalCTA />
      </main>

      {/* Quiet Footer */}
      <Footer onOpenFaq={() => setFaqOpen(true)} />

      {/* FAQ Modal */}
      <FaqModal isOpen={faqOpen} onClose={() => setFaqOpen(false)} />
    </div>
  );
}
