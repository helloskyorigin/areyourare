'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SiteHeader,SiteFooter } from '@/components/v2/Brand';
import { useLanguage } from '@/components/v2/Language';
export default function NotFound(){
 const {tr}=useLanguage();
 return <div className="site"><SiteHeader/><main className="state-message shell" id="main-content">
  <span className="eyebrow">AREYOURARE / 404</span>
  <h1>{tr('Page not found.','यह पेज नहीं मिला।')}</h1>
  <p>{tr('Your own birthday story is waiting.','आपके जन्मदिन की कहानी आपका इंतज़ार कर रही है।')}</p>
  <Link href="/discover" className="button-primary">{tr('Discover my birthday','मेरा जन्मदिन जानें')} <ArrowUpRight size={18}/></Link>
 </main><SiteFooter/></div>;
}
