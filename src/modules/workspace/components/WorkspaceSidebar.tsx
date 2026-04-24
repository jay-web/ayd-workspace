"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export function WorkspaceSidebar({ workspaceId }: { workspaceId: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  function isActive(path: string) {
    return pathname === path;
  }

  const navItems = [
    {
      href: `/workspaces/${workspaceId}`,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: `/workspaces/${workspaceId}/documents`,
      label: "Documents",
      icon: FileText,
    },
    {
      href: `/workspaces/${workspaceId}/chat`,
      label: "Chat",
      icon: MessageSquare,
    },
  ];

  return (
    <aside
      className={`h-full min-h-0 shrink-0 border-r border-slate-200 bg-white/95 transition-[width] duration-200 ${
        collapsed ? "w-[72px]" : "w-[168px]"
      }`}
    >
      <div className="flex h-full min-h-0 flex-col px-1.5 py-2.5">
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between gap-2 px-1.5"}`}
        >
          {!collapsed ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Workspace
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        <nav className={`mt-3 flex w-full flex-col ${collapsed ? "gap-1.5" : "gap-1"}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group flex items-center rounded-xl text-sm font-medium transition ${
                  collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-2.5 py-2.5"
                } ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className={`flex ${collapsed ? "justify-center" : "px-1.5"} pt-2`}>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[12px] font-semibold text-slate-600"
            title="Workspace profile"
          >
            AY
          </div>
        </div>
      </div>
    </aside>
  );
}
