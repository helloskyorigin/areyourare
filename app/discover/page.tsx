'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { DateInput } from '@/components/discover/DateInput';
import { TimeInput } from '@/components/discover/TimeInput';
import { PlaceInput } from '@/components/discover/PlaceInput';
import { CoordinateFieldVisual } from '@/components/discover/CoordinateFieldVisual';
import { AdSlot } from '@/components/ads/AdSlot';
import { CityLocation } from '@/lib/cities';
import { DiscoverResponse, ApiErrorResponse } from '@/lib/types/birth-input';

export default function DiscoverPage() {
  const router = useRouter();

  // Form starts completely empty
  const [date, setDate] = useState({ day: '', month: '', year: '' });
  const [time, setTime] = useState<{ hour: string; minute: string; period: 'AM' | 'PM' }>({
    hour: '',
    minute: '',
    period: 'AM',
  });
  const [selectedCity, setSelectedCity] = useState<CityLocation | null>(null);
  const [showTimeHelp, setShowTimeHelp] = useState(false);
  const [isDateOnlyMode, setIsDateOnlyMode] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<{
    date?: string | null;
    time?: string | null;
    place?: string | null;
    server?: string | null;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate Date: must be real calendar date, not in future, year between 1900 and current year
  const validateDate = (d: { day: string; month: string; year: string }) => {
    if (!d.day || !d.month || !d.year) return false;
    if (d.day.length < 1 || d.month.length < 1 || d.year.length < 4) return false;

    const dayNum = parseInt(d.day, 10);
    const monthNum = parseInt(d.month, 10);
    const yearNum = parseInt(d.year, 10);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    if (dayNum < 1 || dayNum > 31) return false;
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return false;

    const parsedDate = new Date(yearNum, monthNum - 1, dayNum);
    if (
      parsedDate.getFullYear() !== yearNum ||
      parsedDate.getMonth() !== monthNum - 1 ||
      parsedDate.getDate() !== dayNum
    ) {
      return false;
    }
    if (parsedDate > new Date()) return false;

    return true;
  };

  // Validate Time
  const validateTime = (t: { hour: string; minute: string; period: 'AM' | 'PM' }) => {
    if (!t.hour || !t.minute) return false;
    const h = parseInt(t.hour, 10);
    const m = parseInt(t.minute, 10);
    if (isNaN(h) || isNaN(m)) return false;
    return h >= 1 && h <= 12 && m >= 0 && m <= 59;
  };

  // Check overall form validity
  const isDateValid = validateDate(date);
  const isTimeValid = isDateOnlyMode || validateTime(time);
  const isPlaceValid = !!selectedCity;
  const isFormValid = isDateValid && isTimeValid && isPlaceValid;

  // Convert 12h time to 24h format HH:mm local time
  const formatTime24 = (hourStr: string, minuteStr: string, period: 'AM' | 'PM'): string => {
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr.padStart(2, '0');
    if (period === 'AM') {
      if (hour === 12) hour = 0;
    } else {
      if (hour < 12) hour += 12;
    }
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { date?: string | null; time?: string | null; place?: string | null; server?: string | null } = {};

    if (!isDateValid) {
      newErrors.date = 'Please enter a valid calendar birth date.';
    }
    if (!isDateOnlyMode && !validateTime(time)) {
      newErrors.time = 'Please enter your birth time.';
    }
    if (!isPlaceValid || !selectedCity) {
      newErrors.place = 'Please select a birth place from the list.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!selectedCity) return;

    setErrors({});
    setIsSubmitting(true);

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('outlier_discovery_response');
      sessionStorage.removeItem('outlier_birth_data');
    }

    try {
      // Format payload according to Phase 1 backend specification
      const birthDate = `${date.year}-${date.month.padStart(2, '0')}-${date.day.padStart(2, '0')}`;
      const birthTime = isDateOnlyMode ? '' : formatTime24(time.hour, time.minute, time.period);

      const requestPayload = {
        birthDate,
        birthTime,
        calculation_mode: isDateOnlyMode ? 'DATE_ONLY' : 'FULL_TIME',
        location: {
          city: selectedCity.name,
          region: selectedCity.region || '',
          country: selectedCity.country,
          latitude: selectedCity.lat,
          longitude: selectedCity.lng,
          timezone: selectedCity.timezone,
        },
      };

      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        let errorMsg = 'Unable to validate birth details. Please check your information and try again.';
        try {
          const errData: ApiErrorResponse = await response.json();
          if (errData.error?.message) {
            errorMsg = errData.error.message;
          }
        } catch {
          // ignore
        }
        setErrors({ server: errorMsg });
        setIsSubmitting(false);
        return;
      }

      const data: DiscoverResponse = await response.json();

      // Store structured normalized result for searching & result flow
      if (typeof window !== 'undefined') {
        const sessionPayload = {
          discoveryId: data.discoveryId,
          date: `${date.day.padStart(2, '0')}/${date.month.padStart(2, '0')}/${date.year}`,
          isoDate: data.birthInput.birthDate,
          time: isDateOnlyMode ? 'Omitted (Date-Only)' : `${time.hour.padStart(2, '0')}:${time.minute.padStart(2, '0')} ${time.period}`,
          isoTime: isDateOnlyMode ? '' : data.birthInput.birthTime,
          place: selectedCity.formatted || selectedCity.name,
          city: data.birthInput.location.city,
          region: data.birthInput.location.region || '',
          country: data.birthInput.location.country,
          latitude: data.birthInput.location.latitude,
          longitude: data.birthInput.location.longitude,
          timezone: data.birthInput.location.timezone,
          submittedAt: new Date().toISOString(),
          calculation_mode: isDateOnlyMode ? 'DATE_ONLY' : 'FULL_TIME',
        };

        sessionStorage.setItem('outlier_discovery_response', JSON.stringify(data));
        sessionStorage.setItem('outlier_birth_data', JSON.stringify(sessionPayload));
      }

      // Transition to searching experience
      router.push('/searching');
    } catch {
      setErrors({
        server: 'Connection error. Please check your internet connection and try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050506] text-[#E8E6E3] flex flex-col justify-between selection:bg-[#EAE6DF] selection:text-[#0A0A0B] px-6 sm:px-8 py-8 sm:py-10 relative overflow-x-hidden">
      {/* Background ambient gold lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-400/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar: Minimal Logo + Subtle '01' Step Indicator */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="flex items-center gap-3 text-[#F4F1EA] tracking-[0.28em] text-sm sm:text-base font-semibold group focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-5 h-5">
            <span className="w-5 h-5 rounded-full border border-[#F4F1EA]/80 group-hover:border-[#F4F1EA] transition-colors" />
            <span className="absolute w-2 h-2 rounded-full bg-[#F4F1EA]" />
          </div>
          <span className="font-sans font-medium tracking-[0.3em]">AREYOURARE</span>
        </Link>

        {/* Subtle Step Indicator */}
        <div className="text-xs font-mono tracking-widest text-[#73716B]">
          <span className="text-[#F6F5F2] font-medium">01</span>
        </div>
      </header>

      {/* Main Centered Content Container */}
      <main className="max-w-6xl w-full mx-auto my-auto py-10 lg:py-14 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left / Center: Form Column */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
            {/* Eyebrow */}
            <div className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A3A099] uppercase mb-4">
              YOUR DISCOVERY STARTS HERE
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#F6F5F2] font-normal tracking-tight leading-[1.08] mb-4 text-balance">
              Tell us when and where you were born.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[#A3A099] font-normal leading-relaxed mb-8 sm:mb-10 max-w-xl">
              Three details are all we need to search for your rarest pattern.
            </p>

            {/* Server Error Alert if any */}
            {errors.server && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs sm:text-sm animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{errors.server}</div>
              </div>
            )}

            {/* The Three Input Cards Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input 01: Date of Birth */}
              <DateInput
                day={date.day}
                month={date.month}
                year={date.year}
                onChange={(newDate) => {
                  setDate(newDate);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: null, server: null }));
                }}
                error={errors.date}
              />

              {/* Input 02: Birth Time (Conditionally rendered for Date-Only Mode) */}
              {isDateOnlyMode ? (
                <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/80 backdrop-blur-sm flex items-center justify-between gap-4 animate-in fade-in duration-200">
                  <div className="text-left">
                    <div className="text-[10px] font-mono tracking-widest text-[#73716B] uppercase mb-1 font-semibold">
                      BIRTH TIME
                    </div>
                    <p className="text-sm text-[#E8E6E3] font-serif">
                      Continuing in Date-Only Mode
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDateOnlyMode(false);
                    }}
                    className="text-xs text-amber-200 hover:text-amber-100 font-medium transition-colors cursor-pointer"
                  >
                    Use exact time &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <TimeInput
                    hour={time.hour}
                    minute={time.minute}
                    period={time.period}
                    onChange={(newTime) => {
                      setTime(newTime);
                      if (errors.time) setErrors((prev) => ({ ...prev, time: null, server: null }));
                    }}
                    error={errors.time}
                  />
                  <div className="text-left pl-1">
                    {!showTimeHelp ? (
                      <button
                        type="button"
                        onClick={() => setShowTimeHelp(true)}
                        className="text-xs text-[#73716B] hover:text-[#A3A099] transition-colors focus:outline-none cursor-pointer"
                      >
                        Don&apos;t know your exact birth time?
                      </button>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs space-y-2.5 animate-in fade-in duration-200">
                        <p className="text-[#A3A099] leading-relaxed">
                          That&apos;s okay. You can continue with your birth date only.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDateOnlyMode(true);
                            setShowTimeHelp(false);
                            if (errors.time) setErrors((prev) => ({ ...prev, time: null }));
                          }}
                          className="inline-flex items-center gap-1.5 text-amber-200 hover:text-amber-100 font-medium transition-colors cursor-pointer"
                        >
                          <span>Continue without birth time &rarr;</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Input 03: Birth Place */}
              <PlaceInput
                selectedCity={selectedCity}
                onSelectCity={(city) => {
                  setSelectedCity(city);
                  if (errors.place) setErrors((prev) => ({ ...prev, place: null, server: null }));
                }}
                error={errors.place}
              />

              {/* Primary CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full inline-flex items-center justify-center gap-3 py-4 px-8 rounded-full text-base font-medium transition-all duration-300 group cursor-pointer ${
                    isFormValid && !isSubmitting
                      ? 'bg-[#F4F1EA] text-[#0A0A0B] shadow-[0_0_30px_rgba(244,241,234,0.3)] hover:bg-white hover:shadow-[0_0_40px_rgba(244,241,234,0.5)] hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-white/[0.08] text-[#73716B] cursor-not-allowed border border-white/[0.04]'
                  }`}
                >
                  <span>{isSubmitting ? 'Validating Birth Coordinates...' : 'Find My Rarity'}</span>
                  <ArrowRight
                    className={`w-4 h-4 stroke-[2.2] transition-transform duration-200 ${
                      isFormValid && !isSubmitting ? 'group-hover:translate-x-1' : ''
                    }`}
                  />
                </button>

                {/* Under CTA Info */}
                <p className="text-center text-xs text-[#A3A099] mt-3 font-normal">
                  No account · Takes seconds · Private by default
                </p>
              </div>
            </form>

            {/* Approved Ad Placement: Below birth input form and primary CTA */}
            <AdSlot placement="birth_details_below_form" className="mt-10 mb-0 px-0" />
          </div>

          {/* Right Column: Subtle Minimal Coordinate Field Visual on Desktop */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 items-center justify-center">
            <CoordinateFieldVisual />
          </div>

        </div>
      </main>

      {/* Micro Trust at Bottom */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 z-10">
        <p className="text-xs text-[#73716B] leading-relaxed max-w-md mx-auto">
          Your birth details are used to calculate your result.
          <br className="hidden sm:inline" />
          We don&apos;t need your name or an account.
        </p>
      </footer>
    </div>
  );
}
