import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchCityMatchMetrics, type WeatherMetrics } from "@/lib/openweather";
import { matchPercent } from "@/lib/matching";
import { CITIES } from "@/lib/cities";

const CACHE_TTL_MINUTES = 20;

function cityKey(name: string, country: string) {
  return `${name},${country}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "locationId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: location } = await supabase
    .from("saved_locations")
    .select("*")
    .eq("id", locationId)
    .single();

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const savedMetrics: WeatherMetrics = {
    tempC: location.temp_c,
    feelsLikeC: location.feels_like_c,
    windSpeedMs: location.wind_speed_ms,
    windGustMs: location.wind_gust_ms,
    uvIndex: location.uv_index,
    humidity: location.humidity,
    visibilityM: location.visibility_m,
    pressureHpa: location.pressure_hpa,
    airQualityIndex: location.air_quality_index,
  };

  const keys = CITIES.map((c) => cityKey(c.name, c.country));
  const { data: cached } = await supabase
    .from("city_weather_cache")
    .select("*")
    .in("city_key", keys);

  const cacheByKey = new Map((cached ?? []).map((row) => [row.city_key, row]));
  const staleCutoff = Date.now() - CACHE_TTL_MINUTES * 60 * 1000;

  const staleCities = CITIES.filter((c) => {
    const row = cacheByKey.get(cityKey(c.name, c.country));
    if (!row) return true;
    return new Date(row.fetched_at).getTime() < staleCutoff;
  });

  if (staleCities.length > 0) {
    const fresh = await Promise.all(
      staleCities.map(async (c) => {
        try {
          const metrics = await fetchCityMatchMetrics(c.lat, c.lon);
          return { city: c, metrics };
        } catch {
          return { city: c, metrics: null };
        }
      }),
    );

    const rowsToUpsert = fresh
      .filter((f) => f.metrics !== null)
      .map(({ city, metrics }) => ({
        city_key: cityKey(city.name, city.country),
        lat: city.lat,
        lon: city.lon,
        temp_c: metrics!.tempC,
        feels_like_c: metrics!.feelsLikeC,
        wind_speed_ms: metrics!.windSpeedMs,
        wind_gust_ms: metrics!.windGustMs,
        uv_index: metrics!.uvIndex,
        humidity: metrics!.humidity,
        visibility_m: metrics!.visibilityM,
        pressure_hpa: metrics!.pressureHpa,
        air_quality_index: metrics!.airQualityIndex,
        fetched_at: new Date().toISOString(),
      }));

    if (rowsToUpsert.length > 0) {
      await supabase.from("city_weather_cache").upsert(rowsToUpsert, {
        onConflict: "city_key",
      });
      for (const row of rowsToUpsert) {
        cacheByKey.set(row.city_key, row);
      }
    }
  }

  const results = CITIES.map((c) => {
    const row = cacheByKey.get(cityKey(c.name, c.country));
    if (!row) return null;

    const metrics: WeatherMetrics = {
      tempC: row.temp_c,
      feelsLikeC: row.feels_like_c,
      windSpeedMs: row.wind_speed_ms,
      windGustMs: row.wind_gust_ms,
      uvIndex: row.uv_index,
      humidity: row.humidity,
      visibilityM: row.visibility_m,
      pressureHpa: row.pressure_hpa,
      airQualityIndex: row.air_quality_index,
    };

    return {
      name: c.name,
      country: c.country,
      lat: c.lat,
      lon: c.lon,
      tempC: row.temp_c,
      percent: matchPercent(savedMetrics, metrics),
    };
  }).filter((r) => r !== null);

  results.sort((a, b) => b!.percent - a!.percent);

  const strongMatches = results.filter((r) => r!.percent >= 80).slice(0, 5);

  return NextResponse.json({ matches: strongMatches });
}
