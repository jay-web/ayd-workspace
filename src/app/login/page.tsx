"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { refreshSession } from "@/lib/auth/clientRefresh";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const redirect = searchParams?.get("redirect");

    async function tryRefresh() {
      const ok = await refreshSession();

      if (!active) return;

      if (ok) {
        router.replace(redirect || "/workspaces");
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
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-emerald-50 px-4 py-10 sm:px-6 sm:py-14">
  
  <div className="absolute inset-0 -z-10">
    <div className="absolute left-[-100px] top-[-100px] h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
    <div className="absolute bottom-[-120px] right-[-100px] h-96 w-96 rounded-full bg-gray-200/50 blur-3xl" />
  </div>

    <Card className="w-full max-w-lg px-8 py-10 sm:px-10 sm:py-12">
  <CardHeader className="mb-8">
    <div className="mb-5 flex justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-xl font-semibold text-white shadow-xl">
        AYD
      </div>
    </div>

    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 sm:text-sm">
      AYD Workspace
    </p>

    <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-4xl">
      Welcome back
    </h1>

    <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
      Sign in to access your intelligent workspace and continue
      working with your documents seamlessly.
    </p>
  </CardHeader>

  <CardContent className="space-y-5">
    <Button className="w-full px-6 py-3 text-base" onClick={handleLogin}>
      Continue with Cognito
    </Button>

    <p className="text-center text-xs leading-6 text-gray-500 sm:text-sm">
      Secure sign-in powered by your authentication provider.
    </p>
  </CardContent>
</Card>
    </main>
  );
}