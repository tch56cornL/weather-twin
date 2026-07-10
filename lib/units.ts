export type UnitSystem = "metric" | "imperial";

export function formatTemp(celsius: number, system: UnitSystem): string {
  const value = system === "imperial" ? (celsius * 9) / 5 + 32 : celsius;
  return `${Math.round(value)}°${system === "imperial" ? "F" : "C"}`;
}

export function formatWindSpeed(metersPerSecond: number, system: UnitSystem): string {
  if (system === "imperial") {
    return `${(metersPerSecond * 2.23694).toFixed(1)} mph`;
  }
  return `${metersPerSecond.toFixed(1)} m/s`;
}

export function formatPressure(hpa: number, system: UnitSystem): string {
  if (system === "imperial") {
    return `${(hpa * 0.02953).toFixed(2)} inHg`;
  }
  return `${Math.round(hpa)} hPa`;
}

export function formatVisibility(meters: number, system: UnitSystem): string {
  if (system === "imperial") {
    return `${(meters / 1609.344).toFixed(1)} mi`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

const AQI_LABELS: Record<number, string> = {
  1: "Good",
  2: "Fair",
  3: "Moderate",
  4: "Poor",
  5: "Very Poor",
};

export function formatAirQuality(aqi: number): string {
  return `${AQI_LABELS[aqi] ?? "Unknown"} (${aqi}/5)`;
}
