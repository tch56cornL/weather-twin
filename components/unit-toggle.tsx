"use client";

import { useUnitSystem } from "@/components/unit-context";

export function UnitToggle() {
  const { system, toggle } = useUnitSystem();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-sky-700 shadow hover:bg-white"
      aria-label="Toggle temperature units"
    >
      <span className={system === "metric" ? "text-sky-900" : "text-sky-400"}>
        °C
      </span>
      <span className="text-sky-300">/</span>
      <span className={system === "imperial" ? "text-sky-900" : "text-sky-400"}>
        °F
      </span>
    </button>
  );
}
