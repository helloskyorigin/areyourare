import { ReferencePopulationDataset } from '../types/rarity';
import { PATTERN_REGISTRY } from '../patterns/registry';
import { CONTINUOUS_FEATURE_REGISTRY } from '../patterns/continuous';

/**
 * Validates a reference dataset to ensure mathematical and structural integrity
 * across both binary patterns and continuous feature empirical distributions.
 */
export function validateReferenceDataset(dataset: ReferencePopulationDataset): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dataset.version) errors.push('Missing dataset version identifier.');
  if (!dataset.methodology) errors.push('Missing dataset methodology.');
  if (dataset.methodology?.validSamples <= 0) errors.push('validSamples must be greater than zero.');
  if (dataset.methodology?.totalSamples < dataset.methodology?.validSamples) {
    errors.push('totalSamples cannot be less than validSamples.');
  }

  const registeredIds = new Set(PATTERN_REGISTRY.map((p) => p.id));
  const datasetIds = Object.keys(dataset.patterns || {});

  if (datasetIds.length === 0) {
    errors.push('Dataset contains zero pattern frequency records.');
  }

  for (const id of datasetIds) {
    if (!registeredIds.has(id)) {
      errors.push(`Dataset contains unregistered pattern ID: ${id}`);
    }

    const stat = dataset.patterns[id];
    if (stat.matchingCount < 0) {
      errors.push(`Pattern ${id} has negative matchingCount.`);
    }
    if (stat.matchingCount > stat.validSampleSize) {
      errors.push(`Pattern ${id} matchingCount exceeds validSampleSize.`);
    }
    const expectedFreq = stat.matchingCount / stat.validSampleSize;
    if (Math.abs(stat.frequency - expectedFreq) > 0.000001) {
      errors.push(`Pattern ${id} frequency (${stat.frequency}) does not match matchingCount/validSampleSize.`);
    }
  }

  if (dataset.continuousFeatures) {
    const registeredFeatureIds = new Set(CONTINUOUS_FEATURE_REGISTRY.map((f) => f.id));
    for (const [fid, dist] of Object.entries(dataset.continuousFeatures)) {
      if (!registeredFeatureIds.has(fid)) {
        errors.push(`Dataset contains unregistered continuous feature ID: ${fid}`);
      }
      if (!Array.isArray(dist.quantiles) || dist.quantiles.length === 0) {
        errors.push(`Continuous feature ${fid} is missing quantile distribution points.`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Official Computational Reference Population Dataset (v1.1.0 / Continuous v1.2.0)
 * Generated directly from Phase 2 Astronomy Engine + Phase 3 Pattern & Continuous Feature Engine
 * over 100,000 deterministically sampled birth coordinates (seed: "outlier_global_reference_seed_2026_v1_1_0").
 */
export const REFERENCE_POPULATION_V1: ReferencePopulationDataset = {
  "version": "v1.1.0",
  "continuousDistributionVersion": "v1.2.0",
  "astronomyEngineVersion": "1.0.0",
  "patternEngineVersion": "v1",
  "patternRegistryVersion": "1.0",
  "generatedAt": "2026-10-06T04:20:13.242Z",
  "methodology": {
    "source": "AREYOURARE Computational Reference Sample (v1.1.0 / v1.2.0)",
    "seed": "outlier_global_reference_seed_2026_v1_1_0",
    "totalSamples": 100000,
    "validSamples": 100000,
    "invalidSamples": 0,
    "dateRange": {
      "start": "1940-01-01",
      "end": "2025-12-31"
    },
    "samplingMethod": "Uniform civil date/time distribution across 60 global coordinate anchors using FNV-1a/Xorshift32 PRNG",
    "geographicDistribution": "106 verified global coordinate anchors across all major continents and timezones"
  },
  "discoveryBreakdown": {
    "matchedPatternCharts": 55258,
    "matchedPatternPercent": 55.258,
    "continuousFeatureCharts": 44742,
    "continuousFeaturePercent": 44.742
  },
  "patterns": {
    "pat_solar_zenith_mc": {
      "patternId": "pat_solar_zenith_mc",
      "patternName": "Solar Midheaven Zenith Alignment",
      "category": "angular",
      "matchingCount": 519,
      "validSampleSize": 100000,
      "frequency": 0.00519,
      "frequencyPercent": 0.519,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_ascendant_conjunction": {
      "patternId": "pat_ascendant_conjunction",
      "patternName": "Ascendant Rising Planet Alignment",
      "category": "angular",
      "matchingCount": 5465,
      "validSampleSize": 100000,
      "frequency": 0.05465,
      "frequencyPercent": 5.465,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_meridian_opposition": {
      "patternId": "pat_meridian_opposition",
      "patternName": "Dual Axis Meridian Opposition",
      "category": "angular",
      "matchingCount": 377,
      "validSampleSize": 100000,
      "frequency": 0.00377,
      "frequencyPercent": 0.377,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_meridian_cross_conjunction": {
      "patternId": "pat_meridian_cross_conjunction",
      "patternName": "Four-Point Meridian Quadrant Alignment",
      "category": "angular",
      "matchingCount": 229,
      "validSampleSize": 100000,
      "frequency": 0.00229,
      "frequencyPercent": 0.22899999999999998,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_exact_cazimi": {
      "patternId": "pat_exact_cazimi",
      "patternName": "Heart of the Sun Cazimi Conjunction",
      "category": "aspect",
      "matchingCount": 2318,
      "validSampleSize": 100000,
      "frequency": 0.02318,
      "frequencyPercent": 2.318,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_triple_conjunction": {
      "patternId": "pat_triple_conjunction",
      "patternName": "Compact Triple Planetary Conjunction",
      "category": "aspect",
      "matchingCount": 4078,
      "validSampleSize": 100000,
      "frequency": 0.04078,
      "frequencyPercent": 4.077999999999999,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_exact_opposition": {
      "patternId": "pat_exact_opposition",
      "patternName": "Precise Diurnal Syzygy Opposition",
      "category": "aspect",
      "matchingCount": 6300,
      "validSampleSize": 100000,
      "frequency": 0.063,
      "frequencyPercent": 6.3,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_exact_trine_pair": {
      "patternId": "pat_exact_trine_pair",
      "patternName": "Exact Harmonic Trine Alignment",
      "category": "aspect",
      "matchingCount": 13569,
      "validSampleSize": 100000,
      "frequency": 0.13569,
      "frequencyPercent": 13.569,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_grand_trine": {
      "patternId": "pat_grand_trine",
      "patternName": "Grand Trine Equilateral Equilibrium",
      "category": "structural",
      "matchingCount": 1190,
      "validSampleSize": 100000,
      "frequency": 0.0119,
      "frequencyPercent": 1.1900000000000002,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_t_square": {
      "patternId": "pat_t_square",
      "patternName": "T-Square Tension Focal Axis",
      "category": "structural",
      "matchingCount": 3545,
      "validSampleSize": 100000,
      "frequency": 0.03545,
      "frequencyPercent": 3.5450000000000004,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_grand_cross": {
      "patternId": "pat_grand_cross",
      "patternName": "Grand Cross Quadrant Tension Grid",
      "category": "structural",
      "matchingCount": 95,
      "validSampleSize": 100000,
      "frequency": 0.00095,
      "frequencyPercent": 0.095,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_yod_finger_of_fate": {
      "patternId": "pat_yod_finger_of_fate",
      "patternName": "Harmonic Yod Inconjunct Geometry",
      "category": "structural",
      "matchingCount": 2953,
      "validSampleSize": 100000,
      "frequency": 0.02953,
      "frequencyPercent": 2.9530000000000003,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_kite_formation": {
      "patternId": "pat_kite_formation",
      "patternName": "Symmetrical Kite Alignment",
      "category": "structural",
      "matchingCount": 156,
      "validSampleSize": 100000,
      "frequency": 0.00156,
      "frequencyPercent": 0.156,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_stellium_cluster": {
      "patternId": "pat_stellium_cluster",
      "patternName": "Four-Body Stellium Cluster",
      "category": "planetary",
      "matchingCount": 6616,
      "validSampleSize": 100000,
      "frequency": 0.06616,
      "frequencyPercent": 6.616,
      "status": "ADEQUATE_SUPPORT"
    },
    "pat_stationary_node": {
      "patternId": "pat_stationary_node",
      "patternName": "Stationary Planetary Pivot Node",
      "category": "planetary",
      "matchingCount": 29151,
      "validSampleSize": 100000,
      "frequency": 0.29151,
      "frequencyPercent": 29.151,
      "status": "ADEQUATE_SUPPORT"
    }
  },
  "continuousFeatures": {
    "feat_solar_meridian_alignment": {
      "featureId": "feat_solar_meridian_alignment",
      "featureName": "Solar Meridian Axis Alignment",
      "category": "angular",
      "unit": "degrees",
      "idealTarget": 0,
      "validSampleSize": 100000,
      "min": 0.000336,
      "max": 89.996668,
      "mean": 44.972396,
      "median": 44.904969,
      "p01": 0.948617,
      "p05": 4.48918,
      "p10": 8.993043,
      "p25": 22.532617,
      "p75": 67.530085,
      "p90": 80.909226,
      "quantiles": [
        {
          "maxDistance": 0.010459,
          "matchingCount": 9,
          "cumulativePercent": 0.009
        },
        {
          "maxDistance": 0.051888,
          "matchingCount": 49,
          "cumulativePercent": 0.049
        },
        {
          "maxDistance": 0.099903,
          "matchingCount": 100,
          "cumulativePercent": 0.1
        },
        {
          "maxDistance": 0.187584,
          "matchingCount": 200,
          "cumulativePercent": 0.2
        },
        {
          "maxDistance": 0.285461,
          "matchingCount": 299,
          "cumulativePercent": 0.299
        },
        {
          "maxDistance": 0.396342,
          "matchingCount": 400,
          "cumulativePercent": 0.4
        },
        {
          "maxDistance": 0.48211,
          "matchingCount": 500,
          "cumulativePercent": 0.5
        },
        {
          "maxDistance": 0.569104,
          "matchingCount": 599,
          "cumulativePercent": 0.599
        },
        {
          "maxDistance": 0.651155,
          "matchingCount": 700,
          "cumulativePercent": 0.7
        },
        {
          "maxDistance": 0.753008,
          "matchingCount": 799,
          "cumulativePercent": 0.799
        },
        {
          "maxDistance": 0.850247,
          "matchingCount": 900,
          "cumulativePercent": 0.9
        },
        {
          "maxDistance": 0.948617,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 1.160153,
          "matchingCount": 1250,
          "cumulativePercent": 1.25
        },
        {
          "maxDistance": 1.408518,
          "matchingCount": 1499,
          "cumulativePercent": 1.499
        },
        {
          "maxDistance": 1.629503,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 1.836991,
          "matchingCount": 1999,
          "cumulativePercent": 1.999
        },
        {
          "maxDistance": 2.257009,
          "matchingCount": 2499,
          "cumulativePercent": 2.499
        },
        {
          "maxDistance": 2.739434,
          "matchingCount": 2999,
          "cumulativePercent": 2.999
        },
        {
          "maxDistance": 3.201524,
          "matchingCount": 3500,
          "cumulativePercent": 3.5
        },
        {
          "maxDistance": 3.616349,
          "matchingCount": 4000,
          "cumulativePercent": 4
        },
        {
          "maxDistance": 4.048702,
          "matchingCount": 4500,
          "cumulativePercent": 4.5
        },
        {
          "maxDistance": 4.48918,
          "matchingCount": 5000,
          "cumulativePercent": 5
        },
        {
          "maxDistance": 5.402645,
          "matchingCount": 6000,
          "cumulativePercent": 6
        },
        {
          "maxDistance": 6.284885,
          "matchingCount": 7000,
          "cumulativePercent": 7
        },
        {
          "maxDistance": 7.201653,
          "matchingCount": 7999,
          "cumulativePercent": 7.999
        },
        {
          "maxDistance": 8.096366,
          "matchingCount": 8999,
          "cumulativePercent": 8.999
        },
        {
          "maxDistance": 8.993043,
          "matchingCount": 9999,
          "cumulativePercent": 9.999
        },
        {
          "maxDistance": 9.892497,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 10.809399,
          "matchingCount": 11999,
          "cumulativePercent": 11.999
        },
        {
          "maxDistance": 11.709423,
          "matchingCount": 12999,
          "cumulativePercent": 12.999
        },
        {
          "maxDistance": 12.6256,
          "matchingCount": 14000,
          "cumulativePercent": 14
        },
        {
          "maxDistance": 13.496441,
          "matchingCount": 15000,
          "cumulativePercent": 15
        },
        {
          "maxDistance": 14.388979,
          "matchingCount": 16000,
          "cumulativePercent": 16
        },
        {
          "maxDistance": 15.324856,
          "matchingCount": 16999,
          "cumulativePercent": 16.999
        },
        {
          "maxDistance": 16.190117,
          "matchingCount": 18000,
          "cumulativePercent": 18
        },
        {
          "maxDistance": 17.145049,
          "matchingCount": 19000,
          "cumulativePercent": 19
        },
        {
          "maxDistance": 18.034224,
          "matchingCount": 19999,
          "cumulativePercent": 19.999
        },
        {
          "maxDistance": 18.931436,
          "matchingCount": 21000,
          "cumulativePercent": 21
        },
        {
          "maxDistance": 19.860165,
          "matchingCount": 21999,
          "cumulativePercent": 21.999
        },
        {
          "maxDistance": 20.76044,
          "matchingCount": 23000,
          "cumulativePercent": 23
        },
        {
          "maxDistance": 21.640052,
          "matchingCount": 24000,
          "cumulativePercent": 24
        },
        {
          "maxDistance": 22.532617,
          "matchingCount": 24999,
          "cumulativePercent": 24.999
        },
        {
          "maxDistance": 23.450344,
          "matchingCount": 26000,
          "cumulativePercent": 26
        },
        {
          "maxDistance": 24.332364,
          "matchingCount": 27000,
          "cumulativePercent": 27
        },
        {
          "maxDistance": 25.271097,
          "matchingCount": 28000,
          "cumulativePercent": 28
        },
        {
          "maxDistance": 26.153295,
          "matchingCount": 28999,
          "cumulativePercent": 28.999
        },
        {
          "maxDistance": 27.030107,
          "matchingCount": 29999,
          "cumulativePercent": 29.999
        },
        {
          "maxDistance": 27.962431,
          "matchingCount": 31000,
          "cumulativePercent": 31
        },
        {
          "maxDistance": 28.797214,
          "matchingCount": 31999,
          "cumulativePercent": 31.999
        },
        {
          "maxDistance": 29.743631,
          "matchingCount": 32999,
          "cumulativePercent": 32.999
        },
        {
          "maxDistance": 30.59871,
          "matchingCount": 33999,
          "cumulativePercent": 33.999
        },
        {
          "maxDistance": 31.512847,
          "matchingCount": 34999,
          "cumulativePercent": 34.999
        },
        {
          "maxDistance": 32.366497,
          "matchingCount": 36000,
          "cumulativePercent": 36
        },
        {
          "maxDistance": 33.255952,
          "matchingCount": 37000,
          "cumulativePercent": 37
        },
        {
          "maxDistance": 34.138691,
          "matchingCount": 38000,
          "cumulativePercent": 38
        },
        {
          "maxDistance": 35.074966,
          "matchingCount": 38999,
          "cumulativePercent": 38.999
        },
        {
          "maxDistance": 35.945526,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 36.805352,
          "matchingCount": 40999,
          "cumulativePercent": 40.999
        },
        {
          "maxDistance": 37.693519,
          "matchingCount": 41999,
          "cumulativePercent": 41.999
        },
        {
          "maxDistance": 38.637257,
          "matchingCount": 42999,
          "cumulativePercent": 42.999
        },
        {
          "maxDistance": 39.511052,
          "matchingCount": 43999,
          "cumulativePercent": 43.999
        },
        {
          "maxDistance": 40.398327,
          "matchingCount": 44999,
          "cumulativePercent": 44.999
        },
        {
          "maxDistance": 41.32967,
          "matchingCount": 45999,
          "cumulativePercent": 45.999
        },
        {
          "maxDistance": 42.237182,
          "matchingCount": 46999,
          "cumulativePercent": 46.999
        },
        {
          "maxDistance": 43.130518,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 44.019308,
          "matchingCount": 49000,
          "cumulativePercent": 49
        },
        {
          "maxDistance": 44.904969,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 46.712899,
          "matchingCount": 52000,
          "cumulativePercent": 52
        },
        {
          "maxDistance": 48.459922,
          "matchingCount": 54000,
          "cumulativePercent": 54
        },
        {
          "maxDistance": 50.201317,
          "matchingCount": 56000,
          "cumulativePercent": 56
        },
        {
          "maxDistance": 52.056275,
          "matchingCount": 58000,
          "cumulativePercent": 58
        },
        {
          "maxDistance": 53.860421,
          "matchingCount": 60000,
          "cumulativePercent": 60
        },
        {
          "maxDistance": 55.725922,
          "matchingCount": 61999,
          "cumulativePercent": 61.999
        },
        {
          "maxDistance": 57.528851,
          "matchingCount": 63999,
          "cumulativePercent": 63.999
        },
        {
          "maxDistance": 59.324734,
          "matchingCount": 66000,
          "cumulativePercent": 66
        },
        {
          "maxDistance": 61.204467,
          "matchingCount": 67999,
          "cumulativePercent": 67.999
        },
        {
          "maxDistance": 62.982328,
          "matchingCount": 69999,
          "cumulativePercent": 69.999
        },
        {
          "maxDistance": 64.737355,
          "matchingCount": 71999,
          "cumulativePercent": 71.999
        },
        {
          "maxDistance": 66.573306,
          "matchingCount": 74000,
          "cumulativePercent": 74
        },
        {
          "maxDistance": 68.400005,
          "matchingCount": 76000,
          "cumulativePercent": 76
        },
        {
          "maxDistance": 70.191952,
          "matchingCount": 78000,
          "cumulativePercent": 78
        },
        {
          "maxDistance": 71.950263,
          "matchingCount": 80000,
          "cumulativePercent": 80
        },
        {
          "maxDistance": 73.791809,
          "matchingCount": 82000,
          "cumulativePercent": 82
        },
        {
          "maxDistance": 75.56193,
          "matchingCount": 83999,
          "cumulativePercent": 83.999
        },
        {
          "maxDistance": 77.405797,
          "matchingCount": 86000,
          "cumulativePercent": 86
        },
        {
          "maxDistance": 79.113949,
          "matchingCount": 88000,
          "cumulativePercent": 88
        },
        {
          "maxDistance": 80.909226,
          "matchingCount": 89999,
          "cumulativePercent": 89.999
        },
        {
          "maxDistance": 82.810594,
          "matchingCount": 92000,
          "cumulativePercent": 92
        },
        {
          "maxDistance": 84.638683,
          "matchingCount": 93999,
          "cumulativePercent": 93.999
        },
        {
          "maxDistance": 86.399959,
          "matchingCount": 96000,
          "cumulativePercent": 96
        },
        {
          "maxDistance": 88.182207,
          "matchingCount": 98000,
          "cumulativePercent": 98
        },
        {
          "maxDistance": 89.996668,
          "matchingCount": 100000,
          "cumulativePercent": 100
        }
      ]
    },
    "feat_lunar_horizon_alignment": {
      "featureId": "feat_lunar_horizon_alignment",
      "featureName": "Lunar Horizon Axis Alignment",
      "category": "angular",
      "unit": "degrees",
      "idealTarget": 0,
      "validSampleSize": 100000,
      "min": 0.001336,
      "max": 89.994652,
      "mean": 44.921223,
      "median": 44.989221,
      "p01": 0.888897,
      "p05": 4.442596,
      "p10": 8.875109,
      "p25": 22.413439,
      "p75": 67.407505,
      "p90": 80.852068,
      "quantiles": [
        {
          "maxDistance": 0.007111,
          "matchingCount": 9,
          "cumulativePercent": 0.009
        },
        {
          "maxDistance": 0.036941,
          "matchingCount": 50,
          "cumulativePercent": 0.05
        },
        {
          "maxDistance": 0.073022,
          "matchingCount": 100,
          "cumulativePercent": 0.1
        },
        {
          "maxDistance": 0.171914,
          "matchingCount": 200,
          "cumulativePercent": 0.2
        },
        {
          "maxDistance": 0.260267,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 0.348755,
          "matchingCount": 399,
          "cumulativePercent": 0.399
        },
        {
          "maxDistance": 0.442206,
          "matchingCount": 499,
          "cumulativePercent": 0.499
        },
        {
          "maxDistance": 0.539186,
          "matchingCount": 599,
          "cumulativePercent": 0.599
        },
        {
          "maxDistance": 0.631242,
          "matchingCount": 699,
          "cumulativePercent": 0.699
        },
        {
          "maxDistance": 0.722755,
          "matchingCount": 800,
          "cumulativePercent": 0.8
        },
        {
          "maxDistance": 0.803636,
          "matchingCount": 899,
          "cumulativePercent": 0.899
        },
        {
          "maxDistance": 0.888897,
          "matchingCount": 1000,
          "cumulativePercent": 1
        },
        {
          "maxDistance": 1.101798,
          "matchingCount": 1250,
          "cumulativePercent": 1.25
        },
        {
          "maxDistance": 1.302712,
          "matchingCount": 1499,
          "cumulativePercent": 1.499
        },
        {
          "maxDistance": 1.533745,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 1.774657,
          "matchingCount": 2000,
          "cumulativePercent": 2
        },
        {
          "maxDistance": 2.262811,
          "matchingCount": 2499,
          "cumulativePercent": 2.499
        },
        {
          "maxDistance": 2.689819,
          "matchingCount": 2999,
          "cumulativePercent": 2.999
        },
        {
          "maxDistance": 3.163535,
          "matchingCount": 3500,
          "cumulativePercent": 3.5
        },
        {
          "maxDistance": 3.61247,
          "matchingCount": 3999,
          "cumulativePercent": 3.999
        },
        {
          "maxDistance": 4.009417,
          "matchingCount": 4500,
          "cumulativePercent": 4.5
        },
        {
          "maxDistance": 4.442596,
          "matchingCount": 4999,
          "cumulativePercent": 4.999
        },
        {
          "maxDistance": 5.352109,
          "matchingCount": 6000,
          "cumulativePercent": 6
        },
        {
          "maxDistance": 6.257068,
          "matchingCount": 6999,
          "cumulativePercent": 6.999
        },
        {
          "maxDistance": 7.109539,
          "matchingCount": 7999,
          "cumulativePercent": 7.999
        },
        {
          "maxDistance": 7.99968,
          "matchingCount": 8999,
          "cumulativePercent": 8.999
        },
        {
          "maxDistance": 8.875109,
          "matchingCount": 10000,
          "cumulativePercent": 10
        },
        {
          "maxDistance": 9.790818,
          "matchingCount": 10999,
          "cumulativePercent": 10.999
        },
        {
          "maxDistance": 10.68008,
          "matchingCount": 12000,
          "cumulativePercent": 12
        },
        {
          "maxDistance": 11.561762,
          "matchingCount": 12999,
          "cumulativePercent": 12.999
        },
        {
          "maxDistance": 12.440509,
          "matchingCount": 13999,
          "cumulativePercent": 13.999
        },
        {
          "maxDistance": 13.355087,
          "matchingCount": 15000,
          "cumulativePercent": 15
        },
        {
          "maxDistance": 14.249525,
          "matchingCount": 16000,
          "cumulativePercent": 16
        },
        {
          "maxDistance": 15.145748,
          "matchingCount": 17000,
          "cumulativePercent": 17
        },
        {
          "maxDistance": 16.032642,
          "matchingCount": 17999,
          "cumulativePercent": 17.999
        },
        {
          "maxDistance": 16.925181,
          "matchingCount": 18999,
          "cumulativePercent": 18.999
        },
        {
          "maxDistance": 17.83412,
          "matchingCount": 20000,
          "cumulativePercent": 20
        },
        {
          "maxDistance": 18.762324,
          "matchingCount": 20999,
          "cumulativePercent": 20.999
        },
        {
          "maxDistance": 19.695467,
          "matchingCount": 21999,
          "cumulativePercent": 21.999
        },
        {
          "maxDistance": 20.598365,
          "matchingCount": 22999,
          "cumulativePercent": 22.999
        },
        {
          "maxDistance": 21.501767,
          "matchingCount": 23999,
          "cumulativePercent": 23.999
        },
        {
          "maxDistance": 22.413439,
          "matchingCount": 25000,
          "cumulativePercent": 25
        },
        {
          "maxDistance": 23.364134,
          "matchingCount": 26000,
          "cumulativePercent": 26
        },
        {
          "maxDistance": 24.318038,
          "matchingCount": 27000,
          "cumulativePercent": 27
        },
        {
          "maxDistance": 25.211667,
          "matchingCount": 28000,
          "cumulativePercent": 28
        },
        {
          "maxDistance": 26.094114,
          "matchingCount": 28999,
          "cumulativePercent": 28.999
        },
        {
          "maxDistance": 27.041306,
          "matchingCount": 30000,
          "cumulativePercent": 30
        },
        {
          "maxDistance": 27.922349,
          "matchingCount": 30999,
          "cumulativePercent": 30.999
        },
        {
          "maxDistance": 28.837755,
          "matchingCount": 31999,
          "cumulativePercent": 31.999
        },
        {
          "maxDistance": 29.735223,
          "matchingCount": 33000,
          "cumulativePercent": 33
        },
        {
          "maxDistance": 30.607032,
          "matchingCount": 34000,
          "cumulativePercent": 34
        },
        {
          "maxDistance": 31.519264,
          "matchingCount": 34999,
          "cumulativePercent": 34.999
        },
        {
          "maxDistance": 32.431435,
          "matchingCount": 35999,
          "cumulativePercent": 35.999
        },
        {
          "maxDistance": 33.362269,
          "matchingCount": 37000,
          "cumulativePercent": 37
        },
        {
          "maxDistance": 34.234181,
          "matchingCount": 37999,
          "cumulativePercent": 37.999
        },
        {
          "maxDistance": 35.142843,
          "matchingCount": 39000,
          "cumulativePercent": 39
        },
        {
          "maxDistance": 36.011001,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 36.903114,
          "matchingCount": 41000,
          "cumulativePercent": 41
        },
        {
          "maxDistance": 37.816886,
          "matchingCount": 41999,
          "cumulativePercent": 41.999
        },
        {
          "maxDistance": 38.710637,
          "matchingCount": 43000,
          "cumulativePercent": 43
        },
        {
          "maxDistance": 39.628686,
          "matchingCount": 43999,
          "cumulativePercent": 43.999
        },
        {
          "maxDistance": 40.516588,
          "matchingCount": 45000,
          "cumulativePercent": 45
        },
        {
          "maxDistance": 41.446704,
          "matchingCount": 46000,
          "cumulativePercent": 46
        },
        {
          "maxDistance": 42.347231,
          "matchingCount": 46999,
          "cumulativePercent": 46.999
        },
        {
          "maxDistance": 43.180134,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 44.088259,
          "matchingCount": 48999,
          "cumulativePercent": 48.999
        },
        {
          "maxDistance": 44.989221,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 46.736342,
          "matchingCount": 52000,
          "cumulativePercent": 52
        },
        {
          "maxDistance": 48.501907,
          "matchingCount": 54000,
          "cumulativePercent": 54
        },
        {
          "maxDistance": 50.263093,
          "matchingCount": 55999,
          "cumulativePercent": 55.999
        },
        {
          "maxDistance": 52.034719,
          "matchingCount": 57999,
          "cumulativePercent": 57.999
        },
        {
          "maxDistance": 53.850363,
          "matchingCount": 60000,
          "cumulativePercent": 60
        },
        {
          "maxDistance": 55.617089,
          "matchingCount": 61999,
          "cumulativePercent": 61.999
        },
        {
          "maxDistance": 57.416254,
          "matchingCount": 64000,
          "cumulativePercent": 64
        },
        {
          "maxDistance": 59.247042,
          "matchingCount": 66000,
          "cumulativePercent": 66
        },
        {
          "maxDistance": 61.035512,
          "matchingCount": 68000,
          "cumulativePercent": 68
        },
        {
          "maxDistance": 62.887425,
          "matchingCount": 70000,
          "cumulativePercent": 70
        },
        {
          "maxDistance": 64.642191,
          "matchingCount": 71999,
          "cumulativePercent": 71.999
        },
        {
          "maxDistance": 66.498677,
          "matchingCount": 73999,
          "cumulativePercent": 73.999
        },
        {
          "maxDistance": 68.292688,
          "matchingCount": 76000,
          "cumulativePercent": 76
        },
        {
          "maxDistance": 70.060081,
          "matchingCount": 78000,
          "cumulativePercent": 78
        },
        {
          "maxDistance": 71.798158,
          "matchingCount": 80000,
          "cumulativePercent": 80
        },
        {
          "maxDistance": 73.612295,
          "matchingCount": 82000,
          "cumulativePercent": 82
        },
        {
          "maxDistance": 75.508653,
          "matchingCount": 84000,
          "cumulativePercent": 84
        },
        {
          "maxDistance": 77.265223,
          "matchingCount": 85999,
          "cumulativePercent": 85.999
        },
        {
          "maxDistance": 79.055912,
          "matchingCount": 87999,
          "cumulativePercent": 87.999
        },
        {
          "maxDistance": 80.852068,
          "matchingCount": 90000,
          "cumulativePercent": 90
        },
        {
          "maxDistance": 82.76549,
          "matchingCount": 91999,
          "cumulativePercent": 91.999
        },
        {
          "maxDistance": 84.5391,
          "matchingCount": 94000,
          "cumulativePercent": 94
        },
        {
          "maxDistance": 86.339479,
          "matchingCount": 95999,
          "cumulativePercent": 95.999
        },
        {
          "maxDistance": 88.146118,
          "matchingCount": 98000,
          "cumulativePercent": 98
        },
        {
          "maxDistance": 89.994652,
          "matchingCount": 100000,
          "cumulativePercent": 100
        }
      ]
    },
    "feat_ascendant_alignment": {
      "featureId": "feat_ascendant_alignment",
      "featureName": "Ascendant Rising Alignment",
      "category": "angular",
      "unit": "degrees",
      "idealTarget": 0,
      "validSampleSize": 100000,
      "min": 0.000215,
      "max": 139.815091,
      "mean": 20.50378,
      "median": 13.257162,
      "p01": 0.181468,
      "p05": 0.907093,
      "p10": 1.900162,
      "p25": 5.25699,
      "p75": 28.330253,
      "p90": 50.667807,
      "quantiles": [
        {
          "maxDistance": 0.002073,
          "matchingCount": 10,
          "cumulativePercent": 0.01
        },
        {
          "maxDistance": 0.008365,
          "matchingCount": 50,
          "cumulativePercent": 0.05
        },
        {
          "maxDistance": 0.01724,
          "matchingCount": 99,
          "cumulativePercent": 0.099
        },
        {
          "maxDistance": 0.037075,
          "matchingCount": 200,
          "cumulativePercent": 0.2
        },
        {
          "maxDistance": 0.057429,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 0.075014,
          "matchingCount": 399,
          "cumulativePercent": 0.399
        },
        {
          "maxDistance": 0.091311,
          "matchingCount": 500,
          "cumulativePercent": 0.5
        },
        {
          "maxDistance": 0.1102,
          "matchingCount": 599,
          "cumulativePercent": 0.599
        },
        {
          "maxDistance": 0.128425,
          "matchingCount": 699,
          "cumulativePercent": 0.699
        },
        {
          "maxDistance": 0.147542,
          "matchingCount": 800,
          "cumulativePercent": 0.8
        },
        {
          "maxDistance": 0.163315,
          "matchingCount": 899,
          "cumulativePercent": 0.899
        },
        {
          "maxDistance": 0.181468,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 0.228212,
          "matchingCount": 1250,
          "cumulativePercent": 1.25
        },
        {
          "maxDistance": 0.27295,
          "matchingCount": 1500,
          "cumulativePercent": 1.5
        },
        {
          "maxDistance": 0.315525,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 0.353399,
          "matchingCount": 1999,
          "cumulativePercent": 1.999
        },
        {
          "maxDistance": 0.451425,
          "matchingCount": 2500,
          "cumulativePercent": 2.5
        },
        {
          "maxDistance": 0.538411,
          "matchingCount": 2999,
          "cumulativePercent": 2.999
        },
        {
          "maxDistance": 0.632829,
          "matchingCount": 3500,
          "cumulativePercent": 3.5
        },
        {
          "maxDistance": 0.725924,
          "matchingCount": 4000,
          "cumulativePercent": 4
        },
        {
          "maxDistance": 0.812983,
          "matchingCount": 4500,
          "cumulativePercent": 4.5
        },
        {
          "maxDistance": 0.907093,
          "matchingCount": 4999,
          "cumulativePercent": 4.999
        },
        {
          "maxDistance": 1.091712,
          "matchingCount": 5999,
          "cumulativePercent": 5.999
        },
        {
          "maxDistance": 1.288629,
          "matchingCount": 7000,
          "cumulativePercent": 7
        },
        {
          "maxDistance": 1.489041,
          "matchingCount": 7999,
          "cumulativePercent": 7.999
        },
        {
          "maxDistance": 1.696452,
          "matchingCount": 8999,
          "cumulativePercent": 8.999
        },
        {
          "maxDistance": 1.900162,
          "matchingCount": 9999,
          "cumulativePercent": 9.999
        },
        {
          "maxDistance": 2.108152,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 2.30971,
          "matchingCount": 11999,
          "cumulativePercent": 11.999
        },
        {
          "maxDistance": 2.514559,
          "matchingCount": 13000,
          "cumulativePercent": 13
        },
        {
          "maxDistance": 2.727055,
          "matchingCount": 14000,
          "cumulativePercent": 14
        },
        {
          "maxDistance": 2.945553,
          "matchingCount": 14999,
          "cumulativePercent": 14.999
        },
        {
          "maxDistance": 3.162549,
          "matchingCount": 15999,
          "cumulativePercent": 15.999
        },
        {
          "maxDistance": 3.375828,
          "matchingCount": 16999,
          "cumulativePercent": 16.999
        },
        {
          "maxDistance": 3.594325,
          "matchingCount": 18000,
          "cumulativePercent": 18
        },
        {
          "maxDistance": 3.811316,
          "matchingCount": 18999,
          "cumulativePercent": 18.999
        },
        {
          "maxDistance": 4.054386,
          "matchingCount": 19999,
          "cumulativePercent": 19.999
        },
        {
          "maxDistance": 4.289489,
          "matchingCount": 20999,
          "cumulativePercent": 20.999
        },
        {
          "maxDistance": 4.524721,
          "matchingCount": 21999,
          "cumulativePercent": 21.999
        },
        {
          "maxDistance": 4.761843,
          "matchingCount": 22999,
          "cumulativePercent": 22.999
        },
        {
          "maxDistance": 5.002672,
          "matchingCount": 23999,
          "cumulativePercent": 23.999
        },
        {
          "maxDistance": 5.25699,
          "matchingCount": 24999,
          "cumulativePercent": 24.999
        },
        {
          "maxDistance": 5.523905,
          "matchingCount": 25999,
          "cumulativePercent": 25.999
        },
        {
          "maxDistance": 5.787931,
          "matchingCount": 26999,
          "cumulativePercent": 26.999
        },
        {
          "maxDistance": 6.050384,
          "matchingCount": 27999,
          "cumulativePercent": 27.999
        },
        {
          "maxDistance": 6.307923,
          "matchingCount": 28999,
          "cumulativePercent": 28.999
        },
        {
          "maxDistance": 6.557081,
          "matchingCount": 30000,
          "cumulativePercent": 30
        },
        {
          "maxDistance": 6.833944,
          "matchingCount": 31000,
          "cumulativePercent": 31
        },
        {
          "maxDistance": 7.104428,
          "matchingCount": 31999,
          "cumulativePercent": 31.999
        },
        {
          "maxDistance": 7.385789,
          "matchingCount": 33000,
          "cumulativePercent": 33
        },
        {
          "maxDistance": 7.683797,
          "matchingCount": 34000,
          "cumulativePercent": 34
        },
        {
          "maxDistance": 7.990282,
          "matchingCount": 34999,
          "cumulativePercent": 34.999
        },
        {
          "maxDistance": 8.286239,
          "matchingCount": 35999,
          "cumulativePercent": 35.999
        },
        {
          "maxDistance": 8.58766,
          "matchingCount": 37000,
          "cumulativePercent": 37
        },
        {
          "maxDistance": 8.90679,
          "matchingCount": 38000,
          "cumulativePercent": 38
        },
        {
          "maxDistance": 9.222125,
          "matchingCount": 38999,
          "cumulativePercent": 38.999
        },
        {
          "maxDistance": 9.558311,
          "matchingCount": 39999,
          "cumulativePercent": 39.999
        },
        {
          "maxDistance": 9.892192,
          "matchingCount": 40999,
          "cumulativePercent": 40.999
        },
        {
          "maxDistance": 10.249544,
          "matchingCount": 41999,
          "cumulativePercent": 41.999
        },
        {
          "maxDistance": 10.583271,
          "matchingCount": 43000,
          "cumulativePercent": 43
        },
        {
          "maxDistance": 10.936761,
          "matchingCount": 44000,
          "cumulativePercent": 44
        },
        {
          "maxDistance": 11.308509,
          "matchingCount": 45000,
          "cumulativePercent": 45
        },
        {
          "maxDistance": 11.698675,
          "matchingCount": 45999,
          "cumulativePercent": 45.999
        },
        {
          "maxDistance": 12.075386,
          "matchingCount": 46999,
          "cumulativePercent": 46.999
        },
        {
          "maxDistance": 12.451755,
          "matchingCount": 48000,
          "cumulativePercent": 48
        },
        {
          "maxDistance": 12.854217,
          "matchingCount": 49000,
          "cumulativePercent": 49
        },
        {
          "maxDistance": 13.257162,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 14.077882,
          "matchingCount": 52000,
          "cumulativePercent": 52
        },
        {
          "maxDistance": 14.938464,
          "matchingCount": 53999,
          "cumulativePercent": 53.999
        },
        {
          "maxDistance": 15.86552,
          "matchingCount": 56000,
          "cumulativePercent": 56
        },
        {
          "maxDistance": 16.857576,
          "matchingCount": 57999,
          "cumulativePercent": 57.999
        },
        {
          "maxDistance": 17.884613,
          "matchingCount": 59999,
          "cumulativePercent": 59.999
        },
        {
          "maxDistance": 18.961538,
          "matchingCount": 62000,
          "cumulativePercent": 62
        },
        {
          "maxDistance": 20.118478,
          "matchingCount": 63999,
          "cumulativePercent": 63.999
        },
        {
          "maxDistance": 21.38529,
          "matchingCount": 66000,
          "cumulativePercent": 66
        },
        {
          "maxDistance": 22.677396,
          "matchingCount": 68000,
          "cumulativePercent": 68
        },
        {
          "maxDistance": 24.125601,
          "matchingCount": 69999,
          "cumulativePercent": 69.999
        },
        {
          "maxDistance": 25.701027,
          "matchingCount": 72000,
          "cumulativePercent": 72
        },
        {
          "maxDistance": 27.350969,
          "matchingCount": 74000,
          "cumulativePercent": 74
        },
        {
          "maxDistance": 29.339539,
          "matchingCount": 75999,
          "cumulativePercent": 75.999
        },
        {
          "maxDistance": 31.468394,
          "matchingCount": 78000,
          "cumulativePercent": 78
        },
        {
          "maxDistance": 33.918253,
          "matchingCount": 79999,
          "cumulativePercent": 79.999
        },
        {
          "maxDistance": 36.528465,
          "matchingCount": 81999,
          "cumulativePercent": 81.999
        },
        {
          "maxDistance": 39.432424,
          "matchingCount": 83999,
          "cumulativePercent": 83.999
        },
        {
          "maxDistance": 42.594484,
          "matchingCount": 85999,
          "cumulativePercent": 85.999
        },
        {
          "maxDistance": 46.416282,
          "matchingCount": 87999,
          "cumulativePercent": 87.999
        },
        {
          "maxDistance": 50.667807,
          "matchingCount": 89999,
          "cumulativePercent": 89.999
        },
        {
          "maxDistance": 55.873856,
          "matchingCount": 91999,
          "cumulativePercent": 91.999
        },
        {
          "maxDistance": 62.359681,
          "matchingCount": 93999,
          "cumulativePercent": 93.999
        },
        {
          "maxDistance": 70.647931,
          "matchingCount": 96000,
          "cumulativePercent": 96
        },
        {
          "maxDistance": 83.525851,
          "matchingCount": 97999,
          "cumulativePercent": 97.999
        },
        {
          "maxDistance": 139.815091,
          "matchingCount": 99999,
          "cumulativePercent": 99.999
        }
      ]
    },
    "feat_midheaven_alignment": {
      "featureId": "feat_midheaven_alignment",
      "featureName": "Midheaven Zenith Alignment",
      "category": "angular",
      "unit": "degrees",
      "idealTarget": 0,
      "validSampleSize": 100000,
      "min": 0.000206,
      "max": 142.213664,
      "mean": 20.761148,
      "median": 13.346246,
      "p01": 0.180696,
      "p05": 0.960353,
      "p10": 1.950615,
      "p25": 5.285841,
      "p75": 28.855378,
      "p90": 51.583404,
      "quantiles": [
        {
          "maxDistance": 0.001218,
          "matchingCount": 9,
          "cumulativePercent": 0.009
        },
        {
          "maxDistance": 0.007707,
          "matchingCount": 50,
          "cumulativePercent": 0.05
        },
        {
          "maxDistance": 0.017393,
          "matchingCount": 99,
          "cumulativePercent": 0.099
        },
        {
          "maxDistance": 0.038771,
          "matchingCount": 200,
          "cumulativePercent": 0.2
        },
        {
          "maxDistance": 0.054788,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 0.071583,
          "matchingCount": 399,
          "cumulativePercent": 0.399
        },
        {
          "maxDistance": 0.088171,
          "matchingCount": 500,
          "cumulativePercent": 0.5
        },
        {
          "maxDistance": 0.103652,
          "matchingCount": 599,
          "cumulativePercent": 0.599
        },
        {
          "maxDistance": 0.123688,
          "matchingCount": 700,
          "cumulativePercent": 0.7
        },
        {
          "maxDistance": 0.146217,
          "matchingCount": 799,
          "cumulativePercent": 0.799
        },
        {
          "maxDistance": 0.162908,
          "matchingCount": 899,
          "cumulativePercent": 0.899
        },
        {
          "maxDistance": 0.180696,
          "matchingCount": 1000,
          "cumulativePercent": 1
        },
        {
          "maxDistance": 0.225756,
          "matchingCount": 1249,
          "cumulativePercent": 1.249
        },
        {
          "maxDistance": 0.281293,
          "matchingCount": 1499,
          "cumulativePercent": 1.499
        },
        {
          "maxDistance": 0.331608,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 0.382561,
          "matchingCount": 1999,
          "cumulativePercent": 1.999
        },
        {
          "maxDistance": 0.478743,
          "matchingCount": 2499,
          "cumulativePercent": 2.499
        },
        {
          "maxDistance": 0.569418,
          "matchingCount": 2999,
          "cumulativePercent": 2.999
        },
        {
          "maxDistance": 0.672565,
          "matchingCount": 3500,
          "cumulativePercent": 3.5
        },
        {
          "maxDistance": 0.759184,
          "matchingCount": 4000,
          "cumulativePercent": 4
        },
        {
          "maxDistance": 0.863282,
          "matchingCount": 4499,
          "cumulativePercent": 4.499
        },
        {
          "maxDistance": 0.960353,
          "matchingCount": 4999,
          "cumulativePercent": 4.999
        },
        {
          "maxDistance": 1.157012,
          "matchingCount": 5999,
          "cumulativePercent": 5.999
        },
        {
          "maxDistance": 1.351082,
          "matchingCount": 7000,
          "cumulativePercent": 7
        },
        {
          "maxDistance": 1.54887,
          "matchingCount": 8000,
          "cumulativePercent": 8
        },
        {
          "maxDistance": 1.751042,
          "matchingCount": 9000,
          "cumulativePercent": 9
        },
        {
          "maxDistance": 1.950615,
          "matchingCount": 9999,
          "cumulativePercent": 9.999
        },
        {
          "maxDistance": 2.157617,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 2.35805,
          "matchingCount": 12000,
          "cumulativePercent": 12
        },
        {
          "maxDistance": 2.566737,
          "matchingCount": 12999,
          "cumulativePercent": 12.999
        },
        {
          "maxDistance": 2.78134,
          "matchingCount": 14000,
          "cumulativePercent": 14
        },
        {
          "maxDistance": 3.000142,
          "matchingCount": 14999,
          "cumulativePercent": 14.999
        },
        {
          "maxDistance": 3.203157,
          "matchingCount": 15999,
          "cumulativePercent": 15.999
        },
        {
          "maxDistance": 3.418974,
          "matchingCount": 16999,
          "cumulativePercent": 16.999
        },
        {
          "maxDistance": 3.638019,
          "matchingCount": 17999,
          "cumulativePercent": 17.999
        },
        {
          "maxDistance": 3.855636,
          "matchingCount": 18999,
          "cumulativePercent": 18.999
        },
        {
          "maxDistance": 4.080972,
          "matchingCount": 19999,
          "cumulativePercent": 19.999
        },
        {
          "maxDistance": 4.311483,
          "matchingCount": 20999,
          "cumulativePercent": 20.999
        },
        {
          "maxDistance": 4.546939,
          "matchingCount": 21999,
          "cumulativePercent": 21.999
        },
        {
          "maxDistance": 4.781318,
          "matchingCount": 23000,
          "cumulativePercent": 23
        },
        {
          "maxDistance": 5.031013,
          "matchingCount": 24000,
          "cumulativePercent": 24
        },
        {
          "maxDistance": 5.285841,
          "matchingCount": 24999,
          "cumulativePercent": 24.999
        },
        {
          "maxDistance": 5.535713,
          "matchingCount": 25999,
          "cumulativePercent": 25.999
        },
        {
          "maxDistance": 5.795641,
          "matchingCount": 27000,
          "cumulativePercent": 27
        },
        {
          "maxDistance": 6.061062,
          "matchingCount": 27999,
          "cumulativePercent": 27.999
        },
        {
          "maxDistance": 6.324779,
          "matchingCount": 28999,
          "cumulativePercent": 28.999
        },
        {
          "maxDistance": 6.600183,
          "matchingCount": 30000,
          "cumulativePercent": 30
        },
        {
          "maxDistance": 6.880731,
          "matchingCount": 30999,
          "cumulativePercent": 30.999
        },
        {
          "maxDistance": 7.167222,
          "matchingCount": 32000,
          "cumulativePercent": 32
        },
        {
          "maxDistance": 7.463084,
          "matchingCount": 33000,
          "cumulativePercent": 33
        },
        {
          "maxDistance": 7.747558,
          "matchingCount": 33999,
          "cumulativePercent": 33.999
        },
        {
          "maxDistance": 8.030317,
          "matchingCount": 34999,
          "cumulativePercent": 34.999
        },
        {
          "maxDistance": 8.331779,
          "matchingCount": 36000,
          "cumulativePercent": 36
        },
        {
          "maxDistance": 8.637755,
          "matchingCount": 37000,
          "cumulativePercent": 37
        },
        {
          "maxDistance": 8.95451,
          "matchingCount": 38000,
          "cumulativePercent": 38
        },
        {
          "maxDistance": 9.28089,
          "matchingCount": 39000,
          "cumulativePercent": 39
        },
        {
          "maxDistance": 9.620167,
          "matchingCount": 39999,
          "cumulativePercent": 39.999
        },
        {
          "maxDistance": 9.944982,
          "matchingCount": 41000,
          "cumulativePercent": 41
        },
        {
          "maxDistance": 10.31183,
          "matchingCount": 42000,
          "cumulativePercent": 42
        },
        {
          "maxDistance": 10.659626,
          "matchingCount": 43000,
          "cumulativePercent": 43
        },
        {
          "maxDistance": 11.045145,
          "matchingCount": 44000,
          "cumulativePercent": 44
        },
        {
          "maxDistance": 11.404051,
          "matchingCount": 45000,
          "cumulativePercent": 45
        },
        {
          "maxDistance": 11.775395,
          "matchingCount": 45999,
          "cumulativePercent": 45.999
        },
        {
          "maxDistance": 12.169531,
          "matchingCount": 46999,
          "cumulativePercent": 46.999
        },
        {
          "maxDistance": 12.548812,
          "matchingCount": 48000,
          "cumulativePercent": 48
        },
        {
          "maxDistance": 12.95132,
          "matchingCount": 49000,
          "cumulativePercent": 49
        },
        {
          "maxDistance": 13.346246,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 14.239967,
          "matchingCount": 51999,
          "cumulativePercent": 51.999
        },
        {
          "maxDistance": 15.152828,
          "matchingCount": 53999,
          "cumulativePercent": 53.999
        },
        {
          "maxDistance": 16.101321,
          "matchingCount": 56000,
          "cumulativePercent": 56
        },
        {
          "maxDistance": 17.088366,
          "matchingCount": 57999,
          "cumulativePercent": 57.999
        },
        {
          "maxDistance": 18.136244,
          "matchingCount": 60000,
          "cumulativePercent": 60
        },
        {
          "maxDistance": 19.261605,
          "matchingCount": 61999,
          "cumulativePercent": 61.999
        },
        {
          "maxDistance": 20.458054,
          "matchingCount": 64000,
          "cumulativePercent": 64
        },
        {
          "maxDistance": 21.712087,
          "matchingCount": 65999,
          "cumulativePercent": 65.999
        },
        {
          "maxDistance": 23.039168,
          "matchingCount": 68000,
          "cumulativePercent": 68
        },
        {
          "maxDistance": 24.474336,
          "matchingCount": 70000,
          "cumulativePercent": 70
        },
        {
          "maxDistance": 26.061306,
          "matchingCount": 72000,
          "cumulativePercent": 72
        },
        {
          "maxDistance": 27.851584,
          "matchingCount": 73999,
          "cumulativePercent": 73.999
        },
        {
          "maxDistance": 29.871828,
          "matchingCount": 76000,
          "cumulativePercent": 76
        },
        {
          "maxDistance": 32.034665,
          "matchingCount": 78000,
          "cumulativePercent": 78
        },
        {
          "maxDistance": 34.499365,
          "matchingCount": 80000,
          "cumulativePercent": 80
        },
        {
          "maxDistance": 37.165843,
          "matchingCount": 81999,
          "cumulativePercent": 81.999
        },
        {
          "maxDistance": 40.182996,
          "matchingCount": 84000,
          "cumulativePercent": 84
        },
        {
          "maxDistance": 43.467412,
          "matchingCount": 86000,
          "cumulativePercent": 86
        },
        {
          "maxDistance": 47.275413,
          "matchingCount": 87999,
          "cumulativePercent": 87.999
        },
        {
          "maxDistance": 51.583404,
          "matchingCount": 90000,
          "cumulativePercent": 90
        },
        {
          "maxDistance": 56.885352,
          "matchingCount": 92000,
          "cumulativePercent": 92
        },
        {
          "maxDistance": 63.266017,
          "matchingCount": 93999,
          "cumulativePercent": 93.999
        },
        {
          "maxDistance": 71.018004,
          "matchingCount": 95999,
          "cumulativePercent": 95.999
        },
        {
          "maxDistance": 83.43997,
          "matchingCount": 97999,
          "cumulativePercent": 97.999
        },
        {
          "maxDistance": 142.213664,
          "matchingCount": 99999,
          "cumulativePercent": 99.999
        }
      ]
    },
    "feat_meridian_axis_opposition": {
      "featureId": "feat_meridian_axis_opposition",
      "featureName": "Dual Axis Angular Polarity",
      "category": "angular",
      "unit": "degrees",
      "idealTarget": 0,
      "validSampleSize": 100000,
      "min": 0.090402,
      "max": 113.079392,
      "mean": 19.731882,
      "median": 16.621612,
      "p01": 1.575224,
      "p05": 3.736697,
      "p10": 5.535868,
      "p25": 9.786833,
      "p75": 25.883371,
      "p90": 38.090733,
      "quantiles": [
        {
          "maxDistance": 0.191038,
          "matchingCount": 10,
          "cumulativePercent": 0.01
        },
        {
          "maxDistance": 0.374197,
          "matchingCount": 49,
          "cumulativePercent": 0.049
        },
        {
          "maxDistance": 0.526602,
          "matchingCount": 100,
          "cumulativePercent": 0.1
        },
        {
          "maxDistance": 0.75762,
          "matchingCount": 199,
          "cumulativePercent": 0.199
        },
        {
          "maxDistance": 0.912012,
          "matchingCount": 299,
          "cumulativePercent": 0.299
        },
        {
          "maxDistance": 1.032834,
          "matchingCount": 399,
          "cumulativePercent": 0.399
        },
        {
          "maxDistance": 1.137125,
          "matchingCount": 499,
          "cumulativePercent": 0.499
        },
        {
          "maxDistance": 1.234167,
          "matchingCount": 600,
          "cumulativePercent": 0.6
        },
        {
          "maxDistance": 1.323126,
          "matchingCount": 699,
          "cumulativePercent": 0.699
        },
        {
          "maxDistance": 1.416905,
          "matchingCount": 799,
          "cumulativePercent": 0.799
        },
        {
          "maxDistance": 1.500124,
          "matchingCount": 900,
          "cumulativePercent": 0.9
        },
        {
          "maxDistance": 1.575224,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 1.78409,
          "matchingCount": 1249,
          "cumulativePercent": 1.249
        },
        {
          "maxDistance": 1.961359,
          "matchingCount": 1500,
          "cumulativePercent": 1.5
        },
        {
          "maxDistance": 2.124125,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 2.297077,
          "matchingCount": 2000,
          "cumulativePercent": 2
        },
        {
          "maxDistance": 2.589924,
          "matchingCount": 2499,
          "cumulativePercent": 2.499
        },
        {
          "maxDistance": 2.841162,
          "matchingCount": 2999,
          "cumulativePercent": 2.999
        },
        {
          "maxDistance": 3.094344,
          "matchingCount": 3499,
          "cumulativePercent": 3.499
        },
        {
          "maxDistance": 3.326769,
          "matchingCount": 4000,
          "cumulativePercent": 4
        },
        {
          "maxDistance": 3.53266,
          "matchingCount": 4500,
          "cumulativePercent": 4.5
        },
        {
          "maxDistance": 3.736697,
          "matchingCount": 4999,
          "cumulativePercent": 4.999
        },
        {
          "maxDistance": 4.145257,
          "matchingCount": 6000,
          "cumulativePercent": 6
        },
        {
          "maxDistance": 4.535451,
          "matchingCount": 6999,
          "cumulativePercent": 6.999
        },
        {
          "maxDistance": 4.885548,
          "matchingCount": 8000,
          "cumulativePercent": 8
        },
        {
          "maxDistance": 5.218607,
          "matchingCount": 8999,
          "cumulativePercent": 8.999
        },
        {
          "maxDistance": 5.535868,
          "matchingCount": 9999,
          "cumulativePercent": 9.999
        },
        {
          "maxDistance": 5.869958,
          "matchingCount": 10999,
          "cumulativePercent": 10.999
        },
        {
          "maxDistance": 6.18177,
          "matchingCount": 11999,
          "cumulativePercent": 11.999
        },
        {
          "maxDistance": 6.471404,
          "matchingCount": 13000,
          "cumulativePercent": 13
        },
        {
          "maxDistance": 6.771602,
          "matchingCount": 14000,
          "cumulativePercent": 14
        },
        {
          "maxDistance": 7.069792,
          "matchingCount": 14999,
          "cumulativePercent": 14.999
        },
        {
          "maxDistance": 7.360162,
          "matchingCount": 16000,
          "cumulativePercent": 16
        },
        {
          "maxDistance": 7.641479,
          "matchingCount": 17000,
          "cumulativePercent": 17
        },
        {
          "maxDistance": 7.894351,
          "matchingCount": 17999,
          "cumulativePercent": 17.999
        },
        {
          "maxDistance": 8.173772,
          "matchingCount": 18999,
          "cumulativePercent": 18.999
        },
        {
          "maxDistance": 8.446141,
          "matchingCount": 19999,
          "cumulativePercent": 19.999
        },
        {
          "maxDistance": 8.717377,
          "matchingCount": 20999,
          "cumulativePercent": 20.999
        },
        {
          "maxDistance": 8.997949,
          "matchingCount": 21999,
          "cumulativePercent": 21.999
        },
        {
          "maxDistance": 9.276133,
          "matchingCount": 23000,
          "cumulativePercent": 23
        },
        {
          "maxDistance": 9.533073,
          "matchingCount": 23999,
          "cumulativePercent": 23.999
        },
        {
          "maxDistance": 9.786833,
          "matchingCount": 24999,
          "cumulativePercent": 24.999
        },
        {
          "maxDistance": 10.046017,
          "matchingCount": 25999,
          "cumulativePercent": 25.999
        },
        {
          "maxDistance": 10.327198,
          "matchingCount": 26999,
          "cumulativePercent": 26.999
        },
        {
          "maxDistance": 10.591431,
          "matchingCount": 27999,
          "cumulativePercent": 27.999
        },
        {
          "maxDistance": 10.846669,
          "matchingCount": 29000,
          "cumulativePercent": 29
        },
        {
          "maxDistance": 11.109217,
          "matchingCount": 29999,
          "cumulativePercent": 29.999
        },
        {
          "maxDistance": 11.362774,
          "matchingCount": 30999,
          "cumulativePercent": 30.999
        },
        {
          "maxDistance": 11.621094,
          "matchingCount": 32000,
          "cumulativePercent": 32
        },
        {
          "maxDistance": 11.897301,
          "matchingCount": 33000,
          "cumulativePercent": 33
        },
        {
          "maxDistance": 12.156032,
          "matchingCount": 34000,
          "cumulativePercent": 34
        },
        {
          "maxDistance": 12.419777,
          "matchingCount": 35000,
          "cumulativePercent": 35
        },
        {
          "maxDistance": 12.686082,
          "matchingCount": 35999,
          "cumulativePercent": 35.999
        },
        {
          "maxDistance": 12.934416,
          "matchingCount": 37000,
          "cumulativePercent": 37
        },
        {
          "maxDistance": 13.207635,
          "matchingCount": 37999,
          "cumulativePercent": 37.999
        },
        {
          "maxDistance": 13.470894,
          "matchingCount": 38999,
          "cumulativePercent": 38.999
        },
        {
          "maxDistance": 13.73252,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 14.012866,
          "matchingCount": 40999,
          "cumulativePercent": 40.999
        },
        {
          "maxDistance": 14.287312,
          "matchingCount": 42000,
          "cumulativePercent": 42
        },
        {
          "maxDistance": 14.576023,
          "matchingCount": 42999,
          "cumulativePercent": 42.999
        },
        {
          "maxDistance": 14.853198,
          "matchingCount": 44000,
          "cumulativePercent": 44
        },
        {
          "maxDistance": 15.146479,
          "matchingCount": 45000,
          "cumulativePercent": 45
        },
        {
          "maxDistance": 15.445574,
          "matchingCount": 45999,
          "cumulativePercent": 45.999
        },
        {
          "maxDistance": 15.74081,
          "matchingCount": 47000,
          "cumulativePercent": 47
        },
        {
          "maxDistance": 16.022087,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 16.317398,
          "matchingCount": 48999,
          "cumulativePercent": 48.999
        },
        {
          "maxDistance": 16.621612,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 17.233427,
          "matchingCount": 51999,
          "cumulativePercent": 51.999
        },
        {
          "maxDistance": 17.8601,
          "matchingCount": 54000,
          "cumulativePercent": 54
        },
        {
          "maxDistance": 18.473317,
          "matchingCount": 56000,
          "cumulativePercent": 56
        },
        {
          "maxDistance": 19.125759,
          "matchingCount": 57999,
          "cumulativePercent": 57.999
        },
        {
          "maxDistance": 19.798611,
          "matchingCount": 59999,
          "cumulativePercent": 59.999
        },
        {
          "maxDistance": 20.490409,
          "matchingCount": 61999,
          "cumulativePercent": 61.999
        },
        {
          "maxDistance": 21.224699,
          "matchingCount": 63999,
          "cumulativePercent": 63.999
        },
        {
          "maxDistance": 21.953673,
          "matchingCount": 65999,
          "cumulativePercent": 65.999
        },
        {
          "maxDistance": 22.727136,
          "matchingCount": 68000,
          "cumulativePercent": 68
        },
        {
          "maxDistance": 23.573107,
          "matchingCount": 70000,
          "cumulativePercent": 70
        },
        {
          "maxDistance": 24.457595,
          "matchingCount": 71999,
          "cumulativePercent": 71.999
        },
        {
          "maxDistance": 25.39258,
          "matchingCount": 74000,
          "cumulativePercent": 74
        },
        {
          "maxDistance": 26.394899,
          "matchingCount": 76000,
          "cumulativePercent": 76
        },
        {
          "maxDistance": 27.556584,
          "matchingCount": 78000,
          "cumulativePercent": 78
        },
        {
          "maxDistance": 28.83221,
          "matchingCount": 80000,
          "cumulativePercent": 80
        },
        {
          "maxDistance": 30.195416,
          "matchingCount": 82000,
          "cumulativePercent": 82
        },
        {
          "maxDistance": 31.795685,
          "matchingCount": 84000,
          "cumulativePercent": 84
        },
        {
          "maxDistance": 33.639832,
          "matchingCount": 85999,
          "cumulativePercent": 85.999
        },
        {
          "maxDistance": 35.687388,
          "matchingCount": 88000,
          "cumulativePercent": 88
        },
        {
          "maxDistance": 38.090733,
          "matchingCount": 90000,
          "cumulativePercent": 90
        },
        {
          "maxDistance": 40.942283,
          "matchingCount": 92000,
          "cumulativePercent": 92
        },
        {
          "maxDistance": 44.703232,
          "matchingCount": 94000,
          "cumulativePercent": 94
        },
        {
          "maxDistance": 50.269005,
          "matchingCount": 95999,
          "cumulativePercent": 95.999
        },
        {
          "maxDistance": 59.352858,
          "matchingCount": 97999,
          "cumulativePercent": 97.999
        },
        {
          "maxDistance": 113.079392,
          "matchingCount": 99999,
          "cumulativePercent": 99.999
        }
      ]
    },
    "feat_planetary_conjunction_alignment": {
      "featureId": "feat_planetary_conjunction_alignment",
      "featureName": "Celestial Conjunction Alignment",
      "category": "aspect",
      "unit": "degrees",
      "idealTarget": 0,
      "validSampleSize": 100000,
      "min": 0.000048,
      "max": 19.579622,
      "mean": 2.807752,
      "median": 2.022171,
      "p01": 0.029044,
      "p05": 0.151354,
      "p10": 0.31119,
      "p25": 0.851718,
      "p75": 3.94818,
      "p90": 6.361491,
      "quantiles": [
        {
          "maxDistance": 0.000308,
          "matchingCount": 9,
          "cumulativePercent": 0.009
        },
        {
          "maxDistance": 0.001072,
          "matchingCount": 49,
          "cumulativePercent": 0.049
        },
        {
          "maxDistance": 0.002662,
          "matchingCount": 99,
          "cumulativePercent": 0.099
        },
        {
          "maxDistance": 0.00563,
          "matchingCount": 200,
          "cumulativePercent": 0.2
        },
        {
          "maxDistance": 0.008607,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 0.011732,
          "matchingCount": 400,
          "cumulativePercent": 0.4
        },
        {
          "maxDistance": 0.014241,
          "matchingCount": 499,
          "cumulativePercent": 0.499
        },
        {
          "maxDistance": 0.017858,
          "matchingCount": 600,
          "cumulativePercent": 0.6
        },
        {
          "maxDistance": 0.020746,
          "matchingCount": 699,
          "cumulativePercent": 0.699
        },
        {
          "maxDistance": 0.023397,
          "matchingCount": 800,
          "cumulativePercent": 0.8
        },
        {
          "maxDistance": 0.026443,
          "matchingCount": 900,
          "cumulativePercent": 0.9
        },
        {
          "maxDistance": 0.029044,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 0.036658,
          "matchingCount": 1249,
          "cumulativePercent": 1.249
        },
        {
          "maxDistance": 0.044391,
          "matchingCount": 1500,
          "cumulativePercent": 1.5
        },
        {
          "maxDistance": 0.051493,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 0.058866,
          "matchingCount": 2000,
          "cumulativePercent": 2
        },
        {
          "maxDistance": 0.074176,
          "matchingCount": 2499,
          "cumulativePercent": 2.499
        },
        {
          "maxDistance": 0.090041,
          "matchingCount": 2999,
          "cumulativePercent": 2.999
        },
        {
          "maxDistance": 0.105625,
          "matchingCount": 3499,
          "cumulativePercent": 3.499
        },
        {
          "maxDistance": 0.120302,
          "matchingCount": 3999,
          "cumulativePercent": 3.999
        },
        {
          "maxDistance": 0.135872,
          "matchingCount": 4499,
          "cumulativePercent": 4.499
        },
        {
          "maxDistance": 0.151354,
          "matchingCount": 5000,
          "cumulativePercent": 5
        },
        {
          "maxDistance": 0.181456,
          "matchingCount": 6000,
          "cumulativePercent": 6
        },
        {
          "maxDistance": 0.213956,
          "matchingCount": 7000,
          "cumulativePercent": 7
        },
        {
          "maxDistance": 0.24641,
          "matchingCount": 7999,
          "cumulativePercent": 7.999
        },
        {
          "maxDistance": 0.279578,
          "matchingCount": 9000,
          "cumulativePercent": 9
        },
        {
          "maxDistance": 0.31119,
          "matchingCount": 9999,
          "cumulativePercent": 9.999
        },
        {
          "maxDistance": 0.341529,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 0.377346,
          "matchingCount": 11999,
          "cumulativePercent": 11.999
        },
        {
          "maxDistance": 0.412118,
          "matchingCount": 13000,
          "cumulativePercent": 13
        },
        {
          "maxDistance": 0.446242,
          "matchingCount": 14000,
          "cumulativePercent": 14
        },
        {
          "maxDistance": 0.481525,
          "matchingCount": 15000,
          "cumulativePercent": 15
        },
        {
          "maxDistance": 0.517446,
          "matchingCount": 15999,
          "cumulativePercent": 15.999
        },
        {
          "maxDistance": 0.554815,
          "matchingCount": 16999,
          "cumulativePercent": 16.999
        },
        {
          "maxDistance": 0.587646,
          "matchingCount": 17999,
          "cumulativePercent": 17.999
        },
        {
          "maxDistance": 0.623437,
          "matchingCount": 19000,
          "cumulativePercent": 19
        },
        {
          "maxDistance": 0.663633,
          "matchingCount": 20000,
          "cumulativePercent": 20
        },
        {
          "maxDistance": 0.701784,
          "matchingCount": 21000,
          "cumulativePercent": 21
        },
        {
          "maxDistance": 0.73805,
          "matchingCount": 22000,
          "cumulativePercent": 22
        },
        {
          "maxDistance": 0.776041,
          "matchingCount": 23000,
          "cumulativePercent": 23
        },
        {
          "maxDistance": 0.814233,
          "matchingCount": 23999,
          "cumulativePercent": 23.999
        },
        {
          "maxDistance": 0.851718,
          "matchingCount": 25000,
          "cumulativePercent": 25
        },
        {
          "maxDistance": 0.891311,
          "matchingCount": 26000,
          "cumulativePercent": 26
        },
        {
          "maxDistance": 0.931289,
          "matchingCount": 26999,
          "cumulativePercent": 26.999
        },
        {
          "maxDistance": 0.967928,
          "matchingCount": 27999,
          "cumulativePercent": 27.999
        },
        {
          "maxDistance": 1.003628,
          "matchingCount": 29000,
          "cumulativePercent": 29
        },
        {
          "maxDistance": 1.038136,
          "matchingCount": 30001,
          "cumulativePercent": 30.001
        },
        {
          "maxDistance": 1.076819,
          "matchingCount": 31000,
          "cumulativePercent": 31
        },
        {
          "maxDistance": 1.116759,
          "matchingCount": 31999,
          "cumulativePercent": 31.999
        },
        {
          "maxDistance": 1.160259,
          "matchingCount": 32999,
          "cumulativePercent": 32.999
        },
        {
          "maxDistance": 1.206562,
          "matchingCount": 34000,
          "cumulativePercent": 34
        },
        {
          "maxDistance": 1.253178,
          "matchingCount": 35000,
          "cumulativePercent": 35
        },
        {
          "maxDistance": 1.301809,
          "matchingCount": 35999,
          "cumulativePercent": 35.999
        },
        {
          "maxDistance": 1.349062,
          "matchingCount": 36999,
          "cumulativePercent": 36.999
        },
        {
          "maxDistance": 1.397904,
          "matchingCount": 38000,
          "cumulativePercent": 38
        },
        {
          "maxDistance": 1.446481,
          "matchingCount": 39000,
          "cumulativePercent": 39
        },
        {
          "maxDistance": 1.491303,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 1.538223,
          "matchingCount": 40999,
          "cumulativePercent": 40.999
        },
        {
          "maxDistance": 1.586609,
          "matchingCount": 42000,
          "cumulativePercent": 42
        },
        {
          "maxDistance": 1.637534,
          "matchingCount": 42999,
          "cumulativePercent": 42.999
        },
        {
          "maxDistance": 1.690529,
          "matchingCount": 43999,
          "cumulativePercent": 43.999
        },
        {
          "maxDistance": 1.746801,
          "matchingCount": 45000,
          "cumulativePercent": 45
        },
        {
          "maxDistance": 1.801213,
          "matchingCount": 45999,
          "cumulativePercent": 45.999
        },
        {
          "maxDistance": 1.857889,
          "matchingCount": 46999,
          "cumulativePercent": 46.999
        },
        {
          "maxDistance": 1.909723,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 1.966699,
          "matchingCount": 49000,
          "cumulativePercent": 49
        },
        {
          "maxDistance": 2.022171,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 2.138852,
          "matchingCount": 52000,
          "cumulativePercent": 52
        },
        {
          "maxDistance": 2.263379,
          "matchingCount": 54000,
          "cumulativePercent": 54
        },
        {
          "maxDistance": 2.382236,
          "matchingCount": 56000,
          "cumulativePercent": 56
        },
        {
          "maxDistance": 2.516434,
          "matchingCount": 58000,
          "cumulativePercent": 58
        },
        {
          "maxDistance": 2.653413,
          "matchingCount": 60000,
          "cumulativePercent": 60
        },
        {
          "maxDistance": 2.793131,
          "matchingCount": 61999,
          "cumulativePercent": 61.999
        },
        {
          "maxDistance": 2.942586,
          "matchingCount": 64000,
          "cumulativePercent": 64
        },
        {
          "maxDistance": 3.093248,
          "matchingCount": 65999,
          "cumulativePercent": 65.999
        },
        {
          "maxDistance": 3.263718,
          "matchingCount": 68000,
          "cumulativePercent": 68
        },
        {
          "maxDistance": 3.435361,
          "matchingCount": 70000,
          "cumulativePercent": 70
        },
        {
          "maxDistance": 3.630394,
          "matchingCount": 71999,
          "cumulativePercent": 71.999
        },
        {
          "maxDistance": 3.828873,
          "matchingCount": 74000,
          "cumulativePercent": 74
        },
        {
          "maxDistance": 4.072765,
          "matchingCount": 76000,
          "cumulativePercent": 76
        },
        {
          "maxDistance": 4.312598,
          "matchingCount": 78000,
          "cumulativePercent": 78
        },
        {
          "maxDistance": 4.594744,
          "matchingCount": 80000,
          "cumulativePercent": 80
        },
        {
          "maxDistance": 4.87708,
          "matchingCount": 82000,
          "cumulativePercent": 82
        },
        {
          "maxDistance": 5.164344,
          "matchingCount": 83999,
          "cumulativePercent": 83.999
        },
        {
          "maxDistance": 5.516013,
          "matchingCount": 85999,
          "cumulativePercent": 85.999
        },
        {
          "maxDistance": 5.927866,
          "matchingCount": 87999,
          "cumulativePercent": 87.999
        },
        {
          "maxDistance": 6.361491,
          "matchingCount": 89999,
          "cumulativePercent": 89.999
        },
        {
          "maxDistance": 6.908278,
          "matchingCount": 91999,
          "cumulativePercent": 91.999
        },
        {
          "maxDistance": 7.688684,
          "matchingCount": 93999,
          "cumulativePercent": 93.999
        },
        {
          "maxDistance": 8.72932,
          "matchingCount": 96000,
          "cumulativePercent": 96
        },
        {
          "maxDistance": 10.559529,
          "matchingCount": 97999,
          "cumulativePercent": 97.999
        },
        {
          "maxDistance": 19.579622,
          "matchingCount": 100000,
          "cumulativePercent": 100
        }
      ]
    },
    "feat_harmonic_trine_alignment": {
      "featureId": "feat_harmonic_trine_alignment",
      "featureName": "Harmonic Trine Alignment",
      "category": "aspect",
      "unit": "degrees",
      "idealTarget": 120,
      "validSampleSize": 100000,
      "min": 0.000058,
      "max": 47.790707,
      "mean": 2.5199,
      "median": 1.632098,
      "p01": 0.024009,
      "p05": 0.125121,
      "p10": 0.25588,
      "p25": 0.68492,
      "p75": 3.306679,
      "p90": 5.640599,
      "quantiles": [
        {
          "maxDistance": 0.000201,
          "matchingCount": 10,
          "cumulativePercent": 0.01
        },
        {
          "maxDistance": 0.001141,
          "matchingCount": 50,
          "cumulativePercent": 0.05
        },
        {
          "maxDistance": 0.00199,
          "matchingCount": 100,
          "cumulativePercent": 0.1
        },
        {
          "maxDistance": 0.00428,
          "matchingCount": 200,
          "cumulativePercent": 0.2
        },
        {
          "maxDistance": 0.00686,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 0.009065,
          "matchingCount": 400,
          "cumulativePercent": 0.4
        },
        {
          "maxDistance": 0.011357,
          "matchingCount": 500,
          "cumulativePercent": 0.5
        },
        {
          "maxDistance": 0.013875,
          "matchingCount": 600,
          "cumulativePercent": 0.6
        },
        {
          "maxDistance": 0.016149,
          "matchingCount": 700,
          "cumulativePercent": 0.7
        },
        {
          "maxDistance": 0.019241,
          "matchingCount": 800,
          "cumulativePercent": 0.8
        },
        {
          "maxDistance": 0.021578,
          "matchingCount": 899,
          "cumulativePercent": 0.899
        },
        {
          "maxDistance": 0.024009,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 0.030393,
          "matchingCount": 1249,
          "cumulativePercent": 1.249
        },
        {
          "maxDistance": 0.035841,
          "matchingCount": 1500,
          "cumulativePercent": 1.5
        },
        {
          "maxDistance": 0.041903,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 0.0484,
          "matchingCount": 2000,
          "cumulativePercent": 2
        },
        {
          "maxDistance": 0.060518,
          "matchingCount": 2500,
          "cumulativePercent": 2.5
        },
        {
          "maxDistance": 0.073771,
          "matchingCount": 3000,
          "cumulativePercent": 3
        },
        {
          "maxDistance": 0.086652,
          "matchingCount": 3499,
          "cumulativePercent": 3.499
        },
        {
          "maxDistance": 0.098459,
          "matchingCount": 4000,
          "cumulativePercent": 4
        },
        {
          "maxDistance": 0.112285,
          "matchingCount": 4499,
          "cumulativePercent": 4.499
        },
        {
          "maxDistance": 0.125121,
          "matchingCount": 4999,
          "cumulativePercent": 4.999
        },
        {
          "maxDistance": 0.153658,
          "matchingCount": 6000,
          "cumulativePercent": 6
        },
        {
          "maxDistance": 0.180685,
          "matchingCount": 7000,
          "cumulativePercent": 7
        },
        {
          "maxDistance": 0.207318,
          "matchingCount": 7999,
          "cumulativePercent": 7.999
        },
        {
          "maxDistance": 0.230747,
          "matchingCount": 8999,
          "cumulativePercent": 8.999
        },
        {
          "maxDistance": 0.25588,
          "matchingCount": 9999,
          "cumulativePercent": 9.999
        },
        {
          "maxDistance": 0.282866,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 0.307072,
          "matchingCount": 12000,
          "cumulativePercent": 12
        },
        {
          "maxDistance": 0.334504,
          "matchingCount": 12999,
          "cumulativePercent": 12.999
        },
        {
          "maxDistance": 0.36214,
          "matchingCount": 13999,
          "cumulativePercent": 13.999
        },
        {
          "maxDistance": 0.390703,
          "matchingCount": 15000,
          "cumulativePercent": 15
        },
        {
          "maxDistance": 0.419122,
          "matchingCount": 15999,
          "cumulativePercent": 15.999
        },
        {
          "maxDistance": 0.446487,
          "matchingCount": 16999,
          "cumulativePercent": 16.999
        },
        {
          "maxDistance": 0.474914,
          "matchingCount": 17999,
          "cumulativePercent": 17.999
        },
        {
          "maxDistance": 0.505464,
          "matchingCount": 19000,
          "cumulativePercent": 19
        },
        {
          "maxDistance": 0.533198,
          "matchingCount": 19999,
          "cumulativePercent": 19.999
        },
        {
          "maxDistance": 0.562803,
          "matchingCount": 21000,
          "cumulativePercent": 21
        },
        {
          "maxDistance": 0.593057,
          "matchingCount": 22000,
          "cumulativePercent": 22
        },
        {
          "maxDistance": 0.624374,
          "matchingCount": 22999,
          "cumulativePercent": 22.999
        },
        {
          "maxDistance": 0.654766,
          "matchingCount": 23999,
          "cumulativePercent": 23.999
        },
        {
          "maxDistance": 0.68492,
          "matchingCount": 25000,
          "cumulativePercent": 25
        },
        {
          "maxDistance": 0.716604,
          "matchingCount": 26000,
          "cumulativePercent": 26
        },
        {
          "maxDistance": 0.747463,
          "matchingCount": 27000,
          "cumulativePercent": 27
        },
        {
          "maxDistance": 0.77804,
          "matchingCount": 28000,
          "cumulativePercent": 28
        },
        {
          "maxDistance": 0.812849,
          "matchingCount": 29000,
          "cumulativePercent": 29
        },
        {
          "maxDistance": 0.845311,
          "matchingCount": 29999,
          "cumulativePercent": 29.999
        },
        {
          "maxDistance": 0.87855,
          "matchingCount": 31000,
          "cumulativePercent": 31
        },
        {
          "maxDistance": 0.911712,
          "matchingCount": 31999,
          "cumulativePercent": 31.999
        },
        {
          "maxDistance": 0.946721,
          "matchingCount": 33000,
          "cumulativePercent": 33
        },
        {
          "maxDistance": 0.982078,
          "matchingCount": 33999,
          "cumulativePercent": 33.999
        },
        {
          "maxDistance": 1.016484,
          "matchingCount": 35000,
          "cumulativePercent": 35
        },
        {
          "maxDistance": 1.053282,
          "matchingCount": 36000,
          "cumulativePercent": 36
        },
        {
          "maxDistance": 1.089466,
          "matchingCount": 37000,
          "cumulativePercent": 37
        },
        {
          "maxDistance": 1.126622,
          "matchingCount": 38000,
          "cumulativePercent": 38
        },
        {
          "maxDistance": 1.163585,
          "matchingCount": 38999,
          "cumulativePercent": 38.999
        },
        {
          "maxDistance": 1.201787,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 1.243127,
          "matchingCount": 40999,
          "cumulativePercent": 40.999
        },
        {
          "maxDistance": 1.283956,
          "matchingCount": 41999,
          "cumulativePercent": 41.999
        },
        {
          "maxDistance": 1.324692,
          "matchingCount": 43000,
          "cumulativePercent": 43
        },
        {
          "maxDistance": 1.363764,
          "matchingCount": 43999,
          "cumulativePercent": 43.999
        },
        {
          "maxDistance": 1.405482,
          "matchingCount": 44999,
          "cumulativePercent": 44.999
        },
        {
          "maxDistance": 1.450329,
          "matchingCount": 45999,
          "cumulativePercent": 45.999
        },
        {
          "maxDistance": 1.492208,
          "matchingCount": 47000,
          "cumulativePercent": 47
        },
        {
          "maxDistance": 1.536907,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 1.583793,
          "matchingCount": 49000,
          "cumulativePercent": 49
        },
        {
          "maxDistance": 1.632098,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 1.726431,
          "matchingCount": 52000,
          "cumulativePercent": 52
        },
        {
          "maxDistance": 1.832278,
          "matchingCount": 53999,
          "cumulativePercent": 53.999
        },
        {
          "maxDistance": 1.938687,
          "matchingCount": 55999,
          "cumulativePercent": 55.999
        },
        {
          "maxDistance": 2.051479,
          "matchingCount": 57999,
          "cumulativePercent": 57.999
        },
        {
          "maxDistance": 2.161223,
          "matchingCount": 60000,
          "cumulativePercent": 60
        },
        {
          "maxDistance": 2.285582,
          "matchingCount": 62000,
          "cumulativePercent": 62
        },
        {
          "maxDistance": 2.41302,
          "matchingCount": 63999,
          "cumulativePercent": 63.999
        },
        {
          "maxDistance": 2.553259,
          "matchingCount": 65999,
          "cumulativePercent": 65.999
        },
        {
          "maxDistance": 2.699474,
          "matchingCount": 67999,
          "cumulativePercent": 67.999
        },
        {
          "maxDistance": 2.857465,
          "matchingCount": 69999,
          "cumulativePercent": 69.999
        },
        {
          "maxDistance": 3.026888,
          "matchingCount": 71999,
          "cumulativePercent": 71.999
        },
        {
          "maxDistance": 3.213205,
          "matchingCount": 74000,
          "cumulativePercent": 74
        },
        {
          "maxDistance": 3.407233,
          "matchingCount": 76000,
          "cumulativePercent": 76
        },
        {
          "maxDistance": 3.61565,
          "matchingCount": 78000,
          "cumulativePercent": 78
        },
        {
          "maxDistance": 3.845141,
          "matchingCount": 80000,
          "cumulativePercent": 80
        },
        {
          "maxDistance": 4.113676,
          "matchingCount": 82000,
          "cumulativePercent": 82
        },
        {
          "maxDistance": 4.411303,
          "matchingCount": 84000,
          "cumulativePercent": 84
        },
        {
          "maxDistance": 4.763103,
          "matchingCount": 85999,
          "cumulativePercent": 85.999
        },
        {
          "maxDistance": 5.168046,
          "matchingCount": 88000,
          "cumulativePercent": 88
        },
        {
          "maxDistance": 5.640599,
          "matchingCount": 89999,
          "cumulativePercent": 89.999
        },
        {
          "maxDistance": 6.247254,
          "matchingCount": 92000,
          "cumulativePercent": 92
        },
        {
          "maxDistance": 7.022247,
          "matchingCount": 93999,
          "cumulativePercent": 93.999
        },
        {
          "maxDistance": 8.320549,
          "matchingCount": 96000,
          "cumulativePercent": 96
        },
        {
          "maxDistance": 10.70195,
          "matchingCount": 98000,
          "cumulativePercent": 98
        },
        {
          "maxDistance": 47.790707,
          "matchingCount": 100000,
          "cumulativePercent": 100
        }
      ]
    },
    "feat_diurnal_opposition_alignment": {
      "featureId": "feat_diurnal_opposition_alignment",
      "featureName": "Diurnal Opposition Alignment",
      "category": "aspect",
      "unit": "degrees",
      "idealTarget": 180,
      "validSampleSize": 100000,
      "min": 0.000039,
      "max": 107.790707,
      "mean": 8.621165,
      "median": 3.883471,
      "p01": 0.051763,
      "p05": 0.278088,
      "p10": 0.566671,
      "p25": 1.562449,
      "p75": 8.624882,
      "p90": 20.92421,
      "quantiles": [
        {
          "maxDistance": 0.000293,
          "matchingCount": 10,
          "cumulativePercent": 0.01
        },
        {
          "maxDistance": 0.002147,
          "matchingCount": 50,
          "cumulativePercent": 0.05
        },
        {
          "maxDistance": 0.005053,
          "matchingCount": 99,
          "cumulativePercent": 0.099
        },
        {
          "maxDistance": 0.010939,
          "matchingCount": 199,
          "cumulativePercent": 0.199
        },
        {
          "maxDistance": 0.015506,
          "matchingCount": 299,
          "cumulativePercent": 0.299
        },
        {
          "maxDistance": 0.021505,
          "matchingCount": 400,
          "cumulativePercent": 0.4
        },
        {
          "maxDistance": 0.026533,
          "matchingCount": 499,
          "cumulativePercent": 0.499
        },
        {
          "maxDistance": 0.030447,
          "matchingCount": 600,
          "cumulativePercent": 0.6
        },
        {
          "maxDistance": 0.035814,
          "matchingCount": 699,
          "cumulativePercent": 0.699
        },
        {
          "maxDistance": 0.040625,
          "matchingCount": 799,
          "cumulativePercent": 0.799
        },
        {
          "maxDistance": 0.045992,
          "matchingCount": 899,
          "cumulativePercent": 0.899
        },
        {
          "maxDistance": 0.051763,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 0.064745,
          "matchingCount": 1250,
          "cumulativePercent": 1.25
        },
        {
          "maxDistance": 0.078597,
          "matchingCount": 1499,
          "cumulativePercent": 1.499
        },
        {
          "maxDistance": 0.091123,
          "matchingCount": 1750,
          "cumulativePercent": 1.75
        },
        {
          "maxDistance": 0.104224,
          "matchingCount": 2000,
          "cumulativePercent": 2
        },
        {
          "maxDistance": 0.13372,
          "matchingCount": 2500,
          "cumulativePercent": 2.5
        },
        {
          "maxDistance": 0.160943,
          "matchingCount": 3000,
          "cumulativePercent": 3
        },
        {
          "maxDistance": 0.189601,
          "matchingCount": 3499,
          "cumulativePercent": 3.499
        },
        {
          "maxDistance": 0.220617,
          "matchingCount": 4000,
          "cumulativePercent": 4
        },
        {
          "maxDistance": 0.249501,
          "matchingCount": 4499,
          "cumulativePercent": 4.499
        },
        {
          "maxDistance": 0.278088,
          "matchingCount": 5000,
          "cumulativePercent": 5
        },
        {
          "maxDistance": 0.332499,
          "matchingCount": 5999,
          "cumulativePercent": 5.999
        },
        {
          "maxDistance": 0.389203,
          "matchingCount": 7000,
          "cumulativePercent": 7
        },
        {
          "maxDistance": 0.448747,
          "matchingCount": 8000,
          "cumulativePercent": 8
        },
        {
          "maxDistance": 0.508029,
          "matchingCount": 8999,
          "cumulativePercent": 8.999
        },
        {
          "maxDistance": 0.566671,
          "matchingCount": 9999,
          "cumulativePercent": 9.999
        },
        {
          "maxDistance": 0.626245,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 0.688105,
          "matchingCount": 11999,
          "cumulativePercent": 11.999
        },
        {
          "maxDistance": 0.748743,
          "matchingCount": 12999,
          "cumulativePercent": 12.999
        },
        {
          "maxDistance": 0.808942,
          "matchingCount": 13999,
          "cumulativePercent": 13.999
        },
        {
          "maxDistance": 0.877521,
          "matchingCount": 14999,
          "cumulativePercent": 14.999
        },
        {
          "maxDistance": 0.940361,
          "matchingCount": 16000,
          "cumulativePercent": 16
        },
        {
          "maxDistance": 1.006303,
          "matchingCount": 17000,
          "cumulativePercent": 17
        },
        {
          "maxDistance": 1.070224,
          "matchingCount": 18000,
          "cumulativePercent": 18
        },
        {
          "maxDistance": 1.137797,
          "matchingCount": 19000,
          "cumulativePercent": 19
        },
        {
          "maxDistance": 1.201939,
          "matchingCount": 20000,
          "cumulativePercent": 20
        },
        {
          "maxDistance": 1.2725,
          "matchingCount": 21000,
          "cumulativePercent": 21
        },
        {
          "maxDistance": 1.340826,
          "matchingCount": 21999,
          "cumulativePercent": 21.999
        },
        {
          "maxDistance": 1.410431,
          "matchingCount": 22999,
          "cumulativePercent": 22.999
        },
        {
          "maxDistance": 1.489436,
          "matchingCount": 24000,
          "cumulativePercent": 24
        },
        {
          "maxDistance": 1.562449,
          "matchingCount": 24998,
          "cumulativePercent": 24.998
        },
        {
          "maxDistance": 1.636427,
          "matchingCount": 26000,
          "cumulativePercent": 26
        },
        {
          "maxDistance": 1.711458,
          "matchingCount": 27000,
          "cumulativePercent": 27
        },
        {
          "maxDistance": 1.787568,
          "matchingCount": 28000,
          "cumulativePercent": 28
        },
        {
          "maxDistance": 1.861305,
          "matchingCount": 28999,
          "cumulativePercent": 28.999
        },
        {
          "maxDistance": 1.937848,
          "matchingCount": 29999,
          "cumulativePercent": 29.999
        },
        {
          "maxDistance": 2.015371,
          "matchingCount": 31000,
          "cumulativePercent": 31
        },
        {
          "maxDistance": 2.090904,
          "matchingCount": 32000,
          "cumulativePercent": 32
        },
        {
          "maxDistance": 2.174084,
          "matchingCount": 33000,
          "cumulativePercent": 33
        },
        {
          "maxDistance": 2.259581,
          "matchingCount": 34000,
          "cumulativePercent": 34
        },
        {
          "maxDistance": 2.349878,
          "matchingCount": 34999,
          "cumulativePercent": 34.999
        },
        {
          "maxDistance": 2.434357,
          "matchingCount": 36000,
          "cumulativePercent": 36
        },
        {
          "maxDistance": 2.516277,
          "matchingCount": 36999,
          "cumulativePercent": 36.999
        },
        {
          "maxDistance": 2.604004,
          "matchingCount": 37999,
          "cumulativePercent": 37.999
        },
        {
          "maxDistance": 2.689244,
          "matchingCount": 39000,
          "cumulativePercent": 39
        },
        {
          "maxDistance": 2.786462,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 2.889613,
          "matchingCount": 41000,
          "cumulativePercent": 41
        },
        {
          "maxDistance": 2.990886,
          "matchingCount": 41999,
          "cumulativePercent": 41.999
        },
        {
          "maxDistance": 3.096914,
          "matchingCount": 42999,
          "cumulativePercent": 42.999
        },
        {
          "maxDistance": 3.202977,
          "matchingCount": 44000,
          "cumulativePercent": 44
        },
        {
          "maxDistance": 3.308242,
          "matchingCount": 45000,
          "cumulativePercent": 45
        },
        {
          "maxDistance": 3.416681,
          "matchingCount": 45999,
          "cumulativePercent": 45.999
        },
        {
          "maxDistance": 3.528697,
          "matchingCount": 47000,
          "cumulativePercent": 47
        },
        {
          "maxDistance": 3.64969,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 3.763369,
          "matchingCount": 48999,
          "cumulativePercent": 48.999
        },
        {
          "maxDistance": 3.883471,
          "matchingCount": 49999,
          "cumulativePercent": 49.999
        },
        {
          "maxDistance": 4.143256,
          "matchingCount": 52000,
          "cumulativePercent": 52
        },
        {
          "maxDistance": 4.40554,
          "matchingCount": 53999,
          "cumulativePercent": 53.999
        },
        {
          "maxDistance": 4.695444,
          "matchingCount": 55999,
          "cumulativePercent": 55.999
        },
        {
          "maxDistance": 5.023357,
          "matchingCount": 58000,
          "cumulativePercent": 58
        },
        {
          "maxDistance": 5.347072,
          "matchingCount": 59999,
          "cumulativePercent": 59.999
        },
        {
          "maxDistance": 5.681918,
          "matchingCount": 62000,
          "cumulativePercent": 62
        },
        {
          "maxDistance": 6.024267,
          "matchingCount": 64000,
          "cumulativePercent": 64
        },
        {
          "maxDistance": 6.402889,
          "matchingCount": 66000,
          "cumulativePercent": 66
        },
        {
          "maxDistance": 6.795652,
          "matchingCount": 68000,
          "cumulativePercent": 68
        },
        {
          "maxDistance": 7.258909,
          "matchingCount": 69999,
          "cumulativePercent": 69.999
        },
        {
          "maxDistance": 7.752481,
          "matchingCount": 71999,
          "cumulativePercent": 71.999
        },
        {
          "maxDistance": 8.294898,
          "matchingCount": 73999,
          "cumulativePercent": 73.999
        },
        {
          "maxDistance": 8.956609,
          "matchingCount": 76000,
          "cumulativePercent": 76
        },
        {
          "maxDistance": 9.756723,
          "matchingCount": 77999,
          "cumulativePercent": 77.999
        },
        {
          "maxDistance": 10.592883,
          "matchingCount": 79999,
          "cumulativePercent": 79.999
        },
        {
          "maxDistance": 11.725633,
          "matchingCount": 82000,
          "cumulativePercent": 82
        },
        {
          "maxDistance": 13.162233,
          "matchingCount": 84000,
          "cumulativePercent": 84
        },
        {
          "maxDistance": 15.245917,
          "matchingCount": 85999,
          "cumulativePercent": 85.999
        },
        {
          "maxDistance": 17.617214,
          "matchingCount": 88000,
          "cumulativePercent": 88
        },
        {
          "maxDistance": 20.92421,
          "matchingCount": 89999,
          "cumulativePercent": 89.999
        },
        {
          "maxDistance": 26.442001,
          "matchingCount": 91999,
          "cumulativePercent": 91.999
        },
        {
          "maxDistance": 34.454928,
          "matchingCount": 94000,
          "cumulativePercent": 94
        },
        {
          "maxDistance": 46.168826,
          "matchingCount": 95999,
          "cumulativePercent": 95.999
        },
        {
          "maxDistance": 59.770555,
          "matchingCount": 98000,
          "cumulativePercent": 98
        },
        {
          "maxDistance": 107.790707,
          "matchingCount": 100000,
          "cumulativePercent": 100
        }
      ]
    },
    "feat_quadrature_square_alignment": {
      "featureId": "feat_quadrature_square_alignment",
      "featureName": "Quadrature Square Alignment",
      "category": "aspect",
      "unit": "degrees",
      "idealTarget": 90,
      "validSampleSize": 100000,
      "min": 0.000061,
      "max": 30.025391,
      "mean": 2.37121,
      "median": 1.525506,
      "p01": 0.022666,
      "p05": 0.112615,
      "p10": 0.235844,
      "p25": 0.645475,
      "p75": 3.121424,
      "p90": 5.295142,
      "quantiles": [
        {
          "maxDistance": 0.000491,
          "matchingCount": 9,
          "cumulativePercent": 0.009
        },
        {
          "maxDistance": 0.001309,
          "matchingCount": 49,
          "cumulativePercent": 0.049
        },
        {
          "maxDistance": 0.00229,
          "matchingCount": 99,
          "cumulativePercent": 0.099
        },
        {
          "maxDistance": 0.004482,
          "matchingCount": 199,
          "cumulativePercent": 0.199
        },
        {
          "maxDistance": 0.006782,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 0.009267,
          "matchingCount": 399,
          "cumulativePercent": 0.399
        },
        {
          "maxDistance": 0.011139,
          "matchingCount": 501,
          "cumulativePercent": 0.501
        },
        {
          "maxDistance": 0.013421,
          "matchingCount": 600,
          "cumulativePercent": 0.6
        },
        {
          "maxDistance": 0.015534,
          "matchingCount": 700,
          "cumulativePercent": 0.7
        },
        {
          "maxDistance": 0.018025,
          "matchingCount": 799,
          "cumulativePercent": 0.799
        },
        {
          "maxDistance": 0.020118,
          "matchingCount": 900,
          "cumulativePercent": 0.9
        },
        {
          "maxDistance": 0.022666,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 0.027745,
          "matchingCount": 1249,
          "cumulativePercent": 1.249
        },
        {
          "maxDistance": 0.032664,
          "matchingCount": 1499,
          "cumulativePercent": 1.499
        },
        {
          "maxDistance": 0.037479,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 0.04322,
          "matchingCount": 2000,
          "cumulativePercent": 2
        },
        {
          "maxDistance": 0.054759,
          "matchingCount": 2500,
          "cumulativePercent": 2.5
        },
        {
          "maxDistance": 0.066435,
          "matchingCount": 2999,
          "cumulativePercent": 2.999
        },
        {
          "maxDistance": 0.078539,
          "matchingCount": 3499,
          "cumulativePercent": 3.499
        },
        {
          "maxDistance": 0.09039,
          "matchingCount": 3999,
          "cumulativePercent": 3.999
        },
        {
          "maxDistance": 0.10154,
          "matchingCount": 4500,
          "cumulativePercent": 4.5
        },
        {
          "maxDistance": 0.112615,
          "matchingCount": 5000,
          "cumulativePercent": 5
        },
        {
          "maxDistance": 0.136878,
          "matchingCount": 5999,
          "cumulativePercent": 5.999
        },
        {
          "maxDistance": 0.162397,
          "matchingCount": 6999,
          "cumulativePercent": 6.999
        },
        {
          "maxDistance": 0.186512,
          "matchingCount": 8000,
          "cumulativePercent": 8
        },
        {
          "maxDistance": 0.21169,
          "matchingCount": 8999,
          "cumulativePercent": 8.999
        },
        {
          "maxDistance": 0.235844,
          "matchingCount": 9999,
          "cumulativePercent": 9.999
        },
        {
          "maxDistance": 0.260758,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 0.286196,
          "matchingCount": 11999,
          "cumulativePercent": 11.999
        },
        {
          "maxDistance": 0.311622,
          "matchingCount": 12999,
          "cumulativePercent": 12.999
        },
        {
          "maxDistance": 0.336518,
          "matchingCount": 13999,
          "cumulativePercent": 13.999
        },
        {
          "maxDistance": 0.362097,
          "matchingCount": 15000,
          "cumulativePercent": 15
        },
        {
          "maxDistance": 0.389261,
          "matchingCount": 15999,
          "cumulativePercent": 15.999
        },
        {
          "maxDistance": 0.416692,
          "matchingCount": 17000,
          "cumulativePercent": 17
        },
        {
          "maxDistance": 0.44317,
          "matchingCount": 18000,
          "cumulativePercent": 18
        },
        {
          "maxDistance": 0.470648,
          "matchingCount": 19000,
          "cumulativePercent": 19
        },
        {
          "maxDistance": 0.498793,
          "matchingCount": 20000,
          "cumulativePercent": 20
        },
        {
          "maxDistance": 0.528349,
          "matchingCount": 21000,
          "cumulativePercent": 21
        },
        {
          "maxDistance": 0.558114,
          "matchingCount": 22000,
          "cumulativePercent": 22
        },
        {
          "maxDistance": 0.587625,
          "matchingCount": 23000,
          "cumulativePercent": 23
        },
        {
          "maxDistance": 0.616734,
          "matchingCount": 24000,
          "cumulativePercent": 24
        },
        {
          "maxDistance": 0.645475,
          "matchingCount": 24999,
          "cumulativePercent": 24.999
        },
        {
          "maxDistance": 0.675206,
          "matchingCount": 26000,
          "cumulativePercent": 26
        },
        {
          "maxDistance": 0.706345,
          "matchingCount": 27000,
          "cumulativePercent": 27
        },
        {
          "maxDistance": 0.737367,
          "matchingCount": 27999,
          "cumulativePercent": 27.999
        },
        {
          "maxDistance": 0.767857,
          "matchingCount": 29000,
          "cumulativePercent": 29
        },
        {
          "maxDistance": 0.79861,
          "matchingCount": 29999,
          "cumulativePercent": 29.999
        },
        {
          "maxDistance": 0.829735,
          "matchingCount": 31000,
          "cumulativePercent": 31
        },
        {
          "maxDistance": 0.861968,
          "matchingCount": 31999,
          "cumulativePercent": 31.999
        },
        {
          "maxDistance": 0.896658,
          "matchingCount": 32999,
          "cumulativePercent": 32.999
        },
        {
          "maxDistance": 0.928039,
          "matchingCount": 34000,
          "cumulativePercent": 34
        },
        {
          "maxDistance": 0.960513,
          "matchingCount": 34999,
          "cumulativePercent": 34.999
        },
        {
          "maxDistance": 0.993651,
          "matchingCount": 35999,
          "cumulativePercent": 35.999
        },
        {
          "maxDistance": 1.027956,
          "matchingCount": 36999,
          "cumulativePercent": 36.999
        },
        {
          "maxDistance": 1.060956,
          "matchingCount": 38000,
          "cumulativePercent": 38
        },
        {
          "maxDistance": 1.095617,
          "matchingCount": 38999,
          "cumulativePercent": 38.999
        },
        {
          "maxDistance": 1.13348,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 1.167966,
          "matchingCount": 40999,
          "cumulativePercent": 40.999
        },
        {
          "maxDistance": 1.204767,
          "matchingCount": 42000,
          "cumulativePercent": 42
        },
        {
          "maxDistance": 1.242084,
          "matchingCount": 42999,
          "cumulativePercent": 42.999
        },
        {
          "maxDistance": 1.280777,
          "matchingCount": 43999,
          "cumulativePercent": 43.999
        },
        {
          "maxDistance": 1.31784,
          "matchingCount": 44999,
          "cumulativePercent": 44.999
        },
        {
          "maxDistance": 1.356581,
          "matchingCount": 45999,
          "cumulativePercent": 45.999
        },
        {
          "maxDistance": 1.398453,
          "matchingCount": 46999,
          "cumulativePercent": 46.999
        },
        {
          "maxDistance": 1.438017,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 1.48031,
          "matchingCount": 48999,
          "cumulativePercent": 48.999
        },
        {
          "maxDistance": 1.525506,
          "matchingCount": 49999,
          "cumulativePercent": 49.999
        },
        {
          "maxDistance": 1.619733,
          "matchingCount": 52000,
          "cumulativePercent": 52
        },
        {
          "maxDistance": 1.714445,
          "matchingCount": 53999,
          "cumulativePercent": 53.999
        },
        {
          "maxDistance": 1.813007,
          "matchingCount": 55999,
          "cumulativePercent": 55.999
        },
        {
          "maxDistance": 1.922117,
          "matchingCount": 57999,
          "cumulativePercent": 57.999
        },
        {
          "maxDistance": 2.036601,
          "matchingCount": 60000,
          "cumulativePercent": 60
        },
        {
          "maxDistance": 2.156425,
          "matchingCount": 62000,
          "cumulativePercent": 62
        },
        {
          "maxDistance": 2.279334,
          "matchingCount": 63999,
          "cumulativePercent": 63.999
        },
        {
          "maxDistance": 2.413073,
          "matchingCount": 65999,
          "cumulativePercent": 65.999
        },
        {
          "maxDistance": 2.550893,
          "matchingCount": 67999,
          "cumulativePercent": 67.999
        },
        {
          "maxDistance": 2.70091,
          "matchingCount": 70000,
          "cumulativePercent": 70
        },
        {
          "maxDistance": 2.860699,
          "matchingCount": 72000,
          "cumulativePercent": 72
        },
        {
          "maxDistance": 3.033872,
          "matchingCount": 73999,
          "cumulativePercent": 73.999
        },
        {
          "maxDistance": 3.224414,
          "matchingCount": 75999,
          "cumulativePercent": 75.999
        },
        {
          "maxDistance": 3.416112,
          "matchingCount": 78000,
          "cumulativePercent": 78
        },
        {
          "maxDistance": 3.624033,
          "matchingCount": 80000,
          "cumulativePercent": 80
        },
        {
          "maxDistance": 3.872373,
          "matchingCount": 82000,
          "cumulativePercent": 82
        },
        {
          "maxDistance": 4.167428,
          "matchingCount": 84000,
          "cumulativePercent": 84
        },
        {
          "maxDistance": 4.483901,
          "matchingCount": 86000,
          "cumulativePercent": 86
        },
        {
          "maxDistance": 4.842388,
          "matchingCount": 87999,
          "cumulativePercent": 87.999
        },
        {
          "maxDistance": 5.295142,
          "matchingCount": 89999,
          "cumulativePercent": 89.999
        },
        {
          "maxDistance": 5.899715,
          "matchingCount": 91999,
          "cumulativePercent": 91.999
        },
        {
          "maxDistance": 6.705018,
          "matchingCount": 93999,
          "cumulativePercent": 93.999
        },
        {
          "maxDistance": 7.967682,
          "matchingCount": 95999,
          "cumulativePercent": 95.999
        },
        {
          "maxDistance": 10.302669,
          "matchingCount": 98000,
          "cumulativePercent": 98
        },
        {
          "maxDistance": 30.025391,
          "matchingCount": 100000,
          "cumulativePercent": 100
        }
      ]
    },
    "feat_harmonic_sextile_alignment": {
      "featureId": "feat_harmonic_sextile_alignment",
      "featureName": "Harmonic Sextile Alignment",
      "category": "aspect",
      "unit": "degrees",
      "idealTarget": 60,
      "validSampleSize": 100000,
      "min": 0.000009,
      "max": 8.509999,
      "mean": 1.496193,
      "median": 1.064779,
      "p01": 0.016068,
      "p05": 0.079524,
      "p10": 0.163011,
      "p25": 0.447938,
      "p75": 2.11575,
      "p90": 3.516571,
      "quantiles": [
        {
          "maxDistance": 0.000164,
          "matchingCount": 9,
          "cumulativePercent": 0.009
        },
        {
          "maxDistance": 0.000833,
          "matchingCount": 50,
          "cumulativePercent": 0.05
        },
        {
          "maxDistance": 0.001586,
          "matchingCount": 99,
          "cumulativePercent": 0.099
        },
        {
          "maxDistance": 0.00316,
          "matchingCount": 199,
          "cumulativePercent": 0.199
        },
        {
          "maxDistance": 0.004876,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 0.006357,
          "matchingCount": 400,
          "cumulativePercent": 0.4
        },
        {
          "maxDistance": 0.007902,
          "matchingCount": 499,
          "cumulativePercent": 0.499
        },
        {
          "maxDistance": 0.009637,
          "matchingCount": 600,
          "cumulativePercent": 0.6
        },
        {
          "maxDistance": 0.011355,
          "matchingCount": 699,
          "cumulativePercent": 0.699
        },
        {
          "maxDistance": 0.013001,
          "matchingCount": 799,
          "cumulativePercent": 0.799
        },
        {
          "maxDistance": 0.014413,
          "matchingCount": 900,
          "cumulativePercent": 0.9
        },
        {
          "maxDistance": 0.016068,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 0.020015,
          "matchingCount": 1249,
          "cumulativePercent": 1.249
        },
        {
          "maxDistance": 0.023801,
          "matchingCount": 1499,
          "cumulativePercent": 1.499
        },
        {
          "maxDistance": 0.027299,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 0.031054,
          "matchingCount": 2000,
          "cumulativePercent": 2
        },
        {
          "maxDistance": 0.038325,
          "matchingCount": 2499,
          "cumulativePercent": 2.499
        },
        {
          "maxDistance": 0.046296,
          "matchingCount": 2999,
          "cumulativePercent": 2.999
        },
        {
          "maxDistance": 0.05414,
          "matchingCount": 3499,
          "cumulativePercent": 3.499
        },
        {
          "maxDistance": 0.062727,
          "matchingCount": 3999,
          "cumulativePercent": 3.999
        },
        {
          "maxDistance": 0.071265,
          "matchingCount": 4499,
          "cumulativePercent": 4.499
        },
        {
          "maxDistance": 0.079524,
          "matchingCount": 4999,
          "cumulativePercent": 4.999
        },
        {
          "maxDistance": 0.095733,
          "matchingCount": 6000,
          "cumulativePercent": 6
        },
        {
          "maxDistance": 0.111644,
          "matchingCount": 7000,
          "cumulativePercent": 7
        },
        {
          "maxDistance": 0.128518,
          "matchingCount": 8000,
          "cumulativePercent": 8
        },
        {
          "maxDistance": 0.145906,
          "matchingCount": 9000,
          "cumulativePercent": 9
        },
        {
          "maxDistance": 0.163011,
          "matchingCount": 10000,
          "cumulativePercent": 10
        },
        {
          "maxDistance": 0.180001,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 0.198719,
          "matchingCount": 11999,
          "cumulativePercent": 11.999
        },
        {
          "maxDistance": 0.215828,
          "matchingCount": 12999,
          "cumulativePercent": 12.999
        },
        {
          "maxDistance": 0.234415,
          "matchingCount": 13999,
          "cumulativePercent": 13.999
        },
        {
          "maxDistance": 0.252102,
          "matchingCount": 15000,
          "cumulativePercent": 15
        },
        {
          "maxDistance": 0.270594,
          "matchingCount": 15999,
          "cumulativePercent": 15.999
        },
        {
          "maxDistance": 0.289301,
          "matchingCount": 17000,
          "cumulativePercent": 17
        },
        {
          "maxDistance": 0.309225,
          "matchingCount": 18000,
          "cumulativePercent": 18
        },
        {
          "maxDistance": 0.329231,
          "matchingCount": 19000,
          "cumulativePercent": 19
        },
        {
          "maxDistance": 0.348218,
          "matchingCount": 20000,
          "cumulativePercent": 20
        },
        {
          "maxDistance": 0.367505,
          "matchingCount": 20999,
          "cumulativePercent": 20.999
        },
        {
          "maxDistance": 0.388206,
          "matchingCount": 22000,
          "cumulativePercent": 22
        },
        {
          "maxDistance": 0.406926,
          "matchingCount": 22999,
          "cumulativePercent": 22.999
        },
        {
          "maxDistance": 0.427182,
          "matchingCount": 23999,
          "cumulativePercent": 23.999
        },
        {
          "maxDistance": 0.447938,
          "matchingCount": 24999,
          "cumulativePercent": 24.999
        },
        {
          "maxDistance": 0.469074,
          "matchingCount": 26000,
          "cumulativePercent": 26
        },
        {
          "maxDistance": 0.491974,
          "matchingCount": 26999,
          "cumulativePercent": 26.999
        },
        {
          "maxDistance": 0.513832,
          "matchingCount": 28000,
          "cumulativePercent": 28
        },
        {
          "maxDistance": 0.535456,
          "matchingCount": 28999,
          "cumulativePercent": 28.999
        },
        {
          "maxDistance": 0.558165,
          "matchingCount": 29999,
          "cumulativePercent": 29.999
        },
        {
          "maxDistance": 0.579571,
          "matchingCount": 31000,
          "cumulativePercent": 31
        },
        {
          "maxDistance": 0.601603,
          "matchingCount": 31999,
          "cumulativePercent": 31.999
        },
        {
          "maxDistance": 0.62565,
          "matchingCount": 32999,
          "cumulativePercent": 32.999
        },
        {
          "maxDistance": 0.649208,
          "matchingCount": 33999,
          "cumulativePercent": 33.999
        },
        {
          "maxDistance": 0.673967,
          "matchingCount": 35000,
          "cumulativePercent": 35
        },
        {
          "maxDistance": 0.698628,
          "matchingCount": 35999,
          "cumulativePercent": 35.999
        },
        {
          "maxDistance": 0.722952,
          "matchingCount": 37000,
          "cumulativePercent": 37
        },
        {
          "maxDistance": 0.748231,
          "matchingCount": 38000,
          "cumulativePercent": 38
        },
        {
          "maxDistance": 0.773899,
          "matchingCount": 39000,
          "cumulativePercent": 39
        },
        {
          "maxDistance": 0.798278,
          "matchingCount": 39999,
          "cumulativePercent": 39.999
        },
        {
          "maxDistance": 0.82305,
          "matchingCount": 41000,
          "cumulativePercent": 41
        },
        {
          "maxDistance": 0.848679,
          "matchingCount": 41999,
          "cumulativePercent": 41.999
        },
        {
          "maxDistance": 0.874314,
          "matchingCount": 43000,
          "cumulativePercent": 43
        },
        {
          "maxDistance": 0.900803,
          "matchingCount": 44000,
          "cumulativePercent": 44
        },
        {
          "maxDistance": 0.926403,
          "matchingCount": 45000,
          "cumulativePercent": 45
        },
        {
          "maxDistance": 0.951371,
          "matchingCount": 46000,
          "cumulativePercent": 46
        },
        {
          "maxDistance": 0.976409,
          "matchingCount": 47000,
          "cumulativePercent": 47
        },
        {
          "maxDistance": 1.004103,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 1.034795,
          "matchingCount": 49000,
          "cumulativePercent": 49
        },
        {
          "maxDistance": 1.064779,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 1.12497,
          "matchingCount": 52000,
          "cumulativePercent": 52
        },
        {
          "maxDistance": 1.188288,
          "matchingCount": 54000,
          "cumulativePercent": 54
        },
        {
          "maxDistance": 1.252466,
          "matchingCount": 56000,
          "cumulativePercent": 56
        },
        {
          "maxDistance": 1.322005,
          "matchingCount": 58000,
          "cumulativePercent": 58
        },
        {
          "maxDistance": 1.391198,
          "matchingCount": 59999,
          "cumulativePercent": 59.999
        },
        {
          "maxDistance": 1.462808,
          "matchingCount": 61999,
          "cumulativePercent": 61.999
        },
        {
          "maxDistance": 1.54323,
          "matchingCount": 63999,
          "cumulativePercent": 63.999
        },
        {
          "maxDistance": 1.63239,
          "matchingCount": 65999,
          "cumulativePercent": 65.999
        },
        {
          "maxDistance": 1.72804,
          "matchingCount": 68000,
          "cumulativePercent": 68
        },
        {
          "maxDistance": 1.835151,
          "matchingCount": 70000,
          "cumulativePercent": 70
        },
        {
          "maxDistance": 1.950897,
          "matchingCount": 71999,
          "cumulativePercent": 71.999
        },
        {
          "maxDistance": 2.062978,
          "matchingCount": 74000,
          "cumulativePercent": 74
        },
        {
          "maxDistance": 2.17654,
          "matchingCount": 75999,
          "cumulativePercent": 75.999
        },
        {
          "maxDistance": 2.316956,
          "matchingCount": 77999,
          "cumulativePercent": 77.999
        },
        {
          "maxDistance": 2.449773,
          "matchingCount": 80000,
          "cumulativePercent": 80
        },
        {
          "maxDistance": 2.611443,
          "matchingCount": 82000,
          "cumulativePercent": 82
        },
        {
          "maxDistance": 2.773958,
          "matchingCount": 83999,
          "cumulativePercent": 83.999
        },
        {
          "maxDistance": 2.984042,
          "matchingCount": 85999,
          "cumulativePercent": 85.999
        },
        {
          "maxDistance": 3.220962,
          "matchingCount": 87999,
          "cumulativePercent": 87.999
        },
        {
          "maxDistance": 3.516571,
          "matchingCount": 90000,
          "cumulativePercent": 90
        },
        {
          "maxDistance": 3.873676,
          "matchingCount": 92000,
          "cumulativePercent": 92
        },
        {
          "maxDistance": 4.303129,
          "matchingCount": 93999,
          "cumulativePercent": 93.999
        },
        {
          "maxDistance": 4.791141,
          "matchingCount": 96000,
          "cumulativePercent": 96
        },
        {
          "maxDistance": 5.419494,
          "matchingCount": 97999,
          "cumulativePercent": 97.999
        },
        {
          "maxDistance": 8.509999,
          "matchingCount": 99999,
          "cumulativePercent": 99.999
        }
      ]
    },
    "feat_triple_cluster_span": {
      "featureId": "feat_triple_cluster_span",
      "featureName": "Triple Planetary Cluster Convergence",
      "category": "planetary",
      "unit": "degrees",
      "idealTarget": 0,
      "validSampleSize": 100000,
      "min": 0.021732,
      "max": 54.886457,
      "mean": 14.70798,
      "median": 13.497774,
      "p01": 1.420909,
      "p05": 3.333386,
      "p10": 4.904063,
      "p25": 8.208916,
      "p75": 19.609938,
      "p90": 26.211038,
      "quantiles": [
        {
          "maxDistance": 0.11094,
          "matchingCount": 9,
          "cumulativePercent": 0.009
        },
        {
          "maxDistance": 0.302171,
          "matchingCount": 49,
          "cumulativePercent": 0.049
        },
        {
          "maxDistance": 0.448665,
          "matchingCount": 99,
          "cumulativePercent": 0.099
        },
        {
          "maxDistance": 0.599329,
          "matchingCount": 200,
          "cumulativePercent": 0.2
        },
        {
          "maxDistance": 0.743672,
          "matchingCount": 299,
          "cumulativePercent": 0.299
        },
        {
          "maxDistance": 0.907612,
          "matchingCount": 399,
          "cumulativePercent": 0.399
        },
        {
          "maxDistance": 1.011219,
          "matchingCount": 499,
          "cumulativePercent": 0.499
        },
        {
          "maxDistance": 1.10282,
          "matchingCount": 599,
          "cumulativePercent": 0.599
        },
        {
          "maxDistance": 1.187796,
          "matchingCount": 699,
          "cumulativePercent": 0.699
        },
        {
          "maxDistance": 1.266674,
          "matchingCount": 800,
          "cumulativePercent": 0.8
        },
        {
          "maxDistance": 1.354129,
          "matchingCount": 900,
          "cumulativePercent": 0.9
        },
        {
          "maxDistance": 1.420909,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 1.591857,
          "matchingCount": 1249,
          "cumulativePercent": 1.249
        },
        {
          "maxDistance": 1.746623,
          "matchingCount": 1499,
          "cumulativePercent": 1.499
        },
        {
          "maxDistance": 1.886918,
          "matchingCount": 1750,
          "cumulativePercent": 1.75
        },
        {
          "maxDistance": 2.010575,
          "matchingCount": 1999,
          "cumulativePercent": 1.999
        },
        {
          "maxDistance": 2.282907,
          "matchingCount": 2500,
          "cumulativePercent": 2.5
        },
        {
          "maxDistance": 2.550059,
          "matchingCount": 3000,
          "cumulativePercent": 3
        },
        {
          "maxDistance": 2.772545,
          "matchingCount": 3499,
          "cumulativePercent": 3.499
        },
        {
          "maxDistance": 2.968805,
          "matchingCount": 3999,
          "cumulativePercent": 3.999
        },
        {
          "maxDistance": 3.16222,
          "matchingCount": 4499,
          "cumulativePercent": 4.499
        },
        {
          "maxDistance": 3.333386,
          "matchingCount": 4999,
          "cumulativePercent": 4.999
        },
        {
          "maxDistance": 3.689928,
          "matchingCount": 6000,
          "cumulativePercent": 6
        },
        {
          "maxDistance": 4.0128,
          "matchingCount": 6999,
          "cumulativePercent": 6.999
        },
        {
          "maxDistance": 4.316254,
          "matchingCount": 7999,
          "cumulativePercent": 7.999
        },
        {
          "maxDistance": 4.606792,
          "matchingCount": 8999,
          "cumulativePercent": 8.999
        },
        {
          "maxDistance": 4.904063,
          "matchingCount": 10000,
          "cumulativePercent": 10
        },
        {
          "maxDistance": 5.195771,
          "matchingCount": 10999,
          "cumulativePercent": 10.999
        },
        {
          "maxDistance": 5.45575,
          "matchingCount": 11999,
          "cumulativePercent": 11.999
        },
        {
          "maxDistance": 5.720279,
          "matchingCount": 12999,
          "cumulativePercent": 12.999
        },
        {
          "maxDistance": 5.960775,
          "matchingCount": 13999,
          "cumulativePercent": 13.999
        },
        {
          "maxDistance": 6.209659,
          "matchingCount": 14999,
          "cumulativePercent": 14.999
        },
        {
          "maxDistance": 6.434762,
          "matchingCount": 16000,
          "cumulativePercent": 16
        },
        {
          "maxDistance": 6.668072,
          "matchingCount": 17000,
          "cumulativePercent": 17
        },
        {
          "maxDistance": 6.89693,
          "matchingCount": 17999,
          "cumulativePercent": 17.999
        },
        {
          "maxDistance": 7.098865,
          "matchingCount": 18999,
          "cumulativePercent": 18.999
        },
        {
          "maxDistance": 7.303482,
          "matchingCount": 20000,
          "cumulativePercent": 20
        },
        {
          "maxDistance": 7.490515,
          "matchingCount": 20999,
          "cumulativePercent": 20.999
        },
        {
          "maxDistance": 7.6666,
          "matchingCount": 21999,
          "cumulativePercent": 21.999
        },
        {
          "maxDistance": 7.848946,
          "matchingCount": 23000,
          "cumulativePercent": 23
        },
        {
          "maxDistance": 8.019332,
          "matchingCount": 24000,
          "cumulativePercent": 24
        },
        {
          "maxDistance": 8.208916,
          "matchingCount": 25000,
          "cumulativePercent": 25
        },
        {
          "maxDistance": 8.3614,
          "matchingCount": 25999,
          "cumulativePercent": 25.999
        },
        {
          "maxDistance": 8.547964,
          "matchingCount": 27000,
          "cumulativePercent": 27
        },
        {
          "maxDistance": 8.733473,
          "matchingCount": 28000,
          "cumulativePercent": 28
        },
        {
          "maxDistance": 8.941404,
          "matchingCount": 28999,
          "cumulativePercent": 28.999
        },
        {
          "maxDistance": 9.153027,
          "matchingCount": 29999,
          "cumulativePercent": 29.999
        },
        {
          "maxDistance": 9.37121,
          "matchingCount": 30999,
          "cumulativePercent": 30.999
        },
        {
          "maxDistance": 9.586676,
          "matchingCount": 32000,
          "cumulativePercent": 32
        },
        {
          "maxDistance": 9.789106,
          "matchingCount": 32999,
          "cumulativePercent": 32.999
        },
        {
          "maxDistance": 10.020576,
          "matchingCount": 33999,
          "cumulativePercent": 33.999
        },
        {
          "maxDistance": 10.23492,
          "matchingCount": 34999,
          "cumulativePercent": 34.999
        },
        {
          "maxDistance": 10.437103,
          "matchingCount": 35999,
          "cumulativePercent": 35.999
        },
        {
          "maxDistance": 10.661405,
          "matchingCount": 37000,
          "cumulativePercent": 37
        },
        {
          "maxDistance": 10.880084,
          "matchingCount": 38000,
          "cumulativePercent": 38
        },
        {
          "maxDistance": 11.095324,
          "matchingCount": 38999,
          "cumulativePercent": 38.999
        },
        {
          "maxDistance": 11.305406,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 11.501548,
          "matchingCount": 40999,
          "cumulativePercent": 40.999
        },
        {
          "maxDistance": 11.704689,
          "matchingCount": 41999,
          "cumulativePercent": 41.999
        },
        {
          "maxDistance": 11.928785,
          "matchingCount": 42999,
          "cumulativePercent": 42.999
        },
        {
          "maxDistance": 12.142585,
          "matchingCount": 43999,
          "cumulativePercent": 43.999
        },
        {
          "maxDistance": 12.373867,
          "matchingCount": 44999,
          "cumulativePercent": 44.999
        },
        {
          "maxDistance": 12.606364,
          "matchingCount": 46000,
          "cumulativePercent": 46
        },
        {
          "maxDistance": 12.835372,
          "matchingCount": 47000,
          "cumulativePercent": 47
        },
        {
          "maxDistance": 13.068928,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 13.289115,
          "matchingCount": 48999,
          "cumulativePercent": 48.999
        },
        {
          "maxDistance": 13.497774,
          "matchingCount": 49999,
          "cumulativePercent": 49.999
        },
        {
          "maxDistance": 13.980501,
          "matchingCount": 51999,
          "cumulativePercent": 51.999
        },
        {
          "maxDistance": 14.481512,
          "matchingCount": 53999,
          "cumulativePercent": 53.999
        },
        {
          "maxDistance": 14.930844,
          "matchingCount": 56000,
          "cumulativePercent": 56
        },
        {
          "maxDistance": 15.378562,
          "matchingCount": 58000,
          "cumulativePercent": 58
        },
        {
          "maxDistance": 15.852037,
          "matchingCount": 59999,
          "cumulativePercent": 59.999
        },
        {
          "maxDistance": 16.321848,
          "matchingCount": 62000,
          "cumulativePercent": 62
        },
        {
          "maxDistance": 16.827907,
          "matchingCount": 64000,
          "cumulativePercent": 64
        },
        {
          "maxDistance": 17.274224,
          "matchingCount": 65999,
          "cumulativePercent": 65.999
        },
        {
          "maxDistance": 17.74421,
          "matchingCount": 67999,
          "cumulativePercent": 67.999
        },
        {
          "maxDistance": 18.214079,
          "matchingCount": 69999,
          "cumulativePercent": 69.999
        },
        {
          "maxDistance": 18.768648,
          "matchingCount": 71999,
          "cumulativePercent": 71.999
        },
        {
          "maxDistance": 19.313113,
          "matchingCount": 74000,
          "cumulativePercent": 74
        },
        {
          "maxDistance": 19.905557,
          "matchingCount": 75999,
          "cumulativePercent": 75.999
        },
        {
          "maxDistance": 20.579157,
          "matchingCount": 77999,
          "cumulativePercent": 77.999
        },
        {
          "maxDistance": 21.294003,
          "matchingCount": 79999,
          "cumulativePercent": 79.999
        },
        {
          "maxDistance": 22.07522,
          "matchingCount": 81999,
          "cumulativePercent": 81.999
        },
        {
          "maxDistance": 22.886907,
          "matchingCount": 84000,
          "cumulativePercent": 84
        },
        {
          "maxDistance": 23.763879,
          "matchingCount": 85999,
          "cumulativePercent": 85.999
        },
        {
          "maxDistance": 24.929965,
          "matchingCount": 88000,
          "cumulativePercent": 88
        },
        {
          "maxDistance": 26.211038,
          "matchingCount": 90000,
          "cumulativePercent": 90
        },
        {
          "maxDistance": 27.641773,
          "matchingCount": 91999,
          "cumulativePercent": 91.999
        },
        {
          "maxDistance": 29.379632,
          "matchingCount": 93999,
          "cumulativePercent": 93.999
        },
        {
          "maxDistance": 31.927752,
          "matchingCount": 96000,
          "cumulativePercent": 96
        },
        {
          "maxDistance": 36.000034,
          "matchingCount": 98000,
          "cumulativePercent": 98
        },
        {
          "maxDistance": 54.886457,
          "matchingCount": 100000,
          "cumulativePercent": 100
        }
      ]
    },
    "feat_grand_trine_geometry": {
      "featureId": "feat_grand_trine_geometry",
      "featureName": "Equilateral Grand Trine Geometry",
      "category": "structural",
      "unit": "degrees",
      "idealTarget": 120,
      "validSampleSize": 100000,
      "min": 0.042035,
      "max": 89.164243,
      "mean": 27.030128,
      "median": 22.319401,
      "p01": 1.813598,
      "p05": 4.550811,
      "p10": 6.71342,
      "p25": 11.76819,
      "p75": 42.642826,
      "p90": 52.323006,
      "quantiles": [
        {
          "maxDistance": 0.125806,
          "matchingCount": 9,
          "cumulativePercent": 0.009
        },
        {
          "maxDistance": 0.294707,
          "matchingCount": 50,
          "cumulativePercent": 0.05
        },
        {
          "maxDistance": 0.422495,
          "matchingCount": 99,
          "cumulativePercent": 0.099
        },
        {
          "maxDistance": 0.704897,
          "matchingCount": 200,
          "cumulativePercent": 0.2
        },
        {
          "maxDistance": 0.898174,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 1.054384,
          "matchingCount": 399,
          "cumulativePercent": 0.399
        },
        {
          "maxDistance": 1.177143,
          "matchingCount": 499,
          "cumulativePercent": 0.499
        },
        {
          "maxDistance": 1.31111,
          "matchingCount": 600,
          "cumulativePercent": 0.6
        },
        {
          "maxDistance": 1.437445,
          "matchingCount": 699,
          "cumulativePercent": 0.699
        },
        {
          "maxDistance": 1.549749,
          "matchingCount": 799,
          "cumulativePercent": 0.799
        },
        {
          "maxDistance": 1.679694,
          "matchingCount": 900,
          "cumulativePercent": 0.9
        },
        {
          "maxDistance": 1.813598,
          "matchingCount": 1000,
          "cumulativePercent": 1
        },
        {
          "maxDistance": 2.057133,
          "matchingCount": 1249,
          "cumulativePercent": 1.249
        },
        {
          "maxDistance": 2.313712,
          "matchingCount": 1500,
          "cumulativePercent": 1.5
        },
        {
          "maxDistance": 2.545846,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 2.751192,
          "matchingCount": 1999,
          "cumulativePercent": 1.999
        },
        {
          "maxDistance": 3.117153,
          "matchingCount": 2500,
          "cumulativePercent": 2.5
        },
        {
          "maxDistance": 3.427834,
          "matchingCount": 3000,
          "cumulativePercent": 3
        },
        {
          "maxDistance": 3.752973,
          "matchingCount": 3500,
          "cumulativePercent": 3.5
        },
        {
          "maxDistance": 4.033347,
          "matchingCount": 4000,
          "cumulativePercent": 4
        },
        {
          "maxDistance": 4.309049,
          "matchingCount": 4499,
          "cumulativePercent": 4.499
        },
        {
          "maxDistance": 4.550811,
          "matchingCount": 5000,
          "cumulativePercent": 5
        },
        {
          "maxDistance": 5.084358,
          "matchingCount": 6000,
          "cumulativePercent": 6
        },
        {
          "maxDistance": 5.515794,
          "matchingCount": 6999,
          "cumulativePercent": 6.999
        },
        {
          "maxDistance": 5.929488,
          "matchingCount": 7999,
          "cumulativePercent": 7.999
        },
        {
          "maxDistance": 6.314579,
          "matchingCount": 9000,
          "cumulativePercent": 9
        },
        {
          "maxDistance": 6.71342,
          "matchingCount": 10000,
          "cumulativePercent": 10
        },
        {
          "maxDistance": 7.082954,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 7.419379,
          "matchingCount": 11999,
          "cumulativePercent": 11.999
        },
        {
          "maxDistance": 7.78988,
          "matchingCount": 13000,
          "cumulativePercent": 13
        },
        {
          "maxDistance": 8.181142,
          "matchingCount": 13999,
          "cumulativePercent": 13.999
        },
        {
          "maxDistance": 8.54043,
          "matchingCount": 15000,
          "cumulativePercent": 15
        },
        {
          "maxDistance": 8.896438,
          "matchingCount": 15999,
          "cumulativePercent": 15.999
        },
        {
          "maxDistance": 9.265582,
          "matchingCount": 17000,
          "cumulativePercent": 17
        },
        {
          "maxDistance": 9.592555,
          "matchingCount": 18000,
          "cumulativePercent": 18
        },
        {
          "maxDistance": 9.898234,
          "matchingCount": 19000,
          "cumulativePercent": 19
        },
        {
          "maxDistance": 10.199199,
          "matchingCount": 20000,
          "cumulativePercent": 20
        },
        {
          "maxDistance": 10.48955,
          "matchingCount": 20999,
          "cumulativePercent": 20.999
        },
        {
          "maxDistance": 10.79967,
          "matchingCount": 21999,
          "cumulativePercent": 21.999
        },
        {
          "maxDistance": 11.122106,
          "matchingCount": 22999,
          "cumulativePercent": 22.999
        },
        {
          "maxDistance": 11.439083,
          "matchingCount": 23999,
          "cumulativePercent": 23.999
        },
        {
          "maxDistance": 11.76819,
          "matchingCount": 24999,
          "cumulativePercent": 24.999
        },
        {
          "maxDistance": 12.070324,
          "matchingCount": 26000,
          "cumulativePercent": 26
        },
        {
          "maxDistance": 12.427681,
          "matchingCount": 26999,
          "cumulativePercent": 26.999
        },
        {
          "maxDistance": 12.805949,
          "matchingCount": 27999,
          "cumulativePercent": 27.999
        },
        {
          "maxDistance": 13.154257,
          "matchingCount": 29000,
          "cumulativePercent": 29
        },
        {
          "maxDistance": 13.543709,
          "matchingCount": 30000,
          "cumulativePercent": 30
        },
        {
          "maxDistance": 13.930616,
          "matchingCount": 31000,
          "cumulativePercent": 31
        },
        {
          "maxDistance": 14.275965,
          "matchingCount": 32000,
          "cumulativePercent": 32
        },
        {
          "maxDistance": 14.655918,
          "matchingCount": 32999,
          "cumulativePercent": 32.999
        },
        {
          "maxDistance": 15.058633,
          "matchingCount": 34000,
          "cumulativePercent": 34
        },
        {
          "maxDistance": 15.456505,
          "matchingCount": 34999,
          "cumulativePercent": 34.999
        },
        {
          "maxDistance": 15.859069,
          "matchingCount": 35999,
          "cumulativePercent": 35.999
        },
        {
          "maxDistance": 16.2682,
          "matchingCount": 36999,
          "cumulativePercent": 36.999
        },
        {
          "maxDistance": 16.688866,
          "matchingCount": 38000,
          "cumulativePercent": 38
        },
        {
          "maxDistance": 17.062171,
          "matchingCount": 39000,
          "cumulativePercent": 39
        },
        {
          "maxDistance": 17.446276,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 17.824893,
          "matchingCount": 40999,
          "cumulativePercent": 40.999
        },
        {
          "maxDistance": 18.29322,
          "matchingCount": 41999,
          "cumulativePercent": 41.999
        },
        {
          "maxDistance": 18.795008,
          "matchingCount": 43000,
          "cumulativePercent": 43
        },
        {
          "maxDistance": 19.283296,
          "matchingCount": 44000,
          "cumulativePercent": 44
        },
        {
          "maxDistance": 19.820329,
          "matchingCount": 45000,
          "cumulativePercent": 45
        },
        {
          "maxDistance": 20.303713,
          "matchingCount": 46000,
          "cumulativePercent": 46
        },
        {
          "maxDistance": 20.756843,
          "matchingCount": 46999,
          "cumulativePercent": 46.999
        },
        {
          "maxDistance": 21.217814,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 21.746794,
          "matchingCount": 48999,
          "cumulativePercent": 48.999
        },
        {
          "maxDistance": 22.319401,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 23.45244,
          "matchingCount": 51999,
          "cumulativePercent": 51.999
        },
        {
          "maxDistance": 24.607467,
          "matchingCount": 54000,
          "cumulativePercent": 54
        },
        {
          "maxDistance": 25.960631,
          "matchingCount": 55999,
          "cumulativePercent": 55.999
        },
        {
          "maxDistance": 27.40872,
          "matchingCount": 57999,
          "cumulativePercent": 57.999
        },
        {
          "maxDistance": 29.116912,
          "matchingCount": 59999,
          "cumulativePercent": 59.999
        },
        {
          "maxDistance": 30.704272,
          "matchingCount": 61999,
          "cumulativePercent": 61.999
        },
        {
          "maxDistance": 32.570342,
          "matchingCount": 63999,
          "cumulativePercent": 63.999
        },
        {
          "maxDistance": 34.424231,
          "matchingCount": 65999,
          "cumulativePercent": 65.999
        },
        {
          "maxDistance": 36.393695,
          "matchingCount": 68000,
          "cumulativePercent": 68
        },
        {
          "maxDistance": 38.524791,
          "matchingCount": 69999,
          "cumulativePercent": 69.999
        },
        {
          "maxDistance": 40.713123,
          "matchingCount": 72000,
          "cumulativePercent": 72
        },
        {
          "maxDistance": 42.014662,
          "matchingCount": 73999,
          "cumulativePercent": 73.999
        },
        {
          "maxDistance": 43.26332,
          "matchingCount": 75999,
          "cumulativePercent": 75.999
        },
        {
          "maxDistance": 44.299669,
          "matchingCount": 78000,
          "cumulativePercent": 78
        },
        {
          "maxDistance": 45.381834,
          "matchingCount": 80000,
          "cumulativePercent": 80
        },
        {
          "maxDistance": 46.41024,
          "matchingCount": 82000,
          "cumulativePercent": 82
        },
        {
          "maxDistance": 47.660743,
          "matchingCount": 83999,
          "cumulativePercent": 83.999
        },
        {
          "maxDistance": 48.979974,
          "matchingCount": 86000,
          "cumulativePercent": 86
        },
        {
          "maxDistance": 50.555198,
          "matchingCount": 87999,
          "cumulativePercent": 87.999
        },
        {
          "maxDistance": 52.323006,
          "matchingCount": 90000,
          "cumulativePercent": 90
        },
        {
          "maxDistance": 54.622548,
          "matchingCount": 92000,
          "cumulativePercent": 92
        },
        {
          "maxDistance": 57.591756,
          "matchingCount": 94000,
          "cumulativePercent": 94
        },
        {
          "maxDistance": 60.823513,
          "matchingCount": 96000,
          "cumulativePercent": 96
        },
        {
          "maxDistance": 65.05702,
          "matchingCount": 97999,
          "cumulativePercent": 97.999
        },
        {
          "maxDistance": 89.164243,
          "matchingCount": 100000,
          "cumulativePercent": 100
        }
      ]
    },
    "feat_t_square_geometry": {
      "featureId": "feat_t_square_geometry",
      "featureName": "Focal T-Square Axis Geometry",
      "category": "structural",
      "unit": "degrees",
      "idealTarget": 90,
      "validSampleSize": 100000,
      "min": 0.044314,
      "max": 107.790707,
      "mean": 13.92069,
      "median": 10.158959,
      "p01": 1.040111,
      "p05": 2.425751,
      "p10": 3.505477,
      "p25": 6.055576,
      "p75": 16.729771,
      "p90": 27.683146,
      "quantiles": [
        {
          "maxDistance": 0.094404,
          "matchingCount": 9,
          "cumulativePercent": 0.009
        },
        {
          "maxDistance": 0.202965,
          "matchingCount": 50,
          "cumulativePercent": 0.05
        },
        {
          "maxDistance": 0.320631,
          "matchingCount": 99,
          "cumulativePercent": 0.099
        },
        {
          "maxDistance": 0.479499,
          "matchingCount": 200,
          "cumulativePercent": 0.2
        },
        {
          "maxDistance": 0.572373,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 0.638752,
          "matchingCount": 399,
          "cumulativePercent": 0.399
        },
        {
          "maxDistance": 0.735041,
          "matchingCount": 499,
          "cumulativePercent": 0.499
        },
        {
          "maxDistance": 0.788479,
          "matchingCount": 599,
          "cumulativePercent": 0.599
        },
        {
          "maxDistance": 0.861937,
          "matchingCount": 700,
          "cumulativePercent": 0.7
        },
        {
          "maxDistance": 0.92626,
          "matchingCount": 800,
          "cumulativePercent": 0.8
        },
        {
          "maxDistance": 0.984448,
          "matchingCount": 899,
          "cumulativePercent": 0.899
        },
        {
          "maxDistance": 1.040111,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 1.158427,
          "matchingCount": 1249,
          "cumulativePercent": 1.249
        },
        {
          "maxDistance": 1.275921,
          "matchingCount": 1500,
          "cumulativePercent": 1.5
        },
        {
          "maxDistance": 1.384415,
          "matchingCount": 1749,
          "cumulativePercent": 1.749
        },
        {
          "maxDistance": 1.498378,
          "matchingCount": 2000,
          "cumulativePercent": 2
        },
        {
          "maxDistance": 1.674365,
          "matchingCount": 2499,
          "cumulativePercent": 2.499
        },
        {
          "maxDistance": 1.834198,
          "matchingCount": 3000,
          "cumulativePercent": 3
        },
        {
          "maxDistance": 1.983807,
          "matchingCount": 3499,
          "cumulativePercent": 3.499
        },
        {
          "maxDistance": 2.142047,
          "matchingCount": 4000,
          "cumulativePercent": 4
        },
        {
          "maxDistance": 2.294221,
          "matchingCount": 4499,
          "cumulativePercent": 4.499
        },
        {
          "maxDistance": 2.425751,
          "matchingCount": 5000,
          "cumulativePercent": 5
        },
        {
          "maxDistance": 2.649107,
          "matchingCount": 5999,
          "cumulativePercent": 5.999
        },
        {
          "maxDistance": 2.866243,
          "matchingCount": 6999,
          "cumulativePercent": 6.999
        },
        {
          "maxDistance": 3.082651,
          "matchingCount": 8000,
          "cumulativePercent": 8
        },
        {
          "maxDistance": 3.30155,
          "matchingCount": 8999,
          "cumulativePercent": 8.999
        },
        {
          "maxDistance": 3.505477,
          "matchingCount": 9999,
          "cumulativePercent": 9.999
        },
        {
          "maxDistance": 3.690942,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 3.878223,
          "matchingCount": 11999,
          "cumulativePercent": 11.999
        },
        {
          "maxDistance": 4.059041,
          "matchingCount": 12999,
          "cumulativePercent": 12.999
        },
        {
          "maxDistance": 4.225506,
          "matchingCount": 14000,
          "cumulativePercent": 14
        },
        {
          "maxDistance": 4.391434,
          "matchingCount": 14999,
          "cumulativePercent": 14.999
        },
        {
          "maxDistance": 4.560509,
          "matchingCount": 16000,
          "cumulativePercent": 16
        },
        {
          "maxDistance": 4.729152,
          "matchingCount": 17000,
          "cumulativePercent": 17
        },
        {
          "maxDistance": 4.896137,
          "matchingCount": 17999,
          "cumulativePercent": 17.999
        },
        {
          "maxDistance": 5.068159,
          "matchingCount": 19000,
          "cumulativePercent": 19
        },
        {
          "maxDistance": 5.235057,
          "matchingCount": 19999,
          "cumulativePercent": 19.999
        },
        {
          "maxDistance": 5.398636,
          "matchingCount": 20999,
          "cumulativePercent": 20.999
        },
        {
          "maxDistance": 5.565212,
          "matchingCount": 22000,
          "cumulativePercent": 22
        },
        {
          "maxDistance": 5.73032,
          "matchingCount": 22999,
          "cumulativePercent": 22.999
        },
        {
          "maxDistance": 5.896639,
          "matchingCount": 23999,
          "cumulativePercent": 23.999
        },
        {
          "maxDistance": 6.055576,
          "matchingCount": 24999,
          "cumulativePercent": 24.999
        },
        {
          "maxDistance": 6.216316,
          "matchingCount": 26000,
          "cumulativePercent": 26
        },
        {
          "maxDistance": 6.378003,
          "matchingCount": 27000,
          "cumulativePercent": 27
        },
        {
          "maxDistance": 6.527051,
          "matchingCount": 27999,
          "cumulativePercent": 27.999
        },
        {
          "maxDistance": 6.677059,
          "matchingCount": 29001,
          "cumulativePercent": 29.001
        },
        {
          "maxDistance": 6.834432,
          "matchingCount": 30000,
          "cumulativePercent": 30
        },
        {
          "maxDistance": 6.983737,
          "matchingCount": 30999,
          "cumulativePercent": 30.999
        },
        {
          "maxDistance": 7.129735,
          "matchingCount": 31999,
          "cumulativePercent": 31.999
        },
        {
          "maxDistance": 7.285922,
          "matchingCount": 33000,
          "cumulativePercent": 33
        },
        {
          "maxDistance": 7.432084,
          "matchingCount": 34000,
          "cumulativePercent": 34
        },
        {
          "maxDistance": 7.589592,
          "matchingCount": 34999,
          "cumulativePercent": 34.999
        },
        {
          "maxDistance": 7.725996,
          "matchingCount": 35999,
          "cumulativePercent": 35.999
        },
        {
          "maxDistance": 7.882875,
          "matchingCount": 36999,
          "cumulativePercent": 36.999
        },
        {
          "maxDistance": 8.041764,
          "matchingCount": 37999,
          "cumulativePercent": 37.999
        },
        {
          "maxDistance": 8.194732,
          "matchingCount": 38999,
          "cumulativePercent": 38.999
        },
        {
          "maxDistance": 8.354234,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 8.527782,
          "matchingCount": 40999,
          "cumulativePercent": 40.999
        },
        {
          "maxDistance": 8.703855,
          "matchingCount": 42000,
          "cumulativePercent": 42
        },
        {
          "maxDistance": 8.872501,
          "matchingCount": 43000,
          "cumulativePercent": 43
        },
        {
          "maxDistance": 9.053913,
          "matchingCount": 43999,
          "cumulativePercent": 43.999
        },
        {
          "maxDistance": 9.230725,
          "matchingCount": 45000,
          "cumulativePercent": 45
        },
        {
          "maxDistance": 9.418095,
          "matchingCount": 46000,
          "cumulativePercent": 46
        },
        {
          "maxDistance": 9.612907,
          "matchingCount": 47000,
          "cumulativePercent": 47
        },
        {
          "maxDistance": 9.794215,
          "matchingCount": 48000,
          "cumulativePercent": 48
        },
        {
          "maxDistance": 9.97704,
          "matchingCount": 48999,
          "cumulativePercent": 48.999
        },
        {
          "maxDistance": 10.158959,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 10.538413,
          "matchingCount": 51999,
          "cumulativePercent": 51.999
        },
        {
          "maxDistance": 10.937315,
          "matchingCount": 53999,
          "cumulativePercent": 53.999
        },
        {
          "maxDistance": 11.34487,
          "matchingCount": 56000,
          "cumulativePercent": 56
        },
        {
          "maxDistance": 11.790364,
          "matchingCount": 57999,
          "cumulativePercent": 57.999
        },
        {
          "maxDistance": 12.248385,
          "matchingCount": 60000,
          "cumulativePercent": 60
        },
        {
          "maxDistance": 12.752083,
          "matchingCount": 62000,
          "cumulativePercent": 62
        },
        {
          "maxDistance": 13.250855,
          "matchingCount": 63999,
          "cumulativePercent": 63.999
        },
        {
          "maxDistance": 13.775976,
          "matchingCount": 66000,
          "cumulativePercent": 66
        },
        {
          "maxDistance": 14.366711,
          "matchingCount": 68000,
          "cumulativePercent": 68
        },
        {
          "maxDistance": 14.989798,
          "matchingCount": 69999,
          "cumulativePercent": 69.999
        },
        {
          "maxDistance": 15.61313,
          "matchingCount": 72000,
          "cumulativePercent": 72
        },
        {
          "maxDistance": 16.348274,
          "matchingCount": 74000,
          "cumulativePercent": 74
        },
        {
          "maxDistance": 17.138057,
          "matchingCount": 75999,
          "cumulativePercent": 75.999
        },
        {
          "maxDistance": 17.9195,
          "matchingCount": 77999,
          "cumulativePercent": 77.999
        },
        {
          "maxDistance": 18.896814,
          "matchingCount": 79999,
          "cumulativePercent": 79.999
        },
        {
          "maxDistance": 20.022103,
          "matchingCount": 82000,
          "cumulativePercent": 82
        },
        {
          "maxDistance": 21.296041,
          "matchingCount": 83999,
          "cumulativePercent": 83.999
        },
        {
          "maxDistance": 22.747251,
          "matchingCount": 86000,
          "cumulativePercent": 86
        },
        {
          "maxDistance": 24.876842,
          "matchingCount": 87999,
          "cumulativePercent": 87.999
        },
        {
          "maxDistance": 27.683146,
          "matchingCount": 90000,
          "cumulativePercent": 90
        },
        {
          "maxDistance": 31.351962,
          "matchingCount": 91999,
          "cumulativePercent": 91.999
        },
        {
          "maxDistance": 36.820687,
          "matchingCount": 94000,
          "cumulativePercent": 94
        },
        {
          "maxDistance": 46.475877,
          "matchingCount": 96000,
          "cumulativePercent": 96
        },
        {
          "maxDistance": 59.770555,
          "matchingCount": 98000,
          "cumulativePercent": 98
        },
        {
          "maxDistance": 107.790707,
          "matchingCount": 100000,
          "cumulativePercent": 100
        }
      ]
    },
    "feat_yod_inconjunct_geometry": {
      "featureId": "feat_yod_inconjunct_geometry",
      "featureName": "Harmonic Yod Apex Geometry",
      "category": "structural",
      "unit": "degrees",
      "idealTarget": 150,
      "validSampleSize": 100000,
      "min": 0.015421,
      "max": 78.99921,
      "mean": 13.900618,
      "median": 10.065588,
      "p01": 0.858539,
      "p05": 2.018046,
      "p10": 3.022412,
      "p25": 5.441499,
      "p75": 19.592605,
      "p90": 29.269731,
      "quantiles": [
        {
          "maxDistance": 0.072536,
          "matchingCount": 10,
          "cumulativePercent": 0.01
        },
        {
          "maxDistance": 0.171988,
          "matchingCount": 49,
          "cumulativePercent": 0.049
        },
        {
          "maxDistance": 0.243974,
          "matchingCount": 99,
          "cumulativePercent": 0.099
        },
        {
          "maxDistance": 0.363216,
          "matchingCount": 200,
          "cumulativePercent": 0.2
        },
        {
          "maxDistance": 0.445647,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 0.531869,
          "matchingCount": 400,
          "cumulativePercent": 0.4
        },
        {
          "maxDistance": 0.606181,
          "matchingCount": 500,
          "cumulativePercent": 0.5
        },
        {
          "maxDistance": 0.668223,
          "matchingCount": 599,
          "cumulativePercent": 0.599
        },
        {
          "maxDistance": 0.722516,
          "matchingCount": 699,
          "cumulativePercent": 0.699
        },
        {
          "maxDistance": 0.772899,
          "matchingCount": 800,
          "cumulativePercent": 0.8
        },
        {
          "maxDistance": 0.817074,
          "matchingCount": 899,
          "cumulativePercent": 0.899
        },
        {
          "maxDistance": 0.858539,
          "matchingCount": 1000,
          "cumulativePercent": 1
        },
        {
          "maxDistance": 0.957977,
          "matchingCount": 1250,
          "cumulativePercent": 1.25
        },
        {
          "maxDistance": 1.038507,
          "matchingCount": 1500,
          "cumulativePercent": 1.5
        },
        {
          "maxDistance": 1.139451,
          "matchingCount": 1750,
          "cumulativePercent": 1.75
        },
        {
          "maxDistance": 1.230693,
          "matchingCount": 1999,
          "cumulativePercent": 1.999
        },
        {
          "maxDistance": 1.376864,
          "matchingCount": 2500,
          "cumulativePercent": 2.5
        },
        {
          "maxDistance": 1.512108,
          "matchingCount": 2999,
          "cumulativePercent": 2.999
        },
        {
          "maxDistance": 1.64063,
          "matchingCount": 3500,
          "cumulativePercent": 3.5
        },
        {
          "maxDistance": 1.776046,
          "matchingCount": 3999,
          "cumulativePercent": 3.999
        },
        {
          "maxDistance": 1.90589,
          "matchingCount": 4500,
          "cumulativePercent": 4.5
        },
        {
          "maxDistance": 2.018046,
          "matchingCount": 5000,
          "cumulativePercent": 5
        },
        {
          "maxDistance": 2.23231,
          "matchingCount": 6000,
          "cumulativePercent": 6
        },
        {
          "maxDistance": 2.452969,
          "matchingCount": 7000,
          "cumulativePercent": 7
        },
        {
          "maxDistance": 2.661059,
          "matchingCount": 7999,
          "cumulativePercent": 7.999
        },
        {
          "maxDistance": 2.84703,
          "matchingCount": 8999,
          "cumulativePercent": 8.999
        },
        {
          "maxDistance": 3.022412,
          "matchingCount": 9999,
          "cumulativePercent": 9.999
        },
        {
          "maxDistance": 3.203758,
          "matchingCount": 11000,
          "cumulativePercent": 11
        },
        {
          "maxDistance": 3.379187,
          "matchingCount": 12000,
          "cumulativePercent": 12
        },
        {
          "maxDistance": 3.560095,
          "matchingCount": 12999,
          "cumulativePercent": 12.999
        },
        {
          "maxDistance": 3.730602,
          "matchingCount": 13999,
          "cumulativePercent": 13.999
        },
        {
          "maxDistance": 3.892279,
          "matchingCount": 15000,
          "cumulativePercent": 15
        },
        {
          "maxDistance": 4.071033,
          "matchingCount": 16000,
          "cumulativePercent": 16
        },
        {
          "maxDistance": 4.213961,
          "matchingCount": 16999,
          "cumulativePercent": 16.999
        },
        {
          "maxDistance": 4.382274,
          "matchingCount": 17999,
          "cumulativePercent": 17.999
        },
        {
          "maxDistance": 4.541211,
          "matchingCount": 19000,
          "cumulativePercent": 19
        },
        {
          "maxDistance": 4.692092,
          "matchingCount": 19999,
          "cumulativePercent": 19.999
        },
        {
          "maxDistance": 4.842295,
          "matchingCount": 21000,
          "cumulativePercent": 21
        },
        {
          "maxDistance": 4.990529,
          "matchingCount": 22000,
          "cumulativePercent": 22
        },
        {
          "maxDistance": 5.131488,
          "matchingCount": 22999,
          "cumulativePercent": 22.999
        },
        {
          "maxDistance": 5.288089,
          "matchingCount": 24000,
          "cumulativePercent": 24
        },
        {
          "maxDistance": 5.441499,
          "matchingCount": 24999,
          "cumulativePercent": 24.999
        },
        {
          "maxDistance": 5.589475,
          "matchingCount": 26000,
          "cumulativePercent": 26
        },
        {
          "maxDistance": 5.738195,
          "matchingCount": 26999,
          "cumulativePercent": 26.999
        },
        {
          "maxDistance": 5.889448,
          "matchingCount": 27999,
          "cumulativePercent": 27.999
        },
        {
          "maxDistance": 6.071328,
          "matchingCount": 29000,
          "cumulativePercent": 29
        },
        {
          "maxDistance": 6.227164,
          "matchingCount": 30000,
          "cumulativePercent": 30
        },
        {
          "maxDistance": 6.39471,
          "matchingCount": 31000,
          "cumulativePercent": 31
        },
        {
          "maxDistance": 6.564892,
          "matchingCount": 31999,
          "cumulativePercent": 31.999
        },
        {
          "maxDistance": 6.748504,
          "matchingCount": 32999,
          "cumulativePercent": 32.999
        },
        {
          "maxDistance": 6.925259,
          "matchingCount": 34000,
          "cumulativePercent": 34
        },
        {
          "maxDistance": 7.089241,
          "matchingCount": 34999,
          "cumulativePercent": 34.999
        },
        {
          "maxDistance": 7.263475,
          "matchingCount": 36000,
          "cumulativePercent": 36
        },
        {
          "maxDistance": 7.438399,
          "matchingCount": 37000,
          "cumulativePercent": 37
        },
        {
          "maxDistance": 7.628628,
          "matchingCount": 37999,
          "cumulativePercent": 37.999
        },
        {
          "maxDistance": 7.809369,
          "matchingCount": 38999,
          "cumulativePercent": 38.999
        },
        {
          "maxDistance": 8.002081,
          "matchingCount": 40000,
          "cumulativePercent": 40
        },
        {
          "maxDistance": 8.184878,
          "matchingCount": 40999,
          "cumulativePercent": 40.999
        },
        {
          "maxDistance": 8.382012,
          "matchingCount": 41999,
          "cumulativePercent": 41.999
        },
        {
          "maxDistance": 8.574945,
          "matchingCount": 42999,
          "cumulativePercent": 42.999
        },
        {
          "maxDistance": 8.763152,
          "matchingCount": 44000,
          "cumulativePercent": 44
        },
        {
          "maxDistance": 8.974449,
          "matchingCount": 44999,
          "cumulativePercent": 44.999
        },
        {
          "maxDistance": 9.177033,
          "matchingCount": 45999,
          "cumulativePercent": 45.999
        },
        {
          "maxDistance": 9.389949,
          "matchingCount": 47000,
          "cumulativePercent": 47
        },
        {
          "maxDistance": 9.615065,
          "matchingCount": 47999,
          "cumulativePercent": 47.999
        },
        {
          "maxDistance": 9.836805,
          "matchingCount": 48999,
          "cumulativePercent": 48.999
        },
        {
          "maxDistance": 10.065588,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 10.540448,
          "matchingCount": 52000,
          "cumulativePercent": 52
        },
        {
          "maxDistance": 11.040737,
          "matchingCount": 53999,
          "cumulativePercent": 53.999
        },
        {
          "maxDistance": 11.520767,
          "matchingCount": 56000,
          "cumulativePercent": 56
        },
        {
          "maxDistance": 12.027414,
          "matchingCount": 57999,
          "cumulativePercent": 57.999
        },
        {
          "maxDistance": 12.654277,
          "matchingCount": 60000,
          "cumulativePercent": 60
        },
        {
          "maxDistance": 13.319842,
          "matchingCount": 62000,
          "cumulativePercent": 62
        },
        {
          "maxDistance": 14.043406,
          "matchingCount": 64000,
          "cumulativePercent": 64
        },
        {
          "maxDistance": 14.789142,
          "matchingCount": 66000,
          "cumulativePercent": 66
        },
        {
          "maxDistance": 15.613838,
          "matchingCount": 68000,
          "cumulativePercent": 68
        },
        {
          "maxDistance": 16.651873,
          "matchingCount": 69999,
          "cumulativePercent": 69.999
        },
        {
          "maxDistance": 17.734196,
          "matchingCount": 71999,
          "cumulativePercent": 71.999
        },
        {
          "maxDistance": 18.96084,
          "matchingCount": 74000,
          "cumulativePercent": 74
        },
        {
          "maxDistance": 20.178545,
          "matchingCount": 75999,
          "cumulativePercent": 75.999
        },
        {
          "maxDistance": 21.248095,
          "matchingCount": 77999,
          "cumulativePercent": 77.999
        },
        {
          "maxDistance": 22.261537,
          "matchingCount": 79999,
          "cumulativePercent": 79.999
        },
        {
          "maxDistance": 23.298517,
          "matchingCount": 81999,
          "cumulativePercent": 81.999
        },
        {
          "maxDistance": 24.43193,
          "matchingCount": 84000,
          "cumulativePercent": 84
        },
        {
          "maxDistance": 25.695748,
          "matchingCount": 86000,
          "cumulativePercent": 86
        },
        {
          "maxDistance": 27.25838,
          "matchingCount": 87999,
          "cumulativePercent": 87.999
        },
        {
          "maxDistance": 29.269731,
          "matchingCount": 90000,
          "cumulativePercent": 90
        },
        {
          "maxDistance": 32.436234,
          "matchingCount": 92000,
          "cumulativePercent": 92
        },
        {
          "maxDistance": 36.656896,
          "matchingCount": 93999,
          "cumulativePercent": 93.999
        },
        {
          "maxDistance": 41.73119,
          "matchingCount": 95999,
          "cumulativePercent": 95.999
        },
        {
          "maxDistance": 48.506056,
          "matchingCount": 97999,
          "cumulativePercent": 97.999
        },
        {
          "maxDistance": 78.99921,
          "matchingCount": 100000,
          "cumulativePercent": 100
        }
      ]
    },
    "feat_stationary_motion_pivot": {
      "featureId": "feat_stationary_motion_pivot",
      "featureName": "Stationary Planetary Pivot Proximity",
      "category": "planetary",
      "unit": "degrees_per_day",
      "idealTarget": 0,
      "validSampleSize": 100000,
      "min": 0,
      "max": 0.035593,
      "mean": 0.010982,
      "median": 0.009155,
      "p01": 0.000145,
      "p05": 0.000772,
      "p10": 0.001606,
      "p25": 0.00425,
      "p75": 0.015414,
      "p90": 0.024215,
      "quantiles": [
        {
          "maxDistance": 0.000001,
          "matchingCount": 10,
          "cumulativePercent": 0.01
        },
        {
          "maxDistance": 0.000007,
          "matchingCount": 48,
          "cumulativePercent": 0.048
        },
        {
          "maxDistance": 0.000014,
          "matchingCount": 102,
          "cumulativePercent": 0.102
        },
        {
          "maxDistance": 0.000029,
          "matchingCount": 199,
          "cumulativePercent": 0.199
        },
        {
          "maxDistance": 0.000043,
          "matchingCount": 300,
          "cumulativePercent": 0.3
        },
        {
          "maxDistance": 0.000054,
          "matchingCount": 398,
          "cumulativePercent": 0.398
        },
        {
          "maxDistance": 0.000068,
          "matchingCount": 497,
          "cumulativePercent": 0.497
        },
        {
          "maxDistance": 0.000085,
          "matchingCount": 600,
          "cumulativePercent": 0.6
        },
        {
          "maxDistance": 0.0001,
          "matchingCount": 701,
          "cumulativePercent": 0.701
        },
        {
          "maxDistance": 0.000117,
          "matchingCount": 802,
          "cumulativePercent": 0.802
        },
        {
          "maxDistance": 0.000131,
          "matchingCount": 905,
          "cumulativePercent": 0.905
        },
        {
          "maxDistance": 0.000145,
          "matchingCount": 999,
          "cumulativePercent": 0.999
        },
        {
          "maxDistance": 0.000182,
          "matchingCount": 1248,
          "cumulativePercent": 1.248
        },
        {
          "maxDistance": 0.000216,
          "matchingCount": 1497,
          "cumulativePercent": 1.497
        },
        {
          "maxDistance": 0.000252,
          "matchingCount": 1750,
          "cumulativePercent": 1.75
        },
        {
          "maxDistance": 0.000289,
          "matchingCount": 1997,
          "cumulativePercent": 1.997
        },
        {
          "maxDistance": 0.000364,
          "matchingCount": 2496,
          "cumulativePercent": 2.496
        },
        {
          "maxDistance": 0.000447,
          "matchingCount": 3000,
          "cumulativePercent": 3
        },
        {
          "maxDistance": 0.000529,
          "matchingCount": 3495,
          "cumulativePercent": 3.495
        },
        {
          "maxDistance": 0.00061,
          "matchingCount": 3999,
          "cumulativePercent": 3.999
        },
        {
          "maxDistance": 0.000695,
          "matchingCount": 4495,
          "cumulativePercent": 4.495
        },
        {
          "maxDistance": 0.000772,
          "matchingCount": 4998,
          "cumulativePercent": 4.998
        },
        {
          "maxDistance": 0.000937,
          "matchingCount": 5998,
          "cumulativePercent": 5.998
        },
        {
          "maxDistance": 0.0011,
          "matchingCount": 6998,
          "cumulativePercent": 6.998
        },
        {
          "maxDistance": 0.001263,
          "matchingCount": 8003,
          "cumulativePercent": 8.003
        },
        {
          "maxDistance": 0.001441,
          "matchingCount": 9001,
          "cumulativePercent": 9.001
        },
        {
          "maxDistance": 0.001606,
          "matchingCount": 9997,
          "cumulativePercent": 9.997
        },
        {
          "maxDistance": 0.00177,
          "matchingCount": 10999,
          "cumulativePercent": 10.999
        },
        {
          "maxDistance": 0.001948,
          "matchingCount": 12000,
          "cumulativePercent": 12
        },
        {
          "maxDistance": 0.002122,
          "matchingCount": 13002,
          "cumulativePercent": 13.002
        },
        {
          "maxDistance": 0.002297,
          "matchingCount": 14002,
          "cumulativePercent": 14.002
        },
        {
          "maxDistance": 0.002477,
          "matchingCount": 14999,
          "cumulativePercent": 14.999
        },
        {
          "maxDistance": 0.00265,
          "matchingCount": 15998,
          "cumulativePercent": 15.998
        },
        {
          "maxDistance": 0.002826,
          "matchingCount": 16999,
          "cumulativePercent": 16.999
        },
        {
          "maxDistance": 0.002998,
          "matchingCount": 17998,
          "cumulativePercent": 17.998
        },
        {
          "maxDistance": 0.003178,
          "matchingCount": 19000,
          "cumulativePercent": 19
        },
        {
          "maxDistance": 0.003347,
          "matchingCount": 20000,
          "cumulativePercent": 20
        },
        {
          "maxDistance": 0.003519,
          "matchingCount": 21004,
          "cumulativePercent": 21.004
        },
        {
          "maxDistance": 0.00369,
          "matchingCount": 21997,
          "cumulativePercent": 21.997
        },
        {
          "maxDistance": 0.003872,
          "matchingCount": 23000,
          "cumulativePercent": 23
        },
        {
          "maxDistance": 0.004069,
          "matchingCount": 24001,
          "cumulativePercent": 24.001
        },
        {
          "maxDistance": 0.00425,
          "matchingCount": 25000,
          "cumulativePercent": 25
        },
        {
          "maxDistance": 0.004434,
          "matchingCount": 26001,
          "cumulativePercent": 26.001
        },
        {
          "maxDistance": 0.004627,
          "matchingCount": 26996,
          "cumulativePercent": 26.996
        },
        {
          "maxDistance": 0.0048,
          "matchingCount": 27999,
          "cumulativePercent": 27.999
        },
        {
          "maxDistance": 0.004974,
          "matchingCount": 29000,
          "cumulativePercent": 29
        },
        {
          "maxDistance": 0.005155,
          "matchingCount": 29998,
          "cumulativePercent": 29.998
        },
        {
          "maxDistance": 0.005335,
          "matchingCount": 31002,
          "cumulativePercent": 31.002
        },
        {
          "maxDistance": 0.005516,
          "matchingCount": 31998,
          "cumulativePercent": 31.998
        },
        {
          "maxDistance": 0.005717,
          "matchingCount": 32997,
          "cumulativePercent": 32.997
        },
        {
          "maxDistance": 0.005906,
          "matchingCount": 33999,
          "cumulativePercent": 33.999
        },
        {
          "maxDistance": 0.006103,
          "matchingCount": 35001,
          "cumulativePercent": 35.001
        },
        {
          "maxDistance": 0.006303,
          "matchingCount": 35999,
          "cumulativePercent": 35.999
        },
        {
          "maxDistance": 0.0065,
          "matchingCount": 37002,
          "cumulativePercent": 37.002
        },
        {
          "maxDistance": 0.006696,
          "matchingCount": 38002,
          "cumulativePercent": 38.002
        },
        {
          "maxDistance": 0.006896,
          "matchingCount": 39000,
          "cumulativePercent": 39
        },
        {
          "maxDistance": 0.007091,
          "matchingCount": 39996,
          "cumulativePercent": 39.996
        },
        {
          "maxDistance": 0.007287,
          "matchingCount": 41000,
          "cumulativePercent": 41
        },
        {
          "maxDistance": 0.007491,
          "matchingCount": 41998,
          "cumulativePercent": 41.998
        },
        {
          "maxDistance": 0.007689,
          "matchingCount": 43000,
          "cumulativePercent": 43
        },
        {
          "maxDistance": 0.007893,
          "matchingCount": 43999,
          "cumulativePercent": 43.999
        },
        {
          "maxDistance": 0.008098,
          "matchingCount": 45003,
          "cumulativePercent": 45.003
        },
        {
          "maxDistance": 0.008317,
          "matchingCount": 45999,
          "cumulativePercent": 45.999
        },
        {
          "maxDistance": 0.008526,
          "matchingCount": 47002,
          "cumulativePercent": 47.002
        },
        {
          "maxDistance": 0.008731,
          "matchingCount": 48001,
          "cumulativePercent": 48.001
        },
        {
          "maxDistance": 0.008942,
          "matchingCount": 48996,
          "cumulativePercent": 48.996
        },
        {
          "maxDistance": 0.009155,
          "matchingCount": 50000,
          "cumulativePercent": 50
        },
        {
          "maxDistance": 0.009605,
          "matchingCount": 52000,
          "cumulativePercent": 52
        },
        {
          "maxDistance": 0.010035,
          "matchingCount": 54001,
          "cumulativePercent": 54.001
        },
        {
          "maxDistance": 0.010462,
          "matchingCount": 56001,
          "cumulativePercent": 56.001
        },
        {
          "maxDistance": 0.010902,
          "matchingCount": 57997,
          "cumulativePercent": 57.997
        },
        {
          "maxDistance": 0.011357,
          "matchingCount": 59999,
          "cumulativePercent": 59.999
        },
        {
          "maxDistance": 0.011834,
          "matchingCount": 61997,
          "cumulativePercent": 61.997
        },
        {
          "maxDistance": 0.012314,
          "matchingCount": 64002,
          "cumulativePercent": 64.002
        },
        {
          "maxDistance": 0.012798,
          "matchingCount": 65998,
          "cumulativePercent": 65.998
        },
        {
          "maxDistance": 0.013296,
          "matchingCount": 67999,
          "cumulativePercent": 67.999
        },
        {
          "maxDistance": 0.013822,
          "matchingCount": 69998,
          "cumulativePercent": 69.998
        },
        {
          "maxDistance": 0.014389,
          "matchingCount": 71999,
          "cumulativePercent": 71.999
        },
        {
          "maxDistance": 0.015019,
          "matchingCount": 73999,
          "cumulativePercent": 73.999
        },
        {
          "maxDistance": 0.015814,
          "matchingCount": 76001,
          "cumulativePercent": 76.001
        },
        {
          "maxDistance": 0.01677,
          "matchingCount": 78000,
          "cumulativePercent": 78
        },
        {
          "maxDistance": 0.017821,
          "matchingCount": 79998,
          "cumulativePercent": 79.998
        },
        {
          "maxDistance": 0.018916,
          "matchingCount": 82002,
          "cumulativePercent": 82.002
        },
        {
          "maxDistance": 0.020038,
          "matchingCount": 84000,
          "cumulativePercent": 84
        },
        {
          "maxDistance": 0.021166,
          "matchingCount": 85999,
          "cumulativePercent": 85.999
        },
        {
          "maxDistance": 0.022445,
          "matchingCount": 88000,
          "cumulativePercent": 88
        },
        {
          "maxDistance": 0.024215,
          "matchingCount": 90000,
          "cumulativePercent": 90
        },
        {
          "maxDistance": 0.026026,
          "matchingCount": 92000,
          "cumulativePercent": 92
        },
        {
          "maxDistance": 0.02782,
          "matchingCount": 93998,
          "cumulativePercent": 93.998
        },
        {
          "maxDistance": 0.029597,
          "matchingCount": 96000,
          "cumulativePercent": 96
        },
        {
          "maxDistance": 0.032054,
          "matchingCount": 97997,
          "cumulativePercent": 97.997
        },
        {
          "maxDistance": 0.035593,
          "matchingCount": 99999,
          "cumulativePercent": 99.999
        }
      ]
    }
  }
};
