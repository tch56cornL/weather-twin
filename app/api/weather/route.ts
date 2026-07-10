import { NextResponse } from "next/server";
import { fetchWeatherSnapshot, reverseGeocode } from "@/lib/openweather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const knownName = searchParams.get("name");
  const knownCountry = searchParams.get("country");

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const [snapshot, place] = await Promise.all([
      fetchWeatherSnapshot(lat, lon),
      knownName ? Promise.resolve(null) : reverseGeocode(lat, lon),
    ]);

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
