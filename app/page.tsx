'use client';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, ChevronDown, Clock3, LockKeyhole, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { SiteHeader, SiteFooter } from '@/components/v2/Brand';
import { BirthdayForm } from '@/components/v2/BirthdayForm';
import { LandingMotion } from '@/components/v2/LandingMotion';
import { useLanguage } from '@/components/v2/Language';

export default function HomePage() {
  const {tr} = useLanguage();
  return <div className="site">
    <LandingMotion/><a className="skip-link" href="#main-content">{tr('Skip to content','मुख्य सामग्री पर जाएँ')}</a>
    <SiteHeader/>
    <main id="main-content">
      <section className="home-hero shell" id="start">
        <div className="hero-content">
          <span className="eyebrow"><span className="eyebrow-glyph">✳</span>{tr('THE HISTORY BEHIND YOUR BIRTHDAY','आपके जन्मदिन के पीछे का इतिहास')}</span>
          <h1>{tr('Your birthday','आपका जन्मदिन')}<br/><em>{tr('has a backstory.','सिर्फ़ एक तारीख नहीं।')}</em></h1>
          <p className="hero-intro">{tr(
            'One date. Many stories across time. Discover what your calendar day holds — your complete personal Time Capsule is just $2.',
            'एक तारीख, समय के अनेक किस्से। अपनी तारीख के पीछे का इतिहास जानें — पूरी टाइम कैप्सूल सिर्फ़ $2 में।'
          )}</p>
          <BirthdayForm/>
          <div className="hero-trust"><span><ShieldCheck size={15}/>{tr('No account required','अकाउंट की ज़रूरत नहीं')}</span>
            <span><Clock3 size={15}/>{tr('One-time $2 access','सिर्फ़ एक बार $2')}</span></div>
        </div>
        <div className="hero-archive" aria-label={tr('Illustration of a sealed birthday archive','बंद जन्मदिन संग्रह का चित्र')}>
          <div className="hero-archive-frame">
            <div className="hero-archive-meta"><span>AREYOURARE / ARCHIVE</span><span>VOL. 01</span></div>
            <div className="hero-archive-issue">{tr('ONE DATE. THE STORIES BEHIND IT.','एक तारीख। उसके पीछे की कहानियाँ।')}</div>
            <div className="hero-archive-date"><strong>20</strong><em>{tr('July','जुलाई')}</em></div>
            <div className="hero-archive-rule"><span>{tr('SEALED CHAPTERS','बंद अध्याय')}</span><LockKeyhole size={16}/></div>
            <div className="hero-archive-entries">
              <div><time>01</time><span>{tr('The moments that mattered','इतिहास के महत्वपूर्ण पल')}</span></div>
              <div><time>02</time><span>{tr('The lives connected to your day','आपकी तारीख से जुड़े खास लोग')}</span></div>
              <div><time>03</time><span>{tr('Your complete Time Capsule','आपकी पूरी टाइम कैप्सूल')}</span></div>
            </div>
            <div className="hero-archive-bottom"><span>{tr('EXAMPLE DATE · 20 JULY','उदाहरण · 20 जुलाई')}</span><span>✳</span></div>
          </div>
        </div>
      </section>
      <div className="ticker" aria-hidden="true"><div>{tr('ONE DATE','एक तारीख')} <b>✳</b> {tr('A HIDDEN HISTORY','एक अनकहा इतिहास')} <b>✳</b> {tr('YOUR TIME CAPSULE','आपकी टाइम कैप्सूल')} <b>✳</b></div></div>
      <section className="intro-section shell" id="experience">
        <div><span className="eyebrow">01 / {tr('THE IDEA','खास बात')}</span>
          <h2>{tr('The day is yours.','दिन आपका है।')}<br/><em>{tr('The history is waiting.','इतिहास इंतज़ार कर रहा है।')}</em></h2></div>
        <p>{tr('Your birthday connects you to centuries of real moments. Check your date, then unlock the full archive if curiosity wins.',
          'आपकी जन्मतिथि सदियों पुराने असली ऐतिहासिक पलों से जुड़ी है। पहले तारीख देखें, फिर चाहें तो पूरी रिपोर्ट खोलें।')}</p>
      </section>
      <section className="mystery-landing-showcase shell">
        <div className="mystery-landing-number"><span>{tr('A PERSONAL DATE RECORD','आपकी तारीख का निजी रिकॉर्ड')}</span>
          <strong>20</strong><em>{tr('July','जुलाई')}</em><span>AREYOURARE / VOL. 01</span></div>
        <div className="mystery-landing-copy">
          <span className="eyebrow">✳ {tr('UNLOCK THE UNKNOWN','अनजाना इतिहास खोलें')}</span>
          <h2>{tr('What happened','उस दिन')}<br/><em>{tr('on this day?','क्या हुआ था?')}</em></h2>
          <p>{tr('Documented events. Remarkable lives. One beautifully arranged report. We keep the stories sealed until you unlock.',
            'ऐतिहासिक घटनाएँ, प्रसिद्ध लोग और एक खूबसूरत रिपोर्ट। पूरा इतिहास खोलने तक कहानियाँ बंद रहेंगी।')}</p>
          <Link className="inline-link" href="/#birthday-form">{tr('Explore your own date','अपनी तारीख खोजें')} <ArrowUpRight size={17}/></Link>
        </div>
      </section>
      <section className="how-section" id="how"><div className="shell how-wrap">
        <div><span className="eyebrow">02 / {tr('THREE SIMPLE STEPS','बस तीन आसान कदम')}</span>
          <h2>{tr('A date.','एक तारीख।')}<br/><em>{tr('A little curiosity.','थोड़ी सी उत्सुकता।')}</em></h2>
          <p>{tr('No birth time, place or registration.','न जन्म-समय, न जन्म-स्थान, न रजिस्ट्रेशन।')}</p>
          <Link href="/#birthday-form" className="inline-link">{tr('Start here','यहाँ शुरू करें')} <ArrowUpRight size={17}/></Link></div>
        <div className="how-steps">
          <div><span>01</span><strong>{tr('Enter your birthday','जन्मतिथि भरें')}</strong><p>{tr('Select your date of birth.','अपनी जन्मतिथि चुनें।')}</p><CalendarDays size={23}/></div>
          <div><span>02</span><strong>{tr('See your sealed archive','बंद इतिहास की झलक देखें')}</strong><p>{tr('A short date check opens your private preview — no stories spoiled.','छोटी सी जाँच के बाद झलक मिलेगी — असली कहानी अभी नहीं दिखेगी।')}</p><LockKeyhole size={23}/></div>
          <div><span>03</span><strong>{tr('Unlock everything for $2','सिर्फ़ $2 में पूरी रिपोर्ट')}</strong><p>{tr('Pay once to open your full historical result.','एक बार भुगतान करके पूरा ऐतिहासिक रिज़ल्ट खोलें।')}</p><Sparkles size={23}/></div>
        </div>
      </div></section>
      <section className="capsule-promo shell" id="capsule">
        <div className="book-stage"><div className="book-cover">
          <div className="book-top"><span>AREYOURARE</span><span>VOL. 01</span></div>
          <div className="book-sun">✳</div><span className="eyebrow">{tr('PERSONAL HISTORY','आपका इतिहास')}</span>
          <div className="book-date">20<br/><em>{tr('July','जुलाई')}</em></div>
          <div className="book-bottom">{tr('BIRTHDAY','जन्मदिन की')}<br/>{tr('TIME CAPSULE','टाइम कैप्सूल')}</div>
        </div></div>
        <div className="capsule-promo-text">
          <span className="eyebrow">03 / {tr('THE COMPLETE EXPERIENCE','पूरी कहानी')}</span>
          <h2>{tr('More than a date.','तारीख से कहीं ज़्यादा।')}<br/><em>{tr('A story to keep.','सहेजने वाली कहानी।')}</em></h2>
          <p>{tr('Your historical timeline, notable birthdays and a complete printable keepsake, organized around your calendar day.',
            'आपकी तारीख की ऐतिहासिक समयरेखा, प्रसिद्ध जन्मदिन और पूरी डाउनलोड योग्य यादगार रिपोर्ट।')}</p>
          <ul>
            <li>✳ {tr('Complete historical timeline','पूरी ऐतिहासिक समयरेखा')}</li>
            <li>✳ {tr('Notable people born on your date','आपकी तारीख पर जन्मे प्रसिद्ध लोग')}</li>
            <li>✳ {tr('Birth-year events when documented','उपलब्ध होने पर जन्म-वर्ष की घटनाएँ')}</li>
            <li>✳ {tr('Print-ready personal Time Capsule','डाउनलोड योग्य निजी टाइम कैप्सूल')}</li>
          </ul>
          <div className="price-line"><strong>$2</strong><span>{tr('ONE PAYMENT · NO SUBSCRIPTION','एक बार भुगतान · कोई सब्सक्रिप्शन नहीं')}</span></div>
          <Link className="button-primary" href="/#birthday-form">{tr('Discover my date','मेरी तारीख देखें')} <ArrowUpRight size={18}/></Link>
        </div>
      </section>
      <section className="faq shell"><div><span className="eyebrow">04 / {tr('GOOD TO KNOW','जानना ज़रूरी है')}</span>
        <h2>{tr('A few quick','कुछ ज़रूरी')}<br/><em>{tr('answers.','जवाब।')}</em></h2></div>
        <div>
          <details><summary>{tr('Can I see the full story for free?','क्या पूरी कहानी मुफ़्त में मिलेगी?')} <ChevronDown size={17}/></summary>
            <p>{tr('Checking your date and opening the sealed preview is free. Historical stories and the complete report unlock after a one-time $2 payment.',
              'तारीख जाँचना और बंद रिपोर्ट की झलक मुफ़्त है। असली ऐतिहासिक कहानियाँ और पूरी रिपोर्ट एक बार $2 भुगतान के बाद खुलेंगी।')}</p></details>
          <details><summary>{tr('Is this a subscription?','क्या यह सब्सक्रिप्शन है?')} <ChevronDown size={17}/></summary>
            <p>{tr('No. Just one $2 purchase for the chosen date.','नहीं। चुनी हुई तारीख की रिपोर्ट के लिए सिर्फ़ एक बार $2।')}</p></details>
          <details><summary>{tr('Did these events happen in my birth year?','क्या सारी घटनाएँ मेरे जन्म-वर्ष में हुई थीं?')} <ChevronDown size={17}/></summary>
            <p>{tr('Not necessarily. Each event has its real historical year; an exact birth-year event is shown only if documented.',
              'ज़रूरी नहीं। हर घटना का वास्तविक वर्ष दिखाया जाएगा। जन्म-वर्ष की घटना केवल उपलब्ध होने पर दिखाई जाएगी।')}</p></details>
        </div>
      </section>
      <section className="last-word"><span className="eyebrow">✳ {tr('YOUR CHAPTER IS WAITING','आपकी कहानी आपका इंतज़ार कर रही है')}</span>
        <h2>{tr('Ready to see','क्या आप जानना')}<br/><em>{tr('your history?','चाहेंगे?')}</em></h2>
        <p>{tr('Check your date. Unlock the full story for $2.','अपनी तारीख चुनें। पूरी कहानी सिर्फ़ $2 में खोलें।')}</p>
        <Link href="/#birthday-form" className="button-primary">{tr('Check my birthday','मेरा जन्मदिन देखें')} <ArrowUpRight size={19}/></Link>
      </section>
    </main><SiteFooter/>
  </div>;
}
