"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth-card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthCard title="Check your inbox" subtitle="Reset link on its way">
        <p className="text-center text-sm text-sky-900">
          If an account exists for <strong>{email}</strong>, we sent a link to
          reset your password. Click it to choose a new one.
        </p>
        <Link
          href="/login"
          className="mt-6 block rounded-full bg-sky-500 py-2 text-center font-bold text-white shadow-md transition hover:bg-sky-600"
        >
          Back to login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="We'll email you a reset link"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-semibold text-sky-900">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-sky-800">
        <Link href="/login" className="font-semibold hover:underline">
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}
