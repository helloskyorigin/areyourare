import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Globe2, History, Sparkles, Clock3, BookOpen, ChevronDown, ShieldCheck } from 'lucide-react';
import { SiteHeader, SiteFooter } from '@/components/v2/Brand';
import { BirthdayForm } from '@/components/v2/BirthdayForm';
import { LandingMotion } from '@/components/v2/LandingMotion';

const reasons = [
 {index:'01',icon:History,kicker:'THE MOMENTS',title:'A day that made history.',text:'Travel beyond your birth year. Discover the important events that share your calendar date across centuries.'},
 {index:'02',icon:Globe2,kicker:'THE CONNECTIONS',title:'You share it with legends.',text:'Meet noteworthy figures whose stories began on the same month and day as yours.'},
 {index:'03',icon:BookOpen,kicker:'YOUR KEEPSAKE',title:'A story you can keep.',text:'Turn your discoveries into a personal Time Capsule, with original sources and a print-ready archive.'},
];
export default function HomePage() {
 return <div className="site">
  <LandingMotion/>
  <a className="skip-link" href="#main-content">Skip to content</a>
  <SiteHeader/>
  <main id="main-content">
   <section className="home-hero shell" id="start">
    <div className="hero-content">
     <div className="eyebrow"><span className="eyebrow-glyph">✳</span> A DIFFERENT WAY TO DISCOVER YOUR DAY</div>
     <h1>The world has a story.<br/><em>So does your birthday.</em></h1>
     <p className="hero-intro">Long before you were born, your date was making history. Discover remarkable moments and extraordinary people connected to the day you arrived.</p>
     <BirthdayForm/>
     <div className="hero-trust"><span><ShieldCheck size={15}/> No account</span><span><Clock3 size={15}/> Just your birthday</span><span><Globe2 size={15}/> Wikipedia-powered</span></div>
    </div>
    <div className="hero-archive" aria-label="Illustrative historical archive for July 20">
      <div className="hero-archive-frame">
        <div className="hero-archive-meta"><span>THE HUMAN ARCHIVE</span><span>VOL. 001</span></div>
        <div className="hero-archive-issue">A SINGLE DATE, CENTURIES OF HISTORY</div>
        <div className="hero-archive-date"><strong>20</strong><em>July</em></div>
        <div className="hero-archive-rule"><span>ON THIS DAY</span><span>↓</span></div>
        <div className="hero-archive-entries">
          <div><time dateTime="1969-07-20">1969</time><span>Apollo 11 lands on the Moon</span></div>
          <div><time dateTime="1976-07-20">1976</time><span>Viking 1 lands on Mars</span></div>
        </div>
        <div className="hero-archive-bottom"><span>EXAMPLE DATE · 20 JULY</span><span>✳</span></div>
      </div>
      <span className="hero-archive-margin" aria-hidden="true">YOUR STORY IS IN THE ARCHIVE</span>
    </div>
   </section>
   <div className="ticker" aria-hidden="true"><div>ONE DATE <b>✳</b> COUNTLESS STORIES <b>✳</b> A PERSONAL JOURNEY THROUGH HISTORY <b>✳</b> ONE DATE <b>✳</b> COUNTLESS STORIES <b>✳</b></div></div>
   <section className="intro-section shell" id="experience"><div><span className="eyebrow">01 / AN EXTRAORDINARY CONNECTION</span><h2>There was never <em>just another day.</em></h2></div><p>What if the date you call your birthday holds stories you never knew? Step through the centuries, one documented moment at a time.</p></section>
   <section className="showcase shell">
    <div className="showcase-date"><span className="eyebrow">A SAMPLE FROM THE ARCHIVE</span><span className="showcase-day">20</span><span className="showcase-month">JULY</span><div className="showcase-star">✳</div><span>YOUR CALENDAR DATE IS A DOORWAY</span></div>
    <div className="showcase-story"><div className="showcase-moon"/><div className="showcase-overlay"><span className="eyebrow">1969 / HUMANITY'S MOON LANDING</span><h3>One small step.<br/>One giant leap.</h3><p>On July 20, 1969, Apollo 11 touched down on the Moon. One calendar day became part of our shared human story.</p>
     <a href="https://en.wikipedia.org/wiki/Apollo_11" target="_blank" rel="noopener noreferrer">View the Wikipedia record <ArrowUpRight size={16}/></a></div></div>
   </section>
   <section className="section-space shell"><div className="section-heading"><span className="eyebrow">02 / THE DISCOVERIES</span><h2>A little wonder,<br/><em>waiting to be found.</em></h2></div><div className="feature-grid">{reasons.map(({index,icon:Icon,kicker,title,text})=><article className="feature-card" key={index}><div className="feature-card-head"><span>{index} / 03</span><Icon size={27} strokeWidth={1.3}/></div><span className="eyebrow">{kicker}</span><h3>{title}</h3><p>{text}</p><span className="feature-mark">↗</span></article>)}</div></section>
   <section className="how-section" id="how"><div className="shell how-wrap"><div><span className="eyebrow">03 / HOW IT WORKS</span><h2>All it takes <em>is a date.</em></h2><p>No birth time. No birth location. Just one date and a little curiosity.</p><Link className="inline-link" href="/#birthday-form">Explore your date <ArrowUpRight size={17}/></Link></div><div className="how-steps">
    <div><span>01</span><strong>Enter your birthday</strong><p>Choose the day, month and year you were born.</p><CalendarDays size={23}/></div>
    <div><span>02</span><strong>Open the historical archive</strong><p>See Wikipedia-sourced events and birthday connections.</p><History size={23}/></div>
    <div><span>03</span><strong>Make it your own</strong><p>Enjoy your free first discovery or create a complete Time Capsule.</p><Sparkles size={23}/></div></div></div></section>
   <section className="capsule-promo shell" id="capsule"><div className="book-stage"><div className="book-cover"><div className="book-top"><span>AREYOURARE</span><span>VOL. 01</span></div><div className="book-sun">✳</div><span className="eyebrow">A PERSONAL ARCHIVE</span><div className="book-date">20<br/><em>July</em></div><div className="book-bottom">THE BIRTHDAY<br/>TIME CAPSULE</div></div></div><div className="capsule-promo-text"><span className="eyebrow">04 / GO BEYOND THE FIRST MOMENT</span><h2>Your day deserves <em>its own archive.</em></h2><p>Keep more than a birthday. Discover a curated collection of remarkable moments, historic lives and stories that share your day — all connected to their sources.</p><ul><li>✳ Full, source-linked historical timeline</li><li>✳ Notable people born on your date</li><li>✳ Exact birth-year events when documented</li><li>✳ Beautiful print-ready Time Capsule</li></ul><div className="price-line"><strong>$2</strong><span>ONE TIME · NO SUBSCRIPTION</span></div><Link className="button-primary" href="/#birthday-form">Discover my birthday first <ArrowUpRight size={18}/></Link></div></section>
   <section className="faq shell"><div><span className="eyebrow">05 / GOOD TO KNOW</span><h2>Curiosity looks <em>good on you.</em></h2></div><div>
    <details><summary>Is the first discovery really free? <ChevronDown size={17}/></summary><p>Yes. You get a featured historical event, a notable birthday connection when available, and a small timeline preview.</p></details>
    <details><summary>Are the stories real? <ChevronDown size={17}/></summary><p>Stories come from Wikipedia's On This Day archive. An anniversary can be from a different year than your birth. Every available source is linked.</p></details>
    <details><summary>What's in the $2 Time Capsule? <ChevronDown size={17}/></summary><p>More documented events and birthday connections, searchable timeline, birth-year matches when available and a print-ready keepsake. It is one-time, not a subscription.</p></details>
    <details><summary>Can I read the original Wikipedia article? <ChevronDown size={17}/></summary><p>Absolutely. We link to original article pages when Wikipedia provides them, and credit its contributors.</p></details>
   </div></section>
   <section className="last-word"><span className="eyebrow">✳ YOUR STORY STARTS HERE</span><h2>Every birthday has <em>a backstory.</em></h2><p>Ready to discover yours?</p><Link href="/#birthday-form" className="button-primary">Explore my birthday <ArrowUpRight size={19}/></Link></section>
  </main><SiteFooter/>
 </div>;
}
