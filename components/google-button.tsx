"use client";

import { createClient } from "@/lib/supabase/client";

export function GoogleButton() {
  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-sky-200 bg-white py-2 font-semibold text-sky-900 shadow-sm transition hover:bg-sky-50"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48a5.54 5.54 0 0 1-2.4 3.64v3h3.87c2.27-2.09 3.57-5.17 3.57-8.83Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3c-1.08.72-2.45 1.14-4.08 1.14-3.13 0-5.79-2.12-6.74-4.96h-4v3.09A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.26 14.28a7.2 7.2 0 0 1 0-4.56v-3.1h-4a12 12 0 0 0 0 10.76l4-3.1Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.62l4 3.1C6.21 6.87 8.87 4.75 12 4.75Z"
        />
      </svg>
      Continue with Google
    </button>
  );
}
