'use client';
import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { LanguageToggle, useLanguage } from '@/components/v2/Language';
export function SiteHeader(){
 const {tr}=useLanguage();
 return <header className="site-header">
  <Link href="/" className="brand" aria-label="AREYOURARE home"><span className="brand-mark">✳</span> AREYOURARE<span className="brand-dot">.</span></Link>
  <nav aria-label={tr('Main navigation','मुख्य नेविगेशन')}>
   <Link href="/my-capsules" className="nav-secondary">{tr('My reports','मेरी रिपोर्ट')}</Link>
   <LanguageToggle/>
   <Link href="/#birthday-form" className="nav-action">{tr('Explore','खोजें')} <ArrowUpRight size={16}/></Link>
  </nav>
 </header>;
}
export function SiteFooter(){
 const {tr}=useLanguage();
 return <footer className="site-footer shell">
  <div><Link className="brand" href="/"><span className="brand-mark">✳</span> AREYOURARE.</Link><p>{tr('Your birthday has a story. Discover it.','आपके जन्मदिन की भी एक कहानी है। उसे जानिए।')}</p></div>
  <div className="footer-links">
   <Link href="/my-capsules">{tr('My reports','मेरी रिपोर्ट')}</Link>
   <Link href="/privacy">{tr('Privacy','गोपनीयता')}</Link>
   <Link href="/terms">{tr('Terms','नियम')}</Link>
   <Link href="/refunds">{tr('Refunds','रिफंड')}</Link>
   <a href="mailto:hello.skyorigin@gmail.com">{tr('Support','सहायता')}</a>
  </div>
  <div className="footer-end"><Clock3 size={15}/>{tr('Historical events may be from different years. Original sources are linked in each report.','ऐतिहासिक घटनाएँ अलग-अलग वर्षों की हो सकती हैं। हर रिपोर्ट में मूल स्रोत का लिंक दिया गया है।')}</div>
 </footer>;
}
