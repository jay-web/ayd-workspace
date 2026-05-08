"use client";
import Link from "next/link";
import { useState } from "react";
import { WorkspaceMembersDialog } from "../WorkspaceMembersDialog";

type WorkspaceDashboardHeroProps = {
  workspaceId: string;
  workspaceName?: string | null;
};

export function WorkspaceDashboardHero({
  workspaceId,
  workspaceName,
}: WorkspaceDashboardHeroProps) {
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  function formatWorkspaceName(value?: string | null) {
    if (!value) return "Workspace";
    return value
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-100 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex min-w-0 items-start sm:items-center gap-4 w-full">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-3xl shadow-sm">
            🧪
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="truncate text-2xl font-semibold tracking-tight text-gray-950">
                {formatWorkspaceName(workspaceName)}
              </h2>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Role: OWNER
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-600">
              Manage and collaborate on AI-ready knowledge files.
            </p>

            <p className="mt-0.5 text-sm text-gray-500">
              Upload, process, and query your documents with AYD.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-row items-center justify-end gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => setIsMembersOpen(true)}
            className="inline-flex h-9 items-center justify-center cursor-pointer whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Manage Members
          </button>

          <Link
            href={`/workspaces/${workspaceId}/chat`}
            className="inline-flex h-9 items-center cursor-pointer justify-center whitespace-nowrap rounded-lg bg-[#0E5B48] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0b4d3d] hover:shadow-md"
          >
            Open Chat
          </Link>
        </div>
      </div>
      <WorkspaceMembersDialog
        workspaceId={workspaceId}
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
      />
    </div>
  );
}