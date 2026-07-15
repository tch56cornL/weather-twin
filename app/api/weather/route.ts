import { NextResponse } from "next/server";
import { fetchWeatherSnapshot, reverseGeocode } from "@/lib/openweather";
import { createClient } from "@/lib/supabase/server";
import { getRemainingOneCallBudget, recordOneCallUsage } from "@/lib/api-budget";

// Each call here uses 2 of OpenWeatherMap's "One Call" requests
// (current conditions + daily average).
const ONE_CALL_COST = 2;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const knownName = searchParams.get("name");
  const knownCountry = searchParams.get("country");

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const remainingBudget = await getRemainingOneCallBudget(supabase);
  if (remainingBudget < ONE_CALL_COST) {
    return NextResponse.json(
      {
        error:
          "We've hit today's free weather-check limit. Please try again tomorrow.",
      },
      { status: 429 },
    );
  }

  try {
    const [snapshot, place] = await Promise.all([
      fetchWeatherSnapshot(lat, lon),
      knownName ? Promise.resolve(null) : reverseGeocode(lat, lon),
    ]);
    await recordOneCallUsage(supabase, ONE_CALL_COST);

    return NextResponse.json({
      snapshot,
      cityName: knownName ?? place?.name ?? "Unknown location",
      country: knownCountry ?? place?.country ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Weather lookup failed" },
      { status: 502 },
    );
  }
}
