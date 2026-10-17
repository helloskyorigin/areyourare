'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  AdPlacementId,
  isPlacementConfigured,
  isRouteAllowedForAds,
} from '@/lib/ads/config';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>> & {
      loaded?: boolean;
      requestNonPersonalizedAds?: number;
    };
  }
}

export interface AdSlotProps {
  placement: AdPlacementId;
  className?: string;
}

type AdRenderState = 'unconfigured' | 'loading' | 'filled' | 'unfilled' | 'error';

/**
 * Reusable, privacy-conscious Google AdSense Responsive Display Ad component.
 *
 * - Never renders fake advertisements or placeholder banners.
 * - Reserves appropriate height while an active ad slot is loading to prevent CLS.
 * - Collapses cleanly to zero height if AdSense is unconfigured, blocked, or unfilled
 *   (never leaves an empty white box).
 * - Prevents duplicate .push({}) calls across React strict-mode and route changes.
 * - Strictly blocked on /searching.
 */
export function AdSlot({ placement, className = '' }: AdSlotProps) {
  const pathname = usePathname();
  const insRef = useRef<HTMLModElement | null>(null);
  const initializedRef = useRef<boolean>(false);

  const { isReady, clientId, slotId, spec, nonPersonalized } =
    isPlacementConfigured(placement);
  const routeAllowed = isRouteAllowedForAds(pathname);

  const [adState, setAdState] = useState<AdRenderState>(() =>
    isReady && routeAllowed ? 'loading' : 'unconfigured'
  );

  useEffect(() => {
    if (!routeAllowed || !isReady || !clientId || !slotId) {
      return;
    }

    const insEl = insRef.current;
    if (!insEl) return;

    // Guard against duplicate initialization during React re-renders
    const existingStatus = insEl.getAttribute('data-adsbygoogle-status');
    if (initializedRef.current || existingStatus) {
      return;
    }

    // Observe AdSense fill status so unfilled units collapse cleanly without empty boxes
    const observer = new MutationObserver(() => {
      const fillStatus = insEl.getAttribute('data-ad-status');
      if (fillStatus === 'unfilled') {
        setAdState('unfilled');
      } else if (fillStatus === 'filled') {
        setAdState('filled');
      }
    });

    observer.observe(insEl, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'],
    });

    let errorTimer: ReturnType<typeof setTimeout> | null = null;
    try {
      initializedRef.current = true;
      window.adsbygoogle = window.adsbygoogle || [];
      if (nonPersonalized) {
        window.adsbygoogle.requestNonPersonalizedAds = 1;
      }
      window.adsbygoogle.push({});
    } catch {
      errorTimer = setTimeout(() => setAdState('error'), 0);
    }

    // Graceful fallback timeout if ad script is blocked by browser privacy extensions
    const fallbackTimer = setTimeout(() => {
      const fillStatus = insEl.getAttribute('data-ad-status');
      const googleStatus = insEl.getAttribute('data-adsbygoogle-status');
      if (fillStatus === 'unfilled' || (!fillStatus && !googleStatus)) {
        setAdState('unfilled');
      }
    }, 6000);

    return () => {
      observer.disconnect();
      if (errorTimer) clearTimeout(errorTimer);
      clearTimeout(fallbackTimer);
    };
  }, [routeAllowed, isReady, clientId, slotId, nonPersonalized, placement]);

  // Never render on /searching or forbidden routes
  if (!routeAllowed || !spec) {
    return null;
  }

  const isCollapsed =
    !isReady ||
    adState === 'unconfigured' ||
    adState === 'unfilled' ||
    adState === 'error';

  return (
    <aside
      aria-label="Advertisement"
      data-ad-placement={placement}
      data-ad-page={spec.page}
      data-ad-state={isCollapsed ? 'collapsed' : adState}
      className={
        isCollapsed
          ? 'w-full h-0 min-h-0 m-0 p-0 overflow-hidden opacity-0 pointer-events-none select-none clear-both'
          : `w-full max-w-4xl mx-auto my-8 sm:my-10 px-4 sm:px-6 clear-both relative z-10 overflow-hidden ${className}`
      }
    >
      {isReady && !isCollapsed && (
        <div className="w-full rounded-xl bg-[#08080B]/60 border border-white/[0.04] p-3 sm:p-4 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-center mb-2">
            <span className="text-[9px] font-mono tracking-[0.25em] text-[#55534E] uppercase select-none">
              Advertisement
            </span>
          </div>
          <div className="w-full min-h-[100px] md:min-h-[90px] flex items-center justify-center overflow-hidden">
            <ins
              ref={insRef}
              className="adsbygoogle block w-full min-h-[100px] md:min-h-[90px]"
              data-ad-client={clientId}
              data-ad-slot={slotId}
              data-ad-format={spec.format}
              data-full-width-responsive={spec.fullWidthResponsive ? 'true' : 'false'}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
