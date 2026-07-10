"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth-card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Almost done">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-semibold text-sky-900">
          New password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-sky-200 px-4 py-2 font-normal text-sky-900 outline-none focus:border-sky-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-sky-900">
          Confirm new password
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-xl border border-sky-200 px-4 py-2 font-normal text-sky-900 outline-none focus:border-sky-400"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-sky-500 py-2 font-bold text-white shadow-md transition hover:bg-sky-600 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthCard>
  );
}
