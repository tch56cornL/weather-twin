"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUnitSystem } from "@/components/unit-context";
import { formatTemp, formatWindSpeed } from "@/lib/units";

type Snapshot = {
  tempC: number;
  feelsLikeC: number;
  windSpeedMs: number;
  windGustMs: number | null;
  uvIndex: number;
  humidity: number;
  visibilityM: number;
  pressureHpa: number;
  airQualityIndex: number;
  dailyAvgTempC: number;
};

type CurrentWeather = {
  cityName: string;
  country: string | null;
  lat: number;
  lon: number;
  snapshot: Snapshot;
};

export function CurrentWeatherWidget() {
  const router = useRouter();
  const { system } = useUnitSystem();

  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function load() {
    setStatus("loading");
    setError(null);

    if (!navigator.geolocation) {
      setError("Your browser doesn't support location detection.");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Couldn't fetch weather.");

          setWeather({
            cityName: data.cityName,
            country: data.country,
            lat: latitude,
            lon: longitude,
            snapshot: data.snapshot,
          });
          setSaved(false);
          setStatus("loaded");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
          setStatus("error");
        }
      },
      () => {
        setError("Couldn't get your location — you may have denied permission.");
        setStatus("error");
      },
    );
  }

  async function saveLocation() {
    if (!weather) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in to save a location.");
      setSaving(false);
      return;
    }

    const s = weather.snapshot;
    const { error } = await supabase.from("saved_locations").insert({
      user_id: user.id,
      city_name: weather.cityName,
      country: weather.country,
      lat: weather.lat,
      lon: weather.lon,
      temp_c: s.tempC,
      feels_like_c: s.feelsLikeC,
      wind_speed_ms: s.windSpeedMs,
      wind_gust_ms: s.windGustMs,
      uv_index: s.uvIndex,
      humidity: s.humidity,
      visibility_m: s.visibilityM,
      pressure_hpa: s.pressureHpa,
      air_quality_index: s.airQualityIndex,
      daily_avg_temp_c: s.dailyAvgTempC,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <div className="mb-8 w-full max-w-2xl rounded-2xl bg-white/90 px-6 py-5 text-left shadow-lg">
      {status === "idle" && (
        <button
          onClick={load}
          className="w-full rounded-full bg-sky-500 py-3 font-bold text-white shadow-md transition hover:bg-sky-600"
        >
          📍 Show my current weather
        </button>
      )}

      {status === "loading" && (
        <p className="text-center text-sm font-semibold text-sky-700">
          Locating you…
        </p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
          <button
            onClick={load}
            className="rounded-full border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
          >
            Try again
          </button>
        </div>
      )}

      {status === "loaded" && weather && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700/70">
              Your current location
            </p>
            <p className="text-lg font-bold text-sky-900">
              {weather.cityName}
              {weather.country ? `, ${weather.country}` : ""}
            </p>
            <p className="text-3xl font-black text-sky-900">
              {formatTemp(weather.snapshot.tempC, system)}
            </p>
            <p className="text-sm text-sky-700">
              Feels like {formatTemp(weather.snapshot.feelsLikeC, system)} ·{" "}
              {weather.snapshot.humidity}% humidity ·{" "}
              {formatWindSpeed(weather.snapshot.windSpeedMs, system)} wind
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={load}
              className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-200"
              aria-label="Refresh current weather"
            >
              🔄 Refresh
            </button>
            <button
              onClick={saveLocation}
              disabled={saving || saved}
              className="rounded-full bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-600 disabled:opacity-60"
            >
              {saved ? "Saved ✓" : saving ? "Saving…" : "+ Save this"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
