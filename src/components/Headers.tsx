"use client";

import { useState, useRef, useEffect } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  const initials = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="flex h-[72px] items-center justify-between px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-sm font-bold text-white shadow-sm">
            AYD
          </div>

          <div className="flex flex-col leading-tight">
            <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-gray-900">
              AYD Workspace
            </h1>
            <p className="text-xs font-medium text-gray-500">
              Intelligent document workspace
            </p>
          </div>
        </div>

        {/* Right side */}
       {/* Right side */}
<div className="relative" ref={menuRef}>
  <button
    onClick={() => setOpen(!open)}
    className={`flex items-center transition-all duration-300 ${
      open
        ? "gap-3 rounded-full border border-gray-200 bg-white pl-3 pr-2 py-1.5 shadow-md"
        : "justify-center"
    }`}
  >
    {open && (
      <div className="hidden text-right sm:block">
        <p className="max-w-[160px] truncate text-sm font-medium text-gray-800">
          {user?.email || "User"}
        </p>
        {/* <p className="text-xs text-gray-500">Account</p> */}
      </div>
    )}

    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white ring-4 ring-gray-100">
      {initials}
    </div>
  </button>

  {open && (
    <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Signed in as
        </p>
        <p className="mt-1 truncate text-sm font-medium text-gray-800">
          {user?.email || "No email found"}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Logout
      </button>
    </div>
  )}
</div>
      </div>
    </header>
  );
}