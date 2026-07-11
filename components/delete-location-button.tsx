"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteLocationButton({
  locationId,
  cityName,
}: {
  locationId: string;
  cityName: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete your saved snapshot for ${cityName}?`);
    if (!confirmed) return;

    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("saved_locations")
      .delete()
      .eq("id", locationId);
    setDeleting(false);

    if (error) {
      window.alert(`Couldn't delete: ${error.message}`);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
    >
      {deleting ? "Deleting…" : "🗑️ Delete this location"}
    </button>
  );
}
