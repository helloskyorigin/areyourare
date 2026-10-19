import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import './journey.css';
import './layout-stability.css';
import './launch.css';
import './conversion.css';
import { LanguageProvider } from '@/components/v2/Language';
const display = Cormorant_Garamond({ subsets:['latin'], weight:['400','500','600','700'],style:['normal','italic'],display:'swap',variable:'--font-display' });
const sans = Manrope({ subsets:['latin'],display:'swap',variable:'--font-sans' });
export const metadata: Metadata = {
 metadataBase:new URL('https://areyourare.ai.studio'),
 title:'AREYOURARE — The World Has a Story. So Does Your Birthday.',
 description:'What happened on the date you were born? Discover historic events, notable birthdays and your own Birthday Time Capsule. Your first discovery is free.',
 openGraph:{title:'AREYOURARE — Your Birthday in History',description:'One date. Centuries of extraordinary stories. Explore the history behind your birthday.',type:'website',url:'https://areyourare.ai.studio'},
 twitter:{card:'summary_large_image',title:'AREYOURARE — Your Birthday in History',description:'Discover what made history on your birthday.'},
 robots:{index:true,follow:true},
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en" className={display.variable+' '+sans.variable}>
  <head><style>{':root{--serif:var(--font-display),Georgia,serif}'}</style></head>
  <body><LanguageProvider>{children}</LanguageProvider></body>
 </html>;
}
