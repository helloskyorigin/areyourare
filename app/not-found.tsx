import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050506] text-[#E8E6E3] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative flex items-center justify-center w-6 h-6 mb-6">
        <span className="w-6 h-6 rounded-full border border-[#F4F1EA]/80" />
        <span className="absolute w-2 h-2 rounded-full bg-[#F4F1EA]" />
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl text-[#F6F5F2] font-normal mb-3">
        Page Not Found
      </h1>
      <p className="text-sm text-[#A3A099] mb-8 max-w-sm">
        The coordinate or discovery path you requested does not exist.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F4F1EA] text-[#0A0A0B] text-xs font-medium hover:bg-white transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to OUTLIER</span>
      </Link>
    </div>
  );
}
