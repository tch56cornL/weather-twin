import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewLocationForm } from "@/components/new-location-form";

export default async function NewLocationPage() {
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
      <div className="relative z-10 w-full max-w-lg">
        <NewLocationForm />
      </div>
    </div>
  );
}
