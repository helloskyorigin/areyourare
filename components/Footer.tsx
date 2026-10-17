'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  onOpenFaq?: () => void;
}

export function Footer({ onOpenFaq }: FooterProps) {
  return (
    <footer className="border-t border-white/[0.06] py-12 bg-[#050506] text-xs text-[#73716B]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 text-[#E8E6E3]">
          <div className="relative flex items-center justify-center w-4 h-4">
            <span className="w-4 h-4 rounded-full border border-[#F4F1EA]/80" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-[#F4F1EA]" />
          </div>
          <span className="font-sans font-medium tracking-[0.25em] text-xs">AREYOURARE</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-[#A3A099]">
          <a href="#how-it-works" className="hover:text-[#E8E6E3] transition-colors">
            How it works
          </a>
          <button
            type="button"
            onClick={onOpenFaq}
            className="hover:text-[#E8E6E3] transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <Link href="/discover" className="hover:text-[#E8E6E3] transition-colors">
            Discover
          </Link>
        </div>

        {/* Legal notice */}
        <div className="text-center sm:text-right text-[#55534E]">
          © {new Date().getFullYear()} AREYOURARE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
