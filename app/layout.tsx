import type {Metadata} from 'next';
import {Cormorant_Garamond, Plus_Jakarta_Sans} from 'next/font/google';
import { AdSenseScript } from '@/components/ads/AdSenseScript';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AREYOURARE — Global Birth-Pattern Discovery',
  description:
    'Find what makes your birth unusual. AREYOURARE searches your birth-chart pattern against a global reference population.',
  openGraph: {
    title: 'AREYOURARE — Global Birth-Pattern Discovery',
    description:
      'Find what makes your birth unusual. Enter your date, time and place to discover your rarest pattern.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AREYOURARE — Global Birth-Pattern Discovery',
    description:
      'Find what makes your birth unusual. Enter your date, time and place to discover your rarest pattern.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable} scroll-smooth dark`}>
      <body className="bg-[#050506] text-[#E8E6E3] font-sans antialiased selection:bg-[#EAE6DF] selection:text-[#0A0A0B] overflow-x-hidden min-h-screen">
        <AdSenseScript />
        {children}
      </body>
    </html>
  );
}
