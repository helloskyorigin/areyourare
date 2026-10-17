'use client';

import React from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { getAdSenseConfig, isRouteAllowedForAds } from '@/lib/ads/config';

/**
 * Global Google AdSense script loader.
 * Mounted once in app/layout.tsx. Loads the official AdSense library at most once
 * when a valid publisher Client ID is configured and the route permits ads.
 */
export function AdSenseScript() {
  const pathname = usePathname();
  const { enabled, clientId } = getAdSenseConfig();

  if (!enabled || !clientId || !isRouteAllowedForAds(pathname)) {
    return null;
  }

  return (
    <Script
      id="areyourare-google-adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
