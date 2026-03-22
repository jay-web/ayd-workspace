"use client";

import Header from "@/components/Headers";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Documents", href: "/documents" },
    { label: "Chat", href: "/chat" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
       <Header />
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-gray-200 bg-white p-6">
          {/* <h2 className="text-xl font-bold text-gray-900">AYD Workspace</h2> */}

          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 ${
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}