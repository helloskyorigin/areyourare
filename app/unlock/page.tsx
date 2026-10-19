'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, LockKeyhole, ShieldCheck, Sparkles, BookOpen, Clock3 } from 'lucide-react';
import { SiteHeader, SiteFooter } from '@/components/v2/Brand';
import { useLanguage } from '@/components/v2/Language';
import { PremiumCTA } from '@/components/v2/PremiumCTA';
import { parseBirthday } from '@/lib/birthday';

function UnlockExperience() {
  const params = useSearchParams();
  const router = useRouter();
  const {lang,tr} = useLanguage();
  const date = params.get('date') || '';
  const birthday = parseBirthday(date);
  const [paid, setPaid] = useState(false);
  useEffect(() => {
    if (!parseBirthday(date)) return;
    const controller = new AbortController();
    async function checkEntitlement() {
      try {
        const result = await fetch('/api/payment-status?date='+encodeURIComponent(date),
          {signal:controller.signal,cache:'no-store'});
        if (!result.ok) return;
        const status = await result.json() as {paid?:boolean};
        if (!controller.signal.aborted && status.paid === true) {
          setPaid(true);
          router.replace('/result?date='+encodeURIComponent(date));
        }
      } catch { /* Do not block the paywall when status cannot be checked. */ }
    }
    void checkEntitlement();
    return () => controller.abort();
  }, [date, router]);
  const label=birthday?new Date(Date.UTC(2000,birthday.month-1,birthday.day))
    .toLocaleDateString(lang==='hi'?'hi-IN':'en-US',{day:'numeric',month:'long',timeZone:'UTC'}):'';
  if (!birthday) {
    return <div className="site"><SiteHeader/><main className="state-message shell" id="main-content">
      <h1>{tr('Choose your birthday first.','पहले अपनी जन्मतिथि चुनें।')}</h1>
      <Link className="button-primary" href="/discover">{tr('Enter birth date','जन्मतिथि दर्ज करें')} <ArrowRight size={17}/></Link>
    </main><SiteFooter/></div>;
  }
  return <div className="site mystery-page"><SiteHeader/>
    <main className="mystery-main shell" id="main-content">
      <div className="mystery-topline">
        <span className="eyebrow">✳ {tr('YOUR DATE HAS A BACKSTORY','आपकी तारीख की एक कहानी है')}</span>
        <Link href="/discover" className="mystery-back"><ArrowLeft size={15}/>{tr('Change date','तारीख बदलें')}</Link>
      </div>
      <div className="mystery-stage">
        <div className="mystery-copy">
          <span className="mystery-chapter">{tr('YOUR PERSONAL TIME CAPSULE','आपकी निजी टाइम कैप्सूल')}</span>
          <h1>{tr('What happened','उस दिन')}<br/><em>{tr('on your day?','क्या हुआ था?')}</em></h1>
          <p>{tr('Your date has a place in history. The moments, names and stories are inside your Time Capsule.','आपकी तारीख इतिहास से जुड़ी है। उस दिन की घटनाएँ, नाम और कहानियाँ आपकी टाइम कैप्सूल में हैं।')}</p>
          <div className="mystery-date-line"><CalendarDays size={17}/><strong>{label}</strong><span>{birthday.year}</span></div>
        </div>
        <div className="mystery-book" aria-label={tr('Sealed birthday archive illustration','सीलबंद जन्मदिन संग्रह का चित्र')}>
          <div className="mystery-book-top"><span>AREYOURARE</span><span>VOL. 01</span></div>
          <div className="mystery-book-center">
            <span className="mystery-seal-star" aria-hidden="true">✳</span>
            <span className="mystery-seal-eyebrow">{tr('A DATE THROUGH TIME','समय के पन्नों में एक तारीख')}</span>
            <strong>{String(birthday.day).padStart(2,'0')}</strong>
            <em>{new Date(Date.UTC(2000,birthday.month-1,birthday.day)).toLocaleDateString(lang==='hi'?'hi-IN':'en-US',{month:'long',timeZone:'UTC'})}</em>
            <span className="mystery-seal-line"/>
            <span className="mystery-sealed"><LockKeyhole size={13}/>{tr('SEALED UNTIL UNLOCKED','खोलने तक सुरक्षित')}</span>
          </div>
          <div className="mystery-book-bottom"><span>{tr('THE STORIES BEHIND YOUR DAY','आपकी तारीख की अनकही कहानियाँ')}</span><span>✦</span></div>
        </div>
      </div>
      <div className="mystery-hidden-header">
        <div><span className="eyebrow">01 / {tr('INSIDE YOUR CAPSULE','आपकी टाइम कैप्सूल में')}</span>
          <h2>{tr('The stories are','कहानियाँ तैयार हैं,')}<br/><em>{tr('still sealed.','बस खोलना बाकी है।')}</em></h2></div>
        <p>{tr('A personal collection of documented history, organized around your calendar date.','आपकी जन्मतिथि से जुड़ी ऐतिहासिक घटनाओं का एक निजी संग्रह।')}</p>
      </div>
      <div className="mystery-lock-grid" aria-label={tr('Contents available after purchase','खरीद के बाद उपलब्ध सामग्री')}>
        <article><div className="mystery-lock-icon"><BookOpen size={23}/></div>
          <span>01 / {tr('THE MOMENTS','ऐतिहासिक पल')}</span>
          <h3>{tr('What happened?','क्या हुआ था?')}</h3>
          <p>{tr('Explore events that share your date across different years.','जानिए अलग-अलग वर्षों में आपकी तारीख पर क्या हुआ था।')}</p>
          <small><LockKeyhole size={13}/>{tr('FULL ACCESS','पूरी जानकारी')}</small>
        </article>
        <article><div className="mystery-lock-icon"><Sparkles size={23}/></div>
          <span>02 / {tr('THE PEOPLE','खास लोग')}</span>
          <h3>{tr('Who shares this day?','इस दिन किसका जन्म हुआ?')}</h3>
          <p>{tr('Discover notable lives connected to the same calendar day.','इसी तारीख को जन्मे प्रसिद्ध लोगों के बारे में जानिए।')}</p>
          <small><LockKeyhole size={13}/>{tr('FULL ACCESS','पूरी जानकारी')}</small>
        </article>
        <article><div className="mystery-lock-icon"><Clock3 size={23}/></div>
          <span>03 / {tr('THE KEEPSAKE','यादगार रिपोर्ट')}</span>
          <h3>{tr('Keep the full story.','पूरी कहानी सहेजें।')}</h3>
          <p>{tr('Read your timeline and save a complete printable report.','पूरी समयरेखा पढ़ें और प्रिंट योग्य रिपोर्ट सहेजें।')}</p>
          <small><LockKeyhole size={13}/>{tr('FULL ACCESS','पूरी जानकारी')}</small>
        </article>
      </div>
      <div className="mystery-payment" id="unlock">
        <div className="mystery-payment-side">
          <span className="eyebrow">02 / {tr('OPEN YOUR ARCHIVE','अपना संग्रह खोलें')}</span>
          <h2>{tr('Your day.','आपकी तारीख।')}<br/><em>{tr('The complete story.','पूरी कहानी।')}</em></h2>
          <p>{tr('One secure payment. Your complete historical report opens immediately after payment is verified.','एक सुरक्षित भुगतान। पुष्टि होते ही आपकी पूरी ऐतिहासिक रिपोर्ट खुल जाएगी।')}</p>
          <span className="mystery-payment-trust"><ShieldCheck size={16}/>{tr('No subscription. No invented predictions.','कोई सब्सक्रिप्शन नहीं। कोई मनगढ़ंत भविष्यवाणी नहीं।')}</span>
        </div>
        <PremiumCTA date={date} paid={paid}/>
      </div>
      <div className="mystery-after"><span>{tr('Events are associated with your calendar day, not necessarily your exact birth year.','घटनाएँ आपकी जन्मतिथि वाले दिन की हैं, ज़रूरी नहीं कि जन्म-वर्ष की हों।')}</span>
        <Link href="/discover">{tr('Explore another date','दूसरी तारीख देखें')} <ArrowRight size={15}/></Link>
      </div>
    </main>
    <SiteFooter/>
  </div>;
}
export default function UnlockPage() {
  return <Suspense fallback={<div className="site loading-state">AREYOURARE</div>}><UnlockExperience/></Suspense>;
}
