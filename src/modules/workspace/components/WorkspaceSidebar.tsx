"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
} from "lucide-react";

export function WorkspaceSidebar({ workspaceId }: { workspaceId: string }) {
  const pathname = usePathname();

  const baseClasses =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition";

  function isActive(path: string) {
    return pathname === path;
  }

  return (
    <aside className="w-[220px] border-r bg-white px-4 py-6">
      <p className="mb-3 px-2 text-xs font-semibold text-gray-400 uppercase">
        Workspace
      </p>

      <nav className="flex flex-col gap-1">
        <Link
          href={`/workspaces/${workspaceId}`}
          className={`${baseClasses} ${
            isActive(`/workspaces/${workspaceId}`)
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <Link
          href={`/workspaces/${workspaceId}/documents`}
          className={`${baseClasses} ${
            isActive(`/workspaces/${workspaceId}/documents`)
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <FileText size={16} />
          Documents
        </Link>

        <Link
          href={`/workspaces/${workspaceId}/chat`}
          className={`${baseClasses} ${
            isActive(`/workspaces/${workspaceId}/chat`)
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <MessageSquare size={16} />
          Chat
        </Link>
      </nav>
    </aside>
  );
}