'use client';
import { SiteHeader,SiteFooter } from '@/components/v2/Brand';
import { BirthdayForm } from '@/components/v2/BirthdayForm';
import { useLanguage } from '@/components/v2/Language';
export default function DiscoverPage(){
 const {tr}=useLanguage();
 return <div className="site"><SiteHeader/><main className="discover-center shell" id="main-content">
  <span className="eyebrow">✳ {tr('START YOUR DISCOVERY','अपनी खोज शुरू करें')}</span>
  <h1>{tr('When were','आपका जन्म')}<br/><em>{tr('you born?','कब हुआ था?')}</em></h1>
  <p>{tr('Enter your birthday to discover one remarkable event for free.','जन्मतिथि भरें और इतिहास की एक खास घटना मुफ़्त जानें।')}</p>
  <BirthdayForm compact/>
 </main><SiteFooter/></div>;
}
