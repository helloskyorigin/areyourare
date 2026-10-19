'use client';
import { SiteHeader,SiteFooter } from '@/components/v2/Brand';
import { BirthdayForm } from '@/components/v2/BirthdayForm';
import { useLanguage } from '@/components/v2/Language';
export default function DiscoverPage(){
 const {tr}=useLanguage();
 return <div className="site"><SiteHeader/><main className="discover-center shell" id="main-content">
  <span className="eyebrow">✳ {tr('START YOUR DISCOVERY','अपनी खोज शुरू करें')}</span>
  <h1>{tr('When were','आपका जन्म')}<br/><em>{tr('you born?','कब हुआ था?')}</em></h1>
  <p>{tr('Enter your date to open your sealed historical preview. Unlock the full story for $2.','अपनी जन्मतिथि दर्ज करें और बंद ऐतिहासिक संग्रह की झलक देखें। पूरी कहानी सिर्फ़ $2 में खोलें।')}</p>
  <BirthdayForm compact/>
 </main><SiteFooter/></div>;
}
