import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SiteHeader,SiteFooter } from '@/components/v2/Brand';
export default function NotFound(){return <div className="site"><SiteHeader/><main className="state-message shell"><span className="eyebrow">THE ARCHIVE / 404</span><h1>A story still <em>unwritten.</em></h1><p>We couldn't find that page in the archive, but your own date is ready to explore.</p><Link href="/discover" className="button-primary">Discover my birthday <ArrowUpRight size={18}/></Link></main><SiteFooter/></div>;}
