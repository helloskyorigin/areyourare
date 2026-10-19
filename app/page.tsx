'use client';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Clock3, ShieldCheck, BookOpen, ChevronDown, History, Sparkles } from 'lucide-react';
import { SiteHeader, SiteFooter } from '@/components/v2/Brand';
import { BirthdayForm } from '@/components/v2/BirthdayForm';
import { LandingMotion } from '@/components/v2/LandingMotion';
import { useLanguage } from '@/components/v2/Language';

export default function HomePage(){
 const {tr}=useLanguage();
 const reasons=[
  {index:'01',Icon:History,kicker:tr('THE MOMENT','वह ऐतिहासिक पल'),title:tr('A date that made history.','इतिहास बदलने वाला दिन।'),text:tr('Discover something remarkable that happened on your calendar birthday.','जानिए आपकी जन्मतिथि पर इतिहास में क्या खास हुआ था।')},
  {index:'02',Icon:Sparkles,kicker:tr('GO DEEPER','और जानें'),title:tr('More than one story.','एक नहीं, अनेक कहानियाँ।'),text:tr('Unlock the events and notable people connected to your date.','अपनी तारीख से जुड़ी घटनाएँ और प्रसिद्ध लोगों के बारे में जानें।')},
  {index:'03',Icon:BookOpen,kicker:tr('YOUR CAPSULE','आपकी टाइम कैप्सूल'),title:tr('A keepsake to save.','एक यादगार रिपोर्ट।'),text:tr('Keep your historical collection and a complete printable report.','अपनी पूरी ऐतिहासिक रिपोर्ट सहेजें और डाउनलोड करें।')},
 ];
 return <div className="site">
  <LandingMotion/><a className="skip-link" href="#main-content">{tr('Skip to content','सीधे सामग्री पर जाएँ')}</a>
  <SiteHeader/>
  <main id="main-content">
   <section className="home-hero shell" id="start">
    <div className="hero-content">
     <div className="eyebrow"><span className="eyebrow-glyph">✳</span>{tr('YOUR BIRTHDAY IN HISTORY','इतिहास में आपका जन्मदिन')}</div>
     <h1>{tr('What happened on','जिस दिन आपका जन्म हुआ,')}<br/><em>{tr('your birthday?','उस दिन क्या हुआ था?')}</em></h1>
     <p className="hero-intro">{tr('Enter your date of birth. Discover one incredible moment for free. Unlock the full story for just $2.','अपनी जन्मतिथि दर्ज करें। एक खास ऐतिहासिक घटना मुफ़्त जानें। पूरी कहानी सिर्फ़ $2 में पाएँ।')}</p>
     <BirthdayForm/>
     <div className="hero-trust"><span><ShieldCheck size={15}/>{tr('No account','बिना अकाउंट')}</span><span><Clock3 size={15}/>{tr('Instant discovery','तुरंत जानें')}</span></div>
    </div>
    <div className="hero-archive" aria-label={tr('An example of a historical date','एक ऐतिहासिक तारीख का उदाहरण')}>
     <div className="hero-archive-frame">
      <div className="hero-archive-meta"><span>{tr('THE HUMAN ARCHIVE','इतिहास का संग्रह')}</span><span>VOL. 01</span></div>
      <div className="hero-archive-issue">{tr('ONE DAY, MANY STORIES','एक दिन, अनेक कहानियाँ')}</div>
      <div className="hero-archive-date"><strong>20</strong><em>{tr('July','जुलाई')}</em></div>
      <div className="hero-archive-rule"><span>{tr('A MOMENT IN HISTORY','इतिहास का एक पल')}</span><span>↓</span></div>
      <div className="hero-archive-entries">
       <div><time dateTime="1969-07-20">1969</time><span>{tr('Apollo 11 lands on the Moon','अपोलो 11 चाँद पर उतरा')}</span></div>
       <div><time dateTime="1976-07-20">1976</time><span>{tr('Viking 1 lands on Mars','वाइकिंग 1 मंगल पर उतरा')}</span></div>
      </div>
      <div className="hero-archive-bottom"><span>{tr('EXAMPLE · 20 JULY','उदाहरण · 20 जुलाई')}</span><span>✳</span></div>
     </div>
    </div>
   </section>
   <div className="ticker" aria-hidden="true"><div>{tr('ONE DAY','एक दिन')} <b>✳</b> {tr('REAL HISTORY','सच्चा इतिहास')} <b>✳</b> {tr('YOUR STORY','आपकी कहानी')} <b>✳</b> {tr('DISCOVER MORE','और जानें')} <b>✳</b></div></div>
   <section className="intro-section shell" id="experience">
    <div><span className="eyebrow">01 / {tr('THE DISCOVERY','खोज')}</span><h2>{tr('Your date holds','आपकी तारीख में')}<br/><em>{tr('a hidden story.','छिपी है एक कहानी।')}</em></h2></div>
    <p>{tr('See the story for free. Then decide if you want to explore the entire archive.','पहली कहानी मुफ़्त देखें। पसंद आए तो पूरी ऐतिहासिक रिपोर्ट खोलें।')}</p>
   </section>
   <section className="showcase shell">
    <div className="showcase-date"><span className="eyebrow">{tr('AN EXAMPLE','एक उदाहरण')}</span><span className="showcase-day">20</span><span className="showcase-month">{tr('JULY','जुलाई')}</span><div className="showcase-star">✳</div><span>{tr('EVERY DATE HAS HISTORY','हर तारीख का इतिहास है')}</span></div>
    <div className="showcase-story"><div className="showcase-moon"/><div className="showcase-overlay">
     <span className="eyebrow">{tr('1969 / THE MOON LANDING','1969 / चंद्रमा पर पहला कदम')}</span>
     <h3>{tr('A giant leap','इंसानियत का')}<br/>{tr('for humanity.','ऐतिहासिक कदम।')}</h3>
     <p>{tr('On 20 July 1969, Apollo 11 landed on the Moon. Your birthday might share a similarly remarkable moment.','20 जुलाई 1969 को अपोलो 11 चंद्रमा पर उतरा था। आपकी तारीख का इतिहास भी खास हो सकता है।')}</p>
     <a href="https://en.wikipedia.org/wiki/Apollo_11" target="_blank" rel="noopener noreferrer">{tr('Original source','मूल स्रोत')} <ArrowUpRight size={16}/></a>
    </div></div>
   </section>
   <section className="section-space shell">
    <div className="section-heading"><span className="eyebrow">02 / {tr('WHAT YOU GET','आपको क्या मिलेगा')}</span><h2>{tr('Discover one moment.','एक खास पल जानें।')}<br/><em>{tr('Unlock the rest.','बाकी सब खोलें।')}</em></h2></div>
    <div className="feature-grid">{reasons.map(({index,Icon,kicker,title,text})=><article className="feature-card" key={index}>
     <div className="feature-card-head"><span>{index} / 03</span><Icon size={27} strokeWidth={1.3}/></div>
     <span className="eyebrow">{kicker}</span><h3>{title}</h3><p>{text}</p><span className="feature-mark">↗</span>
    </article>)}</div>
   </section>
   <section className="how-section" id="how"><div className="shell how-wrap">
    <div><span className="eyebrow">03 / {tr('HOW IT WORKS','यह कैसे काम करता है')}</span><h2>{tr('One date.','सिर्फ़ एक तारीख।')}<br/><em>{tr('One discovery.','एक अनोखी खोज।')}</em></h2>
     <p>{tr('No birth time or place needed.','जन्म का समय या स्थान नहीं चाहिए।')}</p>
     <Link href="/#birthday-form" className="inline-link">{tr('Try it free','मुफ़्त आज़माएँ')} <ArrowUpRight size={17}/></Link></div>
    <div className="how-steps">
     <div><span>01</span><strong>{tr('Enter your birthday','जन्मतिथि दर्ज करें')}</strong><p>{tr('Select your date of birth.','अपनी जन्मतिथि चुनें।')}</p><CalendarDays size={23}/></div>
     <div><span>02</span><strong>{tr('Get one free story','एक कहानी मुफ़्त पाएँ')}</strong><p>{tr('See one historical moment from your date.','अपनी तारीख की एक ऐतिहासिक घटना जानें।')}</p><History size={23}/></div>
     <div><span>03</span><strong>{tr('Unlock everything for $2','सिर्फ़ $2 में पूरी रिपोर्ट')}</strong><p>{tr('Get the complete history and your Time Capsule.','पूरा इतिहास और आपकी टाइम कैप्सूल पाएँ।')}</p><Sparkles size={23}/></div>
    </div>
   </div></section>
   <section className="capsule-promo shell" id="capsule">
    <div className="book-stage"><div className="book-cover"><div className="book-top"><span>AREYOURARE</span><span>VOL. 01</span></div><div className="book-sun">✳</div>
     <span className="eyebrow">{tr('PERSONAL HISTORY','आपका इतिहास')}</span><div className="book-date">20<br/><em>{tr('July','जुलाई')}</em></div><div className="book-bottom">{tr('THE BIRTHDAY','जन्मदिन की')}<br/>{tr('TIME CAPSULE','टाइम कैप्सूल')}</div></div></div>
    <div className="capsule-promo-text">
     <span className="eyebrow">04 / {tr('THE COMPLETE STORY','पूरी कहानी')}</span>
     <h2>{tr('Your entire birthday','आपके जन्मदिन का')}<br/><em>{tr('history.','पूरा इतिहास।')}</em></h2>
     <p>{tr('See more events, notable birthdays and a downloadable historical keepsake.','और ऐतिहासिक घटनाएँ, प्रसिद्ध जन्मदिन और डाउनलोड करने लायक पूरी रिपोर्ट।')}</p>
     <ul>
      <li>✳ {tr('Full historical timeline','पूरी ऐतिहासिक समयरेखा')}</li>
      <li>✳ {tr('Famous birthday connections','इसी दिन जन्मे प्रसिद्ध लोग')}</li>
      <li>✳ {tr('Birth-year matches when available','उपलब्ध होने पर आपके जन्म-वर्ष की घटनाएँ')}</li>
      <li>✳ {tr('Complete printable report','पूरी रिपोर्ट डाउनलोड करें')}</li>
     </ul>
     <div className="price-line"><strong>$2</strong><span>{tr('ONE-TIME PAYMENT','सिर्फ़ एक बार भुगतान')}</span></div>
     <Link href="/#birthday-form" className="button-primary">{tr('Start with my free story','पहले मुफ़्त कहानी देखें')} <ArrowUpRight size={18}/></Link>
    </div>
   </section>
   <section className="faq shell"><div><span className="eyebrow">05 / {tr('QUESTIONS','सवाल-जवाब')}</span><h2>{tr('Good to know.','ज़रूरी बातें।')}</h2></div><div>
    <details><summary>{tr('Is my first story free?','क्या पहली कहानी मुफ़्त है?')} <ChevronDown size={17}/></summary><p>{tr('Yes. One verified historical moment is free. The complete archive costs $2 once.','हाँ। एक ऐतिहासिक घटना मुफ़्त मिलेगी। पूरी रिपोर्ट का शुल्क एक बार $2 है।')}</p></details>
    <details><summary>{tr('Did this happen in my birth year?','क्या यह घटना मेरे जन्म-वर्ष में हुई थी?')} <ChevronDown size={17}/></summary><p>{tr('Not necessarily. We show the real year of each event.','ज़रूरी नहीं। हर घटना का असली वर्ष स्पष्ट दिखाया जाता है।')}</p></details>
    <details><summary>{tr('What do I get for $2?','$2 में क्या मिलेगा?')} <ChevronDown size={17}/></summary><p>{tr('The full date-specific archive, famous birthdays and a complete printable Time Capsule.','आपकी तारीख का पूरा ऐतिहासिक संग्रह, प्रसिद्ध जन्मदिन और पूरी डाउनलोड योग्य रिपोर्ट।')}</p></details>
   </div></section>
   <section className="last-word"><span className="eyebrow">✳ {tr('START DISCOVERING','खोज शुरू करें')}</span><h2>{tr('What does your','आपके जन्मदिन का')}<br/><em>{tr('birthday reveal?','इतिहास क्या है?')}</em></h2>
    <p>{tr('Your first moment is free.','आपकी पहली कहानी मुफ़्त है।')}</p>
    <Link href="/#birthday-form" className="button-primary">{tr('Explore my birthday','मेरा जन्मदिन जानें')} <ArrowUpRight size={19}/></Link>
   </section>
  </main><SiteFooter/>
 </div>;
}
