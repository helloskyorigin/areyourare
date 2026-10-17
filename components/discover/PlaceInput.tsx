'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Check, Loader2 } from 'lucide-react';
import { searchCitiesAsync, CityLocation } from '@/lib/cities';

interface PlaceInputProps {
  selectedCity: CityLocation | null;
  onSelectCity: (city: CityLocation | null) => void;
  error?: string | null;
}

export function PlaceInput({ selectedCity, onSelectCity, error }: PlaceInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CityLocation[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search logic (~280ms)
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const results = await searchCitiesAsync(query);
        setSuggestions(results);
        setHighlightIndex(0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: CityLocation) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectCity(null);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[highlightIndex]) {
        handleSelect(suggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col relative" ref={containerRef}>
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#A3A099] uppercase">
          BIRTH PLACE
        </label>
        <span className="text-[11px] text-[#73716B]">City or town</span>
      </div>

      {/* Selected State vs Search Input */}
      {selectedCity ? (
        <div className="flex items-center justify-between rounded-xl bg-[#0c0c0f] border border-amber-200/40 px-4 sm:px-6 py-3.5 sm:py-4 shadow-sm min-h-[58px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400/[0.1] border border-amber-400/20 flex items-center justify-center text-amber-200 shrink-0">
              <MapPin className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-medium text-[#F6F5F2] leading-tight">
                {selectedCity.name}
              </p>
              <p className="text-xs text-[#A3A099] mt-0.5">
                {selectedCity.region ? `${selectedCity.region}, ` : ''}{selectedCity.country}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-lg text-[#A3A099] hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none cursor-pointer"
            aria-label="Change birthplace"
            title="Change place"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`relative flex items-center justify-between rounded-xl bg-[#0c0c0f] border px-4 sm:px-6 py-3.5 sm:py-4 transition-all duration-200 shadow-sm min-h-[58px] ${
            error
              ? 'border-red-500/60 ring-1 ring-red-500/20'
              : 'border-white/[0.1] hover:border-white/[0.2] focus-within:border-amber-200/60 focus-within:ring-2 focus-within:ring-amber-200/10'
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            {loading ? (
              <Loader2 className="w-5 h-5 text-amber-200/80 animate-spin shrink-0" />
            ) : (
              <Search className="w-5 h-5 text-[#73716B] shrink-0 stroke-[1.5]" />
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city or town"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (query.trim()) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-base sm:text-lg text-[#F6F5F2] placeholder:text-[#3f3f46] focus:outline-none"
              aria-label="Search birth city or town"
              autoComplete="off"
            />
          </div>

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 text-[#73716B] hover:text-white cursor-pointer"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {!selectedCity && isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-[#0e0e12] border border-white/[0.12] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl animate-in fade-in duration-150">
          <div className="px-4 py-2 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
            <span className="text-[10px] font-mono tracking-wider text-[#73716B] uppercase">
              {loading ? 'SEARCHING LOCATIONS...' : 'MATCHING LOCATIONS'}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading && suggestions.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#A3A099] flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-200" />
                <span>Searching locations...</span>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((city, idx) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`w-full text-left px-4 py-3.5 flex items-center justify-between transition-colors group cursor-pointer border-b border-white/[0.03] last:border-b-0 min-h-[48px] ${
                    highlightIndex === idx ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#73716B] group-hover:text-amber-200 transition-colors shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-[#F6F5F2] group-hover:text-white block">
                        {city.name}
                      </span>
                      <span className="text-xs text-[#A3A099]">
                        {city.region ? `${city.region}, ` : ''}{city.country}
                      </span>
                    </div>
                  </div>
                  <Check
                    className={`w-3.5 h-3.5 text-amber-300 transition-opacity ${
                      highlightIndex === idx ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </button>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-[#A3A099] mb-2">
                  No places found for &quot;{query}&quot;
                </p>
                <button
                  type="button"
                  onClick={() =>
                    handleSelect({
                      id: `custom-${Date.now()}`,
                      name: query.trim(),
                      country: 'Global Coordinate',
                      formatted: query.trim(),
                      lat: 0,
                      lng: 0,
                      timezone: 'UTC',
                    })
                  }
                  className="px-3.5 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs text-[#F6F5F2] transition-colors cursor-pointer"
                >
                  Use &quot;{query.trim()}&quot;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error text */}
      {error && !selectedCity && (
        <span className="text-xs text-red-400/90 mt-1.5 font-normal animate-in fade-in">
          {error}
        </span>
      )}
    </div>
  );
}
