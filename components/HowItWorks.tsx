'use client';

import React from 'react';
import { FileText, Search, BarChart2, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

export function HowItWorks() {
  const { ref, isVisible } = useScrollReveal(0.12);

  const steps = [
    {
      number: '01',
      title: 'Your details',
      description: 'Date, time & place',
      icon: FileText,
    },
    {
      number: '02',
      title: 'We search',
      description: 'Your birth pattern against a global reference population.',
      icon: Search,
    },
    {
      number: '03',
      title: 'You discover',
      description: 'Your rarest pattern and how rare it is.',
      icon: BarChart2,
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="w-full py-14 sm:py-18 md:py-22 relative">
      <div className="max-w-6xl w-full mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div
          className={`mb-10 sm:mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A3A099] uppercase mb-2.5">
            SIMPLE. FAST. GLOBAL.
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-[#F6F5F2] tracking-tight">
            How it works
          </h2>
        </div>

        {/* 3 Step Flow with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-start relative">
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;

            return (
              <React.Fragment key={step.number}>
                {/* Step Item */}
                <div
                  className={`md:col-span-3 flex flex-row md:flex-col items-start gap-4 sm:gap-5 group transition-all duration-700 ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-6'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${idx * 140}ms` : '0ms',
                  }}
                >
                  {/* Icon Circle */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/[0.12] bg-[#0c0c0e] flex items-center justify-center shrink-0 group-hover:border-amber-200/40 group-hover:bg-[#131317] transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8E6E3] stroke-[1.4]" />
                  </div>

                  {/* Step Content */}
                  <div className="flex flex-col pt-0.5 md:pt-0">
                    <span className="text-[11px] sm:text-xs font-mono text-[#8E8B84] tracking-wider mb-1">
                      {step.number}
                    </span>
                    <h3 className="text-base sm:text-lg font-medium text-[#F6F5F2] mb-1 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A3A099] font-normal leading-relaxed max-w-xs md:max-w-none">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Arrow (Visible on Desktop between steps) */}
                {!isLast && (
                  <div
                    className={`hidden md:flex md:col-span-1 items-center justify-center pt-5 transition-all duration-700 ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      transitionDelay: isVisible ? `${idx * 140 + 70}ms` : '0ms',
                    }}
                  >
                    <ArrowRight className="w-4 h-4 text-[#55534E] stroke-[1.5]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}

        </div>

      </div>
    </section>
  );
}
