"use client";

import { useUnitSystem } from "@/components/unit-context";
import { UnitToggle } from "@/components/unit-toggle";
import {
  formatTemp,
  formatWindSpeed,
  formatPressure,
  formatVisibility,
  formatAirQuality,
} from "@/lib/units";

type SavedLocation = {
  id: string;
  city_name: string;
  country: string | null;
  temp_c: number;
  feels_like_c: number;
  wind_speed_ms: number;
  wind_gust_ms: number | null;
  uv_index: number;
  humidity: number;
  visibility_m: number;
  pressure_hpa: number;
  air_quality_index: number;
  daily_avg_temp_c: number;
  captured_at: string;
};

export function LocationDetail({ location }: { location: SavedLocation }) {
  const { system } = useUnitSystem();

  return (
    <div className="rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-sky-900">
            {location.city_name}
            {location.country ? `, ${location.country}` : ""}
          </p>
          <p className="text-xs text-sky-700/70">
            Snapshot from {new Date(location.captured_at).toLocaleString()}
          </p>
        </div>
        <UnitToggle />
      </div>

      <div className="mb-6 text-center">
        <span className="text-5xl">
          {location.temp_c >= 20 ? "☀️" : location.temp_c >= 10 ? "⛅" : "❄️"}
        </span>
        <p className="text-5xl font-black text-sky-900">
          {formatTemp(location.temp_c, system)}
        </p>
        <p className="text-sm text-sky-700">
          Feels like {formatTemp(location.feels_like_c, system)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-sky-900">
        <Stat label="Humidity" value={`${location.humidity}%`} />
        <Stat
          label="Wind"
          value={formatWindSpeed(location.wind_speed_ms, system)}
        />
        <Stat
          label="Gusts"
          value={
            location.wind_gust_ms != null
              ? formatWindSpeed(location.wind_gust_ms, system)
              : "—"
          }
        />
        <Stat label="UV index" value={location.uv_index.toFixed(1)} />
        <Stat
          label="Pressure"
          value={formatPressure(location.pressure_hpa, system)}
        />
        <Stat
          label="Visibility"
          value={formatVisibility(location.visibility_m, system)}
        />
        <Stat
          label="Air quality"
          value={formatAirQuality(location.air_quality_index)}
        />
        <Stat
          label="Daily average"
          value={formatTemp(location.daily_avg_temp_c, system)}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-sky-50 px-3 py-2">
      <p className="text-xs font-semibold text-sky-700/70">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
