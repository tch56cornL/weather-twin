import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LocationDetail } from "@/components/location-detail";
import { WeatherMatches } from "@/components/weather-matches";
import { DeleteLocationButton } from "@/components/delete-location-button";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: location } = await supabase
    .from("saved_locations")
    .select("*")
    .eq("id", id)
    .single();

  if (!location) {
    notFound();
  }

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 px-6 py-16">
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-yellow-300 shadow-[0_0_100px_35px_rgba(253,224,71,0.7)]" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-white/90 hover:underline"
          >
            ← Back to dashboard
          </Link>
          <DeleteLocationButton
            locationId={location.id}
            cityName={location.city_name}
          />
        </div>
        <LocationDetail location={location} />
        <WeatherMatches
          locationId={location.id}
          originName={location.city_name}
          originLat={location.lat}
          originLon={location.lon}
        />
      </div>
    </div>
  );
}
