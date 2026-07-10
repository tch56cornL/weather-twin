"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CityMatch = {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
};

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

type Preview = {
  cityName: string;
  country: string | null;
  lat: number;
  lon: number;
  snapshot: Snapshot;
};

export function NewLocationForm() {
  const router = useRouter();

  const [cityQuery, setCityQuery] = useState("");
  const [matches, setMatches] = useState<CityMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [source, setSource] = useState<"gps" | "manual" | null>(null);

  async function loadWeather(
    lat: number,
    lon: number,
    knownName?: string,
    knownCountry?: string,
  ) {
    setFetchingWeather(true);
    setError(null);
    try {
      const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
      if (knownName) params.set("name", knownName);
      if (knownCountry) params.set("country", knownCountry);

      const res = await fetch(`/api/weather?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Couldn't fetch weather for that location.");
      }

      setPreview({
        cityName: data.cityName,
        country: data.country,
        lat,
        lon,
        snapshot: data.snapshot,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPreview(null);
    } finally {
      setFetchingWeather(false);
    }
  }

  function useGps() {
    setError(null);
    setSource("gps");
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location detection. Try typing a city instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError(
          "Couldn't get your location — you may have denied permission. Try typing a city name instead.",
        );
      },
    );
  }

  async function searchCity(e: React.FormEvent) {
    e.preventDefault();
    if (cityQuery.trim().length < 2) return;
    setSearching(true);
    setError(null);
    setMatches([]);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(cityQuery.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "City search failed.");
      if (!data.matches.length) {
        setError("No cities found with that name. Try a different spelling.");
      }
      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSearching(false);
    }
  }

  function pickCity(match: CityMatch) {
    setSource("manual");
    setMatches([]);
    loadWeather(match.lat, match.lon, match.name, match.country);
  }

  async function saveLocation() {
    if (!preview) return;
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

    const s = preview.snapshot;
    const { error } = await supabase.from("saved_locations").insert({
      user_id: user.id,
      city_name: preview.cityName,
      country: preview.country,
      lat: preview.lat,
      lon: preview.lon,
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

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur">
      <div className="mb-6 text-center">
        <span className="text-4xl">📍</span>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-sky-900">
          Save a location
        </h1>
        <p className="mt-1 text-sm text-sky-700/80">
          We&apos;ll snapshot the current weather right now
        </p>
      </div>

      {!preview && (
        <div className="flex flex-col gap-6">
          <div>
            <button
              onClick={useGps}
              disabled={fetchingWeather}
              className="w-full rounded-full bg-sky-500 py-3 font-bold text-white shadow-md transition hover:bg-sky-600 disabled:opacity-60"
            >
              {fetchingWeather && source === "gps"
                ? "Locating…"
                : "📡 Use my current location"}
            </button>
            <p className="mt-1 text-center text-xs text-sky-700/70">
              Most accurate — uses your device&apos;s GPS
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-sky-700/60">
            <span className="h-px flex-1 bg-sky-200" />
            OR TYPE A CITY
            <span className="h-px flex-1 bg-sky-200" />
          </div>

          <form onSubmit={searchCity} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Antiparos, Greece"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                className="flex-1 rounded-xl border border-sky-200 px-4 py-2 text-sky-900 outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={searching}
                className="rounded-xl bg-sky-100 px-4 py-2 font-semibold text-sky-700 hover:bg-sky-200 disabled:opacity-60"
              >
                {searching ? "…" : "Search"}
              </button>
            </div>

            {matches.length > 0 && (
              <ul className="flex flex-col gap-1 rounded-xl border border-sky-100 p-2">
                {matches.map((m, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => pickCity(m)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-sky-900 hover:bg-sky-50"
                    >
                      {m.name}
                      {m.state ? `, ${m.state}` : ""}, {m.country}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {fetchingWeather && source === "manual" && (
            <p className="text-center text-sm text-sky-700">Fetching weather…</p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {preview && (
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-sky-900">
              {preview.cityName}
              {preview.country ? `, ${preview.country}` : ""}
            </p>
            <p className="text-4xl font-black text-sky-900">
              {Math.round(preview.snapshot.tempC)}°C
            </p>
            <p className="text-sm text-sky-700">
              Feels like {Math.round(preview.snapshot.feelsLikeC)}°C
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-sky-900">
            <Stat label="Humidity" value={`${preview.snapshot.humidity}%`} />
            <Stat label="Wind" value={`${preview.snapshot.windSpeedMs.toFixed(1)} m/s`} />
            <Stat label="UV index" value={preview.snapshot.uvIndex.toFixed(1)} />
            <Stat label="Pressure" value={`${preview.snapshot.pressureHpa} hPa`} />
            <Stat
              label="Visibility"
              value={`${(preview.snapshot.visibilityM / 1000).toFixed(1)} km`}
            />
            <Stat label="Air quality" value={`AQI ${preview.snapshot.airQualityIndex}`} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setPreview(null);
                setError(null);
              }}
              className="flex-1 rounded-full border border-sky-300 py-2 font-semibold text-sky-700 hover:bg-sky-50"
            >
              Start over
            </button>
            <button
              onClick={saveLocation}
              disabled={saving}
              className="flex-1 rounded-full bg-sky-500 py-2 font-bold text-white shadow-md hover:bg-sky-600 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save this location"}
            </button>
          </div>
        </div>
      )}
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
