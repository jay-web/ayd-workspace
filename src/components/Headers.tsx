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
      <div className="flex h-[60px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-xs font-semibold text-white shadow-sm">
            AYD
          </div>

          <div className="flex flex-col leading-tight">
            <h1 className="text-sm font-semibold tracking-[-0.02em] text-gray-900">
              AYD Workspace
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500 sm:text-[11px]">
              Intelligent document workspace
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
  <button
    onClick={() => setOpen(!open)}
    className={`flex items-center transition-all duration-300 ${
      open
        ? "gap-2.5 rounded-full border border-gray-200 bg-white py-1 pl-2.5 pr-1.5 shadow-sm"
        : "justify-center"
    }`}
  >
    {open && (
      <div className="hidden text-right sm:block">
        <p className="max-w-[160px] truncate text-xs font-medium text-gray-800">
          {user?.email || "User"}
        </p>
        {/* <p className="text-xs text-gray-500">Account</p> */}
      </div>
    )}

    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white ring-2 ring-gray-100">
      {initials}
    </div>
  </button>

  {open && (
    <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
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
        className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
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
