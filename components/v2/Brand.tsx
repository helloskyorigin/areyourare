import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
export function SiteHeader() {
  return <header className="site-header">
    
    <Link href="/" className="brand" aria-label="AREYOURARE home"><span className="brand-mark">✳</span> AREYOURARE<span className="brand-dot">.</span></Link>
    <nav aria-label="Main navigation"><Link href="/#experience" className="nav-secondary">The experience</Link><Link href="/my-capsules" className="nav-secondary">My Capsules</Link><Link href="/#birthday-form" className="nav-action">Explore my day <ArrowUpRight size={16}/></Link></nav>
  </header>;
}
export function SiteFooter() {
  return <footer className="site-footer shell"><div><Link className="brand" href="/"><span className="brand-mark">✳</span> AREYOURARE.</Link><p>Every birthday has a backstory. Explore yours.</p></div>
    <div className="footer-links"><Link href="/my-capsules">My Capsules</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refunds">Refunds</Link><a href="mailto:hello.skyorigin@gmail.com">Contact</a></div>
    <div className="footer-end"><Clock3 size={15}/> Stories from Wikipedia and its contributors. Historical anniversaries are not predictions.</div>
  </footer>;
}
