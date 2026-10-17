'use client';

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  day: string;
  month: string;
  year: string;
  onChange: (date: { day: string; month: string; year: string }) => void;
  error?: string | null;
}

export function DateInput({ day, month, year, onChange, error }: DateInputProps) {
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    onChange({ day: val, month, year });
    if (val.length === 2 && monthRef.current) {
      monthRef.current.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    onChange({ day, month: val, year });
    if (val.length === 2 && yearRef.current) {
      yearRef.current.focus();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange({ day, month, year: val });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: 'day' | 'month' | 'year'
  ) => {
    if (e.key === 'Backspace') {
      if (field === 'year' && !year && monthRef.current) {
        monthRef.current.focus();
      } else if (field === 'month' && !month && dayRef.current) {
        dayRef.current.focus();
      }
    }
  };

  return (
    <div className="flex flex-col">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#A3A099] uppercase">
          DATE OF BIRTH
        </label>
        <span className="text-[11px] font-mono text-[#73716B]">DD / MM / YYYY</span>
      </div>

      {/* Input Box */}
      <div
        className={`relative flex items-center justify-between rounded-xl bg-[#0c0c0f] border px-4 sm:px-6 py-3.5 sm:py-4 transition-all duration-200 shadow-sm ${
          error
            ? 'border-red-500/60 ring-1 ring-red-500/20'
            : 'border-white/[0.1] hover:border-white/[0.2] focus-within:border-amber-200/60 focus-within:ring-2 focus-within:ring-amber-200/10'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-mono text-[#F6F5F2] w-full">
          {/* Day */}
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="00"
            value={day}
            onChange={handleDayChange}
            onKeyDown={(e) => handleKeyDown(e, 'day')}
            className="w-10 sm:w-14 bg-transparent text-center focus:outline-none placeholder:text-[#3f3f46] text-[#F6F5F2]"
            aria-label="Birth day"
          />
          <span className="text-[#3f3f46] font-light select-none">/</span>

          {/* Month */}
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="00"
            value={month}
            onChange={handleMonthChange}
            onKeyDown={(e) => handleKeyDown(e, 'month')}
            className="w-10 sm:w-14 bg-transparent text-center focus:outline-none placeholder:text-[#3f3f46] text-[#F6F5F2]"
            aria-label="Birth month"
          />
          <span className="text-[#3f3f46] font-light select-none">/</span>

          {/* Year */}
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0000"
            value={year}
            onChange={handleYearChange}
            onKeyDown={(e) => handleKeyDown(e, 'year')}
            className="w-16 sm:w-24 bg-transparent text-center focus:outline-none placeholder:text-[#3f3f46] text-[#F6F5F2]"
            aria-label="Birth year"
          />
        </div>

        {/* Calendar Icon */}
        <div className="text-[#73716B] shrink-0 pl-2 pointer-events-none select-none">
          <Calendar className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>

      {/* Error text */}
      {error && (
        <span className="text-xs text-red-400/90 mt-1.5 font-normal animate-in fade-in">
          {error}
        </span>
      )}
    </div>
  );
}
