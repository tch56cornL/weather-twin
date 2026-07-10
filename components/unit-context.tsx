"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { UnitSystem } from "@/lib/units";

const STORAGE_KEY = "weather-twin-unit-system";

const UnitContext = createContext<{
  system: UnitSystem;
  toggle: () => void;
}>({ system: "metric", toggle: () => {} });

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [system, setSystem] = useState<UnitSystem>("metric");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "metric" || stored === "imperial") {
      setSystem(stored);
    }
  }, []);

  function toggle() {
    setSystem((prev) => {
      const next = prev === "metric" ? "imperial" : "metric";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return (
    <UnitContext.Provider value={{ system, toggle }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnitSystem() {
  return useContext(UnitContext);
}
