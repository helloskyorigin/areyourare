'use client';

import React, { useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimeInputProps {
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
  onChange: (time: { hour: string; minute: string; period: 'AM' | 'PM' }) => void;
  error?: string | null;
}

export function TimeInput({ hour, minute, period, onChange, error }: TimeInputProps) {
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (val.length > 0 && parseInt(val, 10) > 12) {
      val = '12';
    }
    onChange({ hour: val, minute, period });
    if (val.length === 2 && minuteRef.current) {
      minuteRef.current.focus();
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (val.length > 0 && parseInt(val, 10) > 59) {
      val = '59';
    }
    onChange({ hour, minute: val, period });
  };

  const togglePeriod = (p: 'AM' | 'PM') => {
    onChange({ hour, minute, period: p });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'hour' | 'minute') => {
    if (e.key === 'Backspace' && field === 'minute' && !minute && hourRef.current) {
      hourRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#A3A099] uppercase">
          BIRTH TIME
        </label>
        <span className="text-[11px] font-mono text-[#73716B]">HH : MM</span>
      </div>

      {/* Input Box */}
      <div
        className={`relative flex items-center justify-between rounded-xl bg-[#0c0c0f] border px-4 sm:px-6 py-3 sm:py-3.5 transition-all duration-200 shadow-sm ${
          error
            ? 'border-red-500/60 ring-1 ring-red-500/20'
            : 'border-white/[0.1] hover:border-white/[0.2] focus-within:border-amber-200/60 focus-within:ring-2 focus-within:ring-amber-200/10'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-mono text-[#F6F5F2]">
          {/* Hour */}
          <input
            ref={hourRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="00"
            value={hour}
            onChange={handleHourChange}
            className="w-10 sm:w-14 bg-transparent text-center focus:outline-none placeholder:text-[#3f3f46] text-[#F6F5F2]"
            aria-label="Birth hour"
          />
          <span className="text-[#3f3f46] font-light select-none">:</span>

          {/* Minute */}
          <input
            ref={minuteRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="00"
            value={minute}
            onChange={handleMinuteChange}
            onKeyDown={(e) => handleKeyDown(e, 'minute')}
            className="w-10 sm:w-14 bg-transparent text-center focus:outline-none placeholder:text-[#3f3f46] text-[#F6F5F2]"
            aria-label="Birth minute"
          />
        </div>

        {/* Right side: AM/PM Pill Selector + Clock Icon */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-lg bg-[#18181c] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => togglePeriod('AM')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                period === 'AM'
                  ? 'bg-[#F4F1EA] text-[#0A0A0B] shadow-sm'
                  : 'text-[#A3A099] hover:text-white'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => togglePeriod('PM')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                period === 'PM'
                  ? 'bg-[#F4F1EA] text-[#0A0A0B] shadow-sm'
                  : 'text-[#A3A099] hover:text-white'
              }`}
            >
              PM
            </button>
          </div>

          <Clock className="w-5 h-5 text-[#73716B] stroke-[1.5] hidden sm:block pointer-events-none select-none" />
        </div>
      </div>

      {/* Helper text / Error */}
      <div className="flex items-center justify-between mt-1.5">
        <p className="text-[11px] sm:text-xs text-[#73716B]">
          Exact time gives us a more precise chart.
        </p>
        {error && (
          <span className="text-xs text-red-400/90 font-normal animate-in fade-in">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
