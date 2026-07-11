export type WeatherMetrics = {
  tempC: number;
  feelsLikeC: number;
  windSpeedMs: number;
  windGustMs: number | null;
  uvIndex: number;
  humidity: number;
  visibilityM: number;
  pressureHpa: number;
  airQualityIndex: number;
};

// Each metric scores 100% within `tightBand` of difference, then decays
// linearly down to 0% at `zeroAt`. Temperature's tight band of 2 (degrees C)
// is what gives it a near-perfect score for close matches, per the spec.
type MetricConfig = {
  key: keyof WeatherMetrics;
  weight: number;
  tightBand: number;
  zeroAt: number;
  diff: (a: WeatherMetrics, b: WeatherMetrics) => number;
};

const METRICS: MetricConfig[] = [
  {
    key: "tempC",
    weight: 1 / 8,
    tightBand: 2,
    zeroAt: 20,
    diff: (a, b) => Math.abs(a.tempC - b.tempC),
  },
  {
    key: "feelsLikeC",
    weight: 1 / 8,
    tightBand: 2,
    zeroAt: 20,
    diff: (a, b) => Math.abs(a.feelsLikeC - b.feelsLikeC),
  },
  {
    key: "windSpeedMs",
    weight: 1 / 8,
    tightBand: 2,
    zeroAt: 15,
    diff: (a, b) => windDiff(a, b),
  },
  {
    key: "uvIndex",
    weight: 1 / 8,
    tightBand: 1,
    zeroAt: 8,
    diff: (a, b) => Math.abs(a.uvIndex - b.uvIndex),
  },
  {
    key: "humidity",
    weight: 1 / 8,
    tightBand: 8,
    zeroAt: 60,
    diff: (a, b) => Math.abs(a.humidity - b.humidity),
  },
  {
    key: "visibilityM",
    weight: 1 / 8,
    tightBand: 2000,
    zeroAt: 10000,
    diff: (a, b) => Math.abs(a.visibilityM - b.visibilityM),
  },
  {
    key: "pressureHpa",
    weight: 1 / 8,
    tightBand: 5,
    zeroAt: 40,
    diff: (a, b) => Math.abs(a.pressureHpa - b.pressureHpa),
  },
  {
    key: "airQualityIndex",
    weight: 1 / 8,
    tightBand: 0.5,
    zeroAt: 4,
    diff: (a, b) => Math.abs(a.airQualityIndex - b.airQualityIndex),
  },
];

function windDiff(a: WeatherMetrics, b: WeatherMetrics): number {
  const speedDiff = Math.abs(a.windSpeedMs - b.windSpeedMs);
  const gustA = a.windGustMs ?? a.windSpeedMs;
  const gustB = b.windGustMs ?? b.windSpeedMs;
  const gustDiff = Math.abs(gustA - gustB);
  return speedDiff * 0.7 + gustDiff * 0.3;
}

function scoreMetric(diff: number, tightBand: number, zeroAt: number): number {
  if (diff <= tightBand) {
    return 100 - (diff / tightBand) * 5;
  }
  const decayed = 95 * (1 - (diff - tightBand) / (zeroAt - tightBand));
  return Math.max(0, decayed);
}

export function matchPercent(a: WeatherMetrics, b: WeatherMetrics): number {
  let total = 0;
  for (const metric of METRICS) {
    const diff = metric.diff(a, b);
    total += scoreMetric(diff, metric.tightBand, metric.zeroAt) * metric.weight;
  }
  return Math.round(total);
}
