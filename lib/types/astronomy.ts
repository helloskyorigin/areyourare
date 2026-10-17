export type CelestialBodyName =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto';

export type HouseSystemType = 'placidus' | 'equal_from_ascendant' | 'porphyry' | 'whole_sign';

export interface CelestialBodyPosition {
  body: CelestialBodyName;
  longitude: number; // 0 to 360 deg
  latitude: number; // Ecliptic latitude in deg
  distanceAu: number;
  speedDegPerDay: number; // Apparent longitudinal speed in deg/day
  isRetrograde: boolean;
  sign: string;
  signDegree: number; // 0 to 30 deg
  formattedLongitude: string; // e.g. "12° 34' 56'' Leo"
}

export interface ChartAngles {
  ascendant: number; // 0 to 360 deg
  midheaven: number; // 0 to 360 deg (MC)
  descendant: number; // 0 to 360 deg (DC)
  nadir: number; // 0 to 360 deg (IC)
  formattedAscendant: string;
  formattedMidheaven: string;
}

export interface HouseCusps {
  system: HouseSystemType;
  cusps: number[]; // 12 cusp longitudes (1-indexed meaning cusps[0] is house 1)
  formattedCusps: string[];
}

export interface AngularSeparation {
  bodyA: string;
  bodyB: string;
  angleA: number;
  angleB: number;
  shortestArc: number; // 0 to 180 deg
  directionalSeparation: number; // 0 to 360 deg
}

export interface BirthChartResult {
  calculationVersion: 'v1';
  engine: {
    name: 'OUTLIER Deterministic Astronomy Engine';
    version: '1.0.0';
    provider: 'AstronomyEngine (VSOP87 / ELP2000)';
    license: 'MIT';
  };
  input: {
    localDate: string; // "YYYY-MM-DD"
    localTime: string; // "HH:mm"
    timezone: string;
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  time: {
    localIso: string;
    utcIso: string;
    julianDay: number;
    greenwichSiderealTimeHours: number;
    localSiderealTimeHours: number;
    localSiderealTimeDegrees: number;
    obliquityDeg: number;
  };
  planets: Record<CelestialBodyName, CelestialBodyPosition>;
  angles: ChartAngles;
  houses: HouseCusps;
  angularSeparations: AngularSeparation[];
  status: 'calculated';
}
