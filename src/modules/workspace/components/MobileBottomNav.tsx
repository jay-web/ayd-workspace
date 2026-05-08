"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, MessageSquare, PanelLeftOpen } from "lucide-react";

type MobileBottomNavProps = {
  workspaceId: string;
};

export function MobileBottomNav({ workspaceId }: MobileBottomNavProps) {
  const pathname = usePathname() || "";

  const items = [
    {
      href: `/workspaces`,
      label: "Dashboard",
      Icon: LayoutDashboard,
    },
    {
      href: `/workspaces/${workspaceId}`,
      label: "Workspace",
      Icon: PanelLeftOpen,
    },
    {
      href: `/workspaces/${workspaceId}/documents`,
      label: "Documents",
      Icon: FileText,
    },
    {
      href: `/workspaces/${workspaceId}/chat`,
      label: "Chat",
      Icon: MessageSquare,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden">
      <div className="mx-auto max-w-7xl px-2">
        <div className="rounded-t-2xl border-t border-slate-200 bg-white/95 shadow-lg">
          <div className="flex items-center justify-between">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.Icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? "text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} className="" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
