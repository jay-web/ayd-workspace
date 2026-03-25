"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { refreshSession } from "@/lib/auth/clientRefresh";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");

  useEffect(() => {
    let active = true;

    async function tryRefresh() {
      const ok = await refreshSession();

      if (!active) return;

      if (ok) {
        router.replace(redirect || "/dashboard");
      }
    }

    tryRefresh();

    return () => {
      active = false;
    };
  }, [router, redirect]);

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-emerald-50 px-4">
      {/* background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-80px] top-[-80px] h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-80 w-80 rounded-full bg-gray-200/50 blur-3xl" />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/85 p-8 shadow-[0_20px_60px_rgba(16,24,40,0.08)] backdrop-blur">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-base font-bold text-white shadow-md">
            AYD
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            AYD Workspace
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">
            Sign in to access your intelligent workspace and continue working
            with your documents seamlessly.
          </p>
        </div>

        {/* Action */}
        <button
          onClick={handleLogin}
          className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black active:scale-[0.98]"
        >
          Continue with Cognito
        </button>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs leading-5 text-gray-500">
          Secure sign-in powered by your authentication provider.
        </p>
      </div>
    </main>
  );
}