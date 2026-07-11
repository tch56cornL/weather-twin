import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { UnitToggle } from "@/components/unit-toggle";
import { SavedLocationsList } from "@/components/saved-locations-list";
import { CurrentWeatherWidget } from "@/components/current-weather-widget";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: locations } = await supabase
    .from("saved_locations")
    .select("id, city_name, country, temp_c, captured_at")
    .order("created_at", { ascending: false });

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 px-6 py-16">
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-yellow-300 shadow-[0_0_100px_35px_rgba(253,224,71,0.7)]" />

      <div className="relative z-10 flex w-full max-w-2xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-900/70">Logged in as</p>
          <p className="text-lg font-bold text-sky-900">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <UnitToggle />
          <LogoutButton />
        </div>
      </div>

      <div className="relative z-10 mt-12 flex w-full max-w-2xl flex-col items-center">
        <CurrentWeatherWidget />
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <span className="text-5xl">🧳🌎</span>
        <h1 className="text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
          Your saved locations
        </h1>

        <Link
          href="/locations/new"
          className="mt-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-sky-700 shadow-lg transition hover:bg-sky-50"
        >
          + Save a new location
        </Link>

        <div className="mt-8 flex w-full flex-col gap-3">
          <SavedLocationsList locations={locations ?? []} />
        </div>
      </div>
    </div>
  );
}
