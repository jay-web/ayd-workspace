"use client";

import { useEffect, useState } from "react";

type MeResponse = {
  userId: string;
  email: string;
};

export function UserProfileBadge() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");

        if (!res.ok) {
          setData(null);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load profile", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="h-14 w-14 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  const initial =
    data?.email?.charAt(0).toUpperCase() ||
    data?.userId?.charAt(0).toUpperCase() ||
    "U";

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-xl font-semibold text-white">
      {initial}
    </div>
  );
}