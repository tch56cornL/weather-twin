"use client";

import { useState } from "react";
import Link from "next/link";
import { useUnitSystem } from "@/components/unit-context";
import { formatTemp } from "@/lib/units";
import { createClient } from "@/lib/supabase/client";

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
  const [items, setItems] = useState(locations);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, cityName: string) {
    const confirmed = window.confirm(`Delete your saved snapshot for ${cityName}?`);
    if (!confirmed) return;

    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("saved_locations").delete().eq("id", id);
    setDeletingId(null);

    if (error) {
      window.alert(`Couldn't delete: ${error.message}`);
      return;
    }

    setItems((prev) => prev.filter((loc) => loc.id !== id));
  }

  if (items.length === 0) {
    return (
      <p className="text-white/90">
        No saved locations yet — save one to get started.
      </p>
    );
  }

  return (
    <>
      {items.map((loc) => (
        <div
          key={loc.id}
          className="flex items-center gap-2 rounded-2xl bg-white/90 px-5 py-4 shadow transition hover:bg-white"
        >
          <Link
            href={`/locations/${loc.id}`}
            className="flex flex-1 items-center justify-between text-left"
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
          <button
            onClick={() => handleDelete(loc.id, loc.city_name)}
            disabled={deletingId === loc.id}
            aria-label={`Delete ${loc.city_name}`}
            className="rounded-full p-2 text-lg text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {deletingId === loc.id ? "…" : "🗑️"}
          </button>
        </div>
      ))}
    </>
  );
}
