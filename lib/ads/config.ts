/**
 * AREYOURARE — Google AdSense Configuration & Inventory Registry
 *
 * Centralizes publisher configuration, placement definitions, route safety rules,
 * and privacy controls. Never accesses user birth data or session storage.
 */

export type AdPlacementId =
  | 'landing_after_how_it_works'
  | 'birth_details_below_form'
  | 'result_after_primary_card'
  | 'result_below_share_controls'
  | 'how_it_works_after_content'
  | 'faq_lower_content'
  | 'privacy_lower_page';

export interface AdPlacementSpec {
  id: AdPlacementId;
  page: 'landing' | 'discover' | 'result' | 'how-it-works' | 'faq' | 'privacy';
  slotEnvKey: string;
  slotId: string;
  format: 'auto' | 'horizontal' | 'rectangle';
  fullWidthResponsive: boolean;
  /** Reserved minimum height (px) on mobile when an active ad unit is expected (CLS prevention) */
  minHeightMobilePx: number;
  /** Reserved minimum height (px) on desktop when an active ad unit is expected (CLS prevention) */
  minHeightDesktopPx: number;
  description: string;
}

/**
 * Routes where advertisements are strictly prohibited under all circumstances.
 */
export const FORBIDDEN_AD_ROUTES: readonly string[] = ['/searching'];

/**
 * Validates that a Google AdSense Publisher Client ID matches official format (ca-pub-XXXXXXXXXXXXXXXX).
 */
export function isValidAdSenseClientId(clientId: string | undefined | null): boolean {
  if (!clientId) return false;
  return /^ca-pub-\d{10,20}$/.test(clientId.trim());
}

/**
 * Validates that a Google AdSense Ad Unit Slot ID is a real numeric slot identifier.
 */
export function isValidAdSenseSlotId(slotId: string | undefined | null): boolean {
  if (!slotId) return false;
  return /^\d{8,20}$/.test(slotId.trim());
}

/**
 * Returns the global AdSense configuration derived from environment variables.
 */
export function getAdSenseConfig() {
  const rawClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';
  const rawEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED;
  const nonPersonalized = process.env.NEXT_PUBLIC_ADSENSE_NON_PERSONALIZED !== 'false';

  const clientId = rawClientId.trim();
  const hasValidClient = isValidAdSenseClientId(clientId);
  const isEnabled = rawEnabled === 'false' ? false : hasValidClient;

  return {
    enabled: isEnabled,
    clientId: hasValidClient ? clientId : '',
    nonPersonalized,
  };
}

/**
 * Approved Ad Inventory Registry across all AREYOURARE pages.
 */
export const AD_PLACEMENT_REGISTRY: Record<AdPlacementId, AdPlacementSpec> = {
  landing_after_how_it_works: {
    id: 'landing_after_how_it_works',
    page: 'landing',
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_LANDING',
    slotId: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_LANDING || '').trim(),
    format: 'auto',
    fullWidthResponsive: true,
    minHeightMobilePx: 100,
    minHeightDesktopPx: 90,
    description: 'Landing Page — After How It Works section, before Sample Result',
  },
  birth_details_below_form: {
    id: 'birth_details_below_form',
    page: 'discover',
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_DISCOVER',
    slotId: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISCOVER || '').trim(),
    format: 'auto',
    fullWidthResponsive: true,
    minHeightMobilePx: 100,
    minHeightDesktopPx: 90,
    description: 'Birth Details Page — Below birth input form and primary CTA',
  },
  result_after_primary_card: {
    id: 'result_after_primary_card',
    page: 'result',
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_RESULT_PRIMARY',
    slotId: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT_PRIMARY || '').trim(),
    format: 'auto',
    fullWidthResponsive: true,
    minHeightMobilePx: 100,
    minHeightDesktopPx: 90,
    description: 'Result Page Ad #1 — After main discovery card and before detailed explanation',
  },
  result_below_share_controls: {
    id: 'result_below_share_controls',
    page: 'result',
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_RESULT_SHARE',
    slotId: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT_SHARE || '').trim(),
    format: 'auto',
    fullWidthResponsive: true,
    minHeightMobilePx: 100,
    minHeightDesktopPx: 90,
    description: 'Result Page Ad #2 — Below primary sharing controls',
  },
  how_it_works_after_content: {
    id: 'how_it_works_after_content',
    page: 'how-it-works',
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_HOW_IT_WORKS',
    slotId: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOW_IT_WORKS || '').trim(),
    format: 'auto',
    fullWidthResponsive: true,
    minHeightMobilePx: 100,
    minHeightDesktopPx: 90,
    description: 'How It Works Page — After core methodology explanation section',
  },
  faq_lower_content: {
    id: 'faq_lower_content',
    page: 'faq',
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_FAQ',
    slotId: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_FAQ || '').trim(),
    format: 'auto',
    fullWidthResponsive: true,
    minHeightMobilePx: 100,
    minHeightDesktopPx: 90,
    description: 'FAQ — Near the lower portion of the FAQ content',
  },
  privacy_lower_page: {
    id: 'privacy_lower_page',
    page: 'privacy',
    slotEnvKey: 'NEXT_PUBLIC_ADSENSE_SLOT_PRIVACY',
    slotId: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_PRIVACY || '').trim(),
    format: 'auto',
    fullWidthResponsive: true,
    minHeightMobilePx: 100,
    minHeightDesktopPx: 90,
    description: 'Privacy Page — Near the lower portion of the page',
  },
};

/**
 * Checks whether a specific ad placement has both a valid publisher client ID and slot ID.
 */
export function isPlacementConfigured(placementId: AdPlacementId): {
  isReady: boolean;
  clientId: string;
  slotId: string;
  spec: AdPlacementSpec;
  nonPersonalized: boolean;
} {
  const globalConfig = getAdSenseConfig();
  const spec = AD_PLACEMENT_REGISTRY[placementId];
  const slotId = spec?.slotId || '';
  const isReady = globalConfig.enabled && isValidAdSenseSlotId(slotId);

  return {
    isReady,
    clientId: globalConfig.clientId,
    slotId,
    spec,
    nonPersonalized: globalConfig.nonPersonalized,
  };
}

/**
 * Checks whether ads are permitted on a given pathname.
 */
export function isRouteAllowedForAds(pathname: string | null): boolean {
  if (!pathname) return true;
  for (const forbidden of FORBIDDEN_AD_ROUTES) {
    if (pathname === forbidden || pathname.startsWith(`${forbidden}/`)) {
      return false;
    }
  }
  return true;
}
