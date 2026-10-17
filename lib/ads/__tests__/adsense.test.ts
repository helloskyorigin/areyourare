import {
  AD_PLACEMENT_REGISTRY,
  FORBIDDEN_AD_ROUTES,
  getAdSenseConfig,
  isPlacementConfigured,
  isRouteAllowedForAds,
  isValidAdSenseClientId,
  isValidAdSenseSlotId,
} from '../config';

export interface AdSenseTestResult {
  id: string;
  name: string;
  passed: boolean;
  details?: string;
}

export function runAdSenseMonetizationTests(): AdSenseTestResult[] {
  const results: AdSenseTestResult[] = [];

  function check(id: string, name: string, fn: () => void) {
    try {
      fn();
      results.push({ id, name, passed: true });
    } catch (err: unknown) {
      results.push({
        id,
        name,
        passed: false,
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 1. Validate Client ID & Slot ID format validators
  check('ADS-01', 'Validates Google AdSense Client IDs and Slot IDs strictly', () => {
    if (!isValidAdSenseClientId('ca-pub-1234567890123456')) {
      throw new Error('Rejected valid ca-pub-1234567890123456 client ID');
    }
    if (isValidAdSenseClientId('pub-12345') || isValidAdSenseClientId('') || isValidAdSenseClientId('fake-id')) {
      throw new Error('Accepted invalid client ID');
    }
    if (!isValidAdSenseSlotId('9876543210')) {
      throw new Error('Rejected valid numeric slot ID');
    }
    if (isValidAdSenseSlotId('abc12345') || isValidAdSenseSlotId('123') || isValidAdSenseSlotId('')) {
      throw new Error('Accepted invalid slot ID');
    }
  });

  // 2. Searching page strictly blocked
  check('ADS-02', 'Searching route (/searching) strictly prohibits ads', () => {
    if (!FORBIDDEN_AD_ROUTES.includes('/searching')) {
      throw new Error('/searching is missing from FORBIDDEN_AD_ROUTES');
    }
    if (isRouteAllowedForAds('/searching') || isRouteAllowedForAds('/searching/step')) {
      throw new Error('isRouteAllowedForAds allowed /searching');
    }
    if (!isRouteAllowedForAds('/') || !isRouteAllowedForAds('/discover') || !isRouteAllowedForAds('/result')) {
      throw new Error('isRouteAllowedForAds blocked an approved route');
    }
  });

  // 3. Approved Ad Inventory limits per page
  check('ADS-03', 'Ad inventory respects strict per-page caps (Landing: 1, Discover: 1, Result: 2, Searching: 0)', () => {
    const specs = Object.values(AD_PLACEMENT_REGISTRY);
    const landingAds = specs.filter((s) => s.page === 'landing');
    const discoverAds = specs.filter((s) => s.page === 'discover');
    const resultAds = specs.filter((s) => s.page === 'result');

    if (landingAds.length !== 1) {
      throw new Error(`Expected 1 landing ad placement, found ${landingAds.length}`);
    }
    if (discoverAds.length !== 1) {
      throw new Error(`Expected 1 discover ad placement, found ${discoverAds.length}`);
    }
    if (resultAds.length !== 2) {
      throw new Error(`Expected maximum 2 result ad placements, found ${resultAds.length}`);
    }
  });

  // 4. Unconfigured state collapses cleanly
  check('ADS-04', 'Unconfigured AdSense environment defaults to disabled / collapsed state', () => {
    const config = getAdSenseConfig();
    if (!config.clientId && config.enabled) {
      throw new Error('AdSense reported enabled without a valid clientId');
    }
    const placement = isPlacementConfigured('landing_after_how_it_works');
    if (!placement.slotId && placement.isReady) {
      throw new Error('Placement reported ready without a valid slotId');
    }
    if (placement.spec.minHeightMobilePx < 90 || placement.spec.minHeightDesktopPx < 90) {
      throw new Error('Placement missing CLS reservation dimensions');
    }
  });

  return results;
}
