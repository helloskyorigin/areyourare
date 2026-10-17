'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenFaq?: () => void;
}

export function Navbar({ onOpenFaq }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#050506]/85 backdrop-blur-md border-b border-white/[0.06] py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-3 text-[#F4F1EA] tracking-[0.28em] text-sm md:text-base font-semibold group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-200/50 rounded-sm"
          >
            <div className="relative flex items-center justify-center w-5 h-5">
              <span className="w-5 h-5 rounded-full border border-[#F4F1EA]/80 group-hover:border-[#F4F1EA] transition-colors" />
              <span className="absolute w-2 h-2 rounded-full bg-[#F4F1EA]" />
            </div>
            <span className="font-sans font-medium tracking-[0.3em]">AREYOURARE</span>
          </Link>

          {/* Desktop Navigation Links & Action */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-xs lg:text-sm text-[#A3A099] hover:text-[#F4F1EA] transition-colors tracking-wide font-normal"
            >
              How it works
            </a>
            <button
              type="button"
              onClick={onOpenFaq}
              className="text-xs lg:text-sm text-[#A3A099] hover:text-[#F4F1EA] transition-colors tracking-wide font-normal cursor-pointer"
            >
              FAQ
            </button>
            <Link
              href="/discover"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-xs lg:text-sm font-medium hover:bg-white hover:shadow-[0_0_20px_rgba(244,241,234,0.35)] active:scale-[0.98] transition-all duration-200"
            >
              <span>Find My Rarity</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/discover"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-xs font-medium hover:bg-white active:scale-95 transition-all"
            >
              <span>Discover</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#A3A099] hover:text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#050506]/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col justify-between pb-12 animate-in fade-in duration-200">
          <div className="flex flex-col space-y-6 text-center">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg text-[#E8E6E3] hover:text-white py-2 transition-colors"
            >
              How it works
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenFaq?.();
              }}
              className="text-lg text-[#E8E6E3] hover:text-white py-2 transition-colors"
            >
              FAQ
            </button>
            <div className="pt-6">
              <Link
                href="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-base font-medium shadow-lg hover:bg-white transition-all"
              >
                <span>Find My Rarity</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="text-center text-xs text-[#73716B]">
            A Global Birth-Pattern Discovery
          </div>
        </div>
      )}
    </>
  );
}
