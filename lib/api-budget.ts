import type { SupabaseClient } from "@supabase/supabase-js";

// OpenWeatherMap's "One Call by Call" plan gives 1,000 free requests/day.
// We stay under a buffer below that so a burst of activity never risks
// tipping into paid usage.
const DAILY_ONE_CALL_BUDGET = 900;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getRemainingOneCallBudget(
  supabase: SupabaseClient,
): Promise<number> {
  const { data } = await supabase
    .from("api_usage")
    .select("one_call_count")
    .eq("day", todayKey())
    .maybeSingle();

  return Math.max(0, DAILY_ONE_CALL_BUDGET - (data?.one_call_count ?? 0));
}

export async function recordOneCallUsage(
  supabase: SupabaseClient,
  count: number,
): Promise<void> {
  if (count <= 0) return;

  const day = todayKey();
  const { data } = await supabase
    .from("api_usage")
    .select("one_call_count")
    .eq("day", day)
    .maybeSingle();

  const current = data?.one_call_count ?? 0;
  await supabase
    .from("api_usage")
    .upsert({ day, one_call_count: current + count }, { onConflict: "day" });
}
