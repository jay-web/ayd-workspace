"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { refreshSession } from "@/lib/auth/clientRefresh";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function tryRefresh() {
      const ok = await refreshSession();

      if (!active) return;

      if (ok) {
        router.replace("/app");
      }
    }

    tryRefresh();

    return () => {
      active = false;
    };
  }, [router]);

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Sign in to access your workspaces
        </p>



        <button
          onClick={handleLogin}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 text-gray-800"
        >
          Login with Cognito
        </button>
      </div>


    </main>


  );
}