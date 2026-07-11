"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useUnitSystem } from "@/components/unit-context";
import { formatTemp } from "@/lib/units";

const WeatherTwinsMap = dynamic(
  () => import("@/components/weather-twins-map").then((m) => m.WeatherTwinsMap),
  { ssr: false, loading: () => <div className="h-80 w-full animate-pulse rounded-2xl bg-sky-100" /> },
);

type Match = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  tempC: number;
  percent: number;
};

function matchLabel(percent: number): { text: string; classes: string } {
  if (percent >= 90) return { text: "Perfect twin", classes: "bg-emerald-100 text-emerald-700" };
  if (percent >= 75) return { text: "Great match", classes: "bg-sky-100 text-sky-700" };
  if (percent >= 50) return { text: "Decent match", classes: "bg-amber-100 text-amber-700" };
  return { text: "Different vibe", classes: "bg-gray-100 text-gray-600" };
}

export function WeatherMatches({
  locationId,
  originName,
  originLat,
  originLon,
}: {
  locationId: string;
  originName: string;
  originLat: number;
  originLon: number;
}) {
  const { system } = useUnitSystem();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function findMatches() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches?locationId=${locationId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't find matches.");
      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur">
      <div className="mb-4 text-center">
        <span className="text-4xl">🌍</span>
        <h2 className="mt-2 text-xl font-black text-sky-900">Weather twins</h2>
        <p className="mt-1 text-sm text-sky-700/80">
          Find places with weather like this, right now
        </p>
      </div>

      {!matches && (
        <button
          onClick={findMatches}
          disabled={loading}
          className="w-full rounded-full bg-sky-500 py-3 font-bold text-white shadow-md transition hover:bg-sky-600 disabled:opacity-60"
        >
          {loading ? "Comparing 150 cities…" : "🔎 Find weather twins"}
        </button>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {matches && matches.length === 0 && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-sky-800">
            No cities are a strong match (80%+) right now — weather shifts
            over time, so try again later.
          </p>
          <button
            onClick={findMatches}
            disabled={loading}
            className="rounded-full border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
          >
            {loading ? "Refreshing…" : "↻ Check again"}
          </button>
        </div>
      )}

      {matches && matches.length > 0 && (
        <div className="flex flex-col gap-4">
          <WeatherTwinsMap
            originName={originName}
            originLat={originLat}
            originLon={originLon}
            twins={matches}
          />

          {matches.map((m, i) => {
            const label = matchLabel(m.percent);
            return (
              <div
                key={`${m.name}-${m.country}`}
                className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-bold text-sky-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-sky-900">
                      {m.name}, {m.country}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${label.classes}`}
                    >
                      {label.text}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-sky-900">{m.percent}%</p>
                  <p className="text-xs text-sky-700/70">
                    {formatTemp(m.tempC, system)}
                  </p>
                </div>
              </div>
            );
          })}

          <button
            onClick={findMatches}
            disabled={loading}
            className="mt-2 rounded-full border border-sky-300 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
          >
            {loading ? "Refreshing…" : "↻ Refresh matches"}
          </button>
        </div>
      )}
    </div>
  );
}
