"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth-card";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
      <AuthCard title="Check your inbox" subtitle="Almost there!">
        <p className="text-center text-sm text-sky-900">
          We sent a confirmation link to <strong>{email}</strong>. Click it to
          activate your account, then come back and log in.
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
    <AuthCard title="Create your account" subtitle="Start collecting weather twins">
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
        <label className="flex flex-col gap-1 text-sm font-semibold text-sky-900">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Signing up…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-sky-800">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
