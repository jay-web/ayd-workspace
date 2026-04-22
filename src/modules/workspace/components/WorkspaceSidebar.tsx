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
  const [collapsed, setCollapsed] = useState(false);

  const baseClasses =
    "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition";

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
      className={`h-full rounded-[28px] border border-gray-200 bg-white py-4 shadow-sm transition-all duration-300 ${
        collapsed ? "w-[84px] px-3" : "w-[250px] px-4 md:px-5"
      }`}
    >
      <div
        className={`mb-5 flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed ? (
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
            Workspace
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`${baseClasses} ${
                collapsed ? "justify-center" : "gap-3"
              } ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={18} className="shrink-0 gap-5" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}