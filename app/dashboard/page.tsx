import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 px-6 py-16">
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-yellow-300 shadow-[0_0_100px_35px_rgba(253,224,71,0.7)]" />

      <div className="relative z-10 flex w-full max-w-2xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-900/70">Logged in as</p>
          <p className="text-lg font-bold text-sky-900">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="relative z-10 mt-16 flex flex-col items-center gap-3 text-center">
        <span className="text-5xl">🧳🌎</span>
        <h1 className="text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
          Your saved locations
        </h1>
        <p className="max-w-sm text-white/90">
          You&apos;re logged in! Saving locations and matching weather comes
          next.
        </p>
      </div>
    </div>
  );
}
