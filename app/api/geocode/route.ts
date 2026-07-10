import { NextResponse } from "next/server";
import { searchCities } from "@/lib/openweather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Type at least 2 characters" }, { status: 400 });
  }

  try {
    const matches = await searchCities(query.trim());
    return NextResponse.json({ matches });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Geocoding failed" },
      { status: 502 },
    );
  }
}
