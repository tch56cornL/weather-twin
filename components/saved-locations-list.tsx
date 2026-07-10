"use client";

import Link from "next/link";
import { useUnitSystem } from "@/components/unit-context";
import { formatTemp } from "@/lib/units";

type SavedLocationSummary = {
  id: string;
  city_name: string;
  country: string | null;
  temp_c: number;
  captured_at: string;
};

export function SavedLocationsList({
  locations,
}: {
  locations: SavedLocationSummary[];
}) {
  const { system } = useUnitSystem();

  if (locations.length === 0) {
    return (
      <p className="text-white/90">
        No saved locations yet — save one to get started.
      </p>
    );
  }

  return (
    <>
      {locations.map((loc) => (
        <Link
          key={loc.id}
          href={`/locations/${loc.id}`}
          className="flex items-center justify-between rounded-2xl bg-white/90 px-5 py-4 text-left shadow transition hover:bg-white"
        >
          <div>
            <p className="font-bold text-sky-900">
              {loc.city_name}
              {loc.country ? `, ${loc.country}` : ""}
            </p>
            <p className="text-xs text-sky-700/70">
              Saved {new Date(loc.captured_at).toLocaleString()}
            </p>
          </div>
          <p className="text-2xl font-black text-sky-900">
            {formatTemp(loc.temp_c, system)}
          </p>
        </Link>
      ))}
    </>
  );
}
