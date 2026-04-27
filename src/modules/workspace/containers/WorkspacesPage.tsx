"use client";

import { useEffect, useState } from "react";
import { CreateWorkspaceForm } from "../components/CreateWorkspaceForm";
import { WorkspaceCard } from "../components/WorkspaceCard";
import {
  CreateWorkspaceResponse,
  ListWorkspacesResponse,
  WorkspaceListItem,
} from "../workspace.types";
import { useRouter } from "next/navigation";
import { WorkspaceCardSkeleton } from "../components/WorkspaceCardSkeleton";
import { WorkspaceStatSkeleton } from "../components/WorkspaceStatSkeleton";

export function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const router = useRouter();

  async function loadWorkspaces() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/v1/workspaces");

      if (!res.ok) {
        throw new Error("Failed to load workspaces");
      }

      const data: ListWorkspacesResponse = await res.json();
      setWorkspaces(data.workspaces);
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
      setError("Unable to load workspaces right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function handleCreateWorkspace(name: string) {
    try {
      setCreating(true);
      setCreateError(null);

      const res = await fetch("/api/v1/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error("Failed to create workspace");
      }

      const data: CreateWorkspaceResponse = await res.json();
      const newWorkspaceId = data.workspace.workspaceId;

      router.push(`/workspaces/${newWorkspaceId}`);
    } catch (err) {
      console.error("Failed to create workspace", err);
      setCreateError("Unable to create workspace right now.");
    } finally {
      setCreating(false);
    }
  }

  const totalWorkspaces = workspaces.length;

  const totalRoles = new Set(
    workspaces.map((workspace) => workspace.role || "Member")
  ).size;

  return (
 <section className="min-h-[calc(100vh-72px)] bg-[#f6f8f7] px-5 py-5 sm:px-8 lg:px-10">
    <div className="mx-auto max-w-[1180px]">
        {/* Page Header */}
        <div className="mb-4">
         

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
             <h1 className="text-3xl font-bold tracking-tight text-[#061226] sm:text-4xl">
                Workspaces
              </h1>

              <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-600">
                Create and manage your intelligent document workspaces.
              </p>
            </div>

            <div className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
             {loading ? (
  <span className="block h-4 w-24 animate-pulse rounded-md bg-slate-200" />
) : (
  `${totalWorkspaces} workspace${totalWorkspaces === 1 ? "" : "s"}`
)}
            </div>
          </div>
        </div>

        {/* Stats */}
{loading ? (
  <div className="mb-4 grid gap-3 md:grid-cols-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <WorkspaceStatSkeleton key={index} />
    ))}
  </div>
) : (
  <div className="mb-4 grid gap-3 md:grid-cols-3">
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <span className="text-lg">▣</span>
        </div>

        <span className="text-sm font-semibold text-emerald-700">
          Active
        </span>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        Total Workspaces
      </p>

      <p className="mt-1 text-2xl font-bold text-[#061226]">
        {totalWorkspaces}
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <span className="text-lg">◎</span>
        </div>

        <span className="text-sm font-semibold text-slate-500">
          Your access
        </span>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        Current Roles
      </p>

      <p className="mt-1 text-2xl font-bold text-[#061226]">
        {totalRoles}
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <span className="text-lg">✓</span>
        </div>

        <span className="text-sm font-semibold text-emerald-700">
          Ready
        </span>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        Active Spaces
      </p>

      <p className="mt-1 text-2xl font-bold text-[#061226]">
        {totalWorkspaces}
      </p>
    </div>
  </div>
)}

        {/* Create Workspace */}
        <div className="mb-5">
          <CreateWorkspaceForm
            onCreate={handleCreateWorkspace}
            creating={creating}
            error={createError}
          />
        </div>

        {/* Workspace List */}
       {loading ? (
  <div>
    <div className="mb-3 flex items-center justify-between">
      <div className="h-5 w-32 animate-pulse rounded-md bg-slate-200" />
      <div className="h-4 w-56 animate-pulse rounded-md bg-slate-100" />
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <WorkspaceCardSkeleton key={index} />
      ))}
    </div>
  </div>
) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-700">
              +
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#061226]">
              No workspaces yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your first workspace to start uploading, organizing, and
              chatting with your documents.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#061226]">
                Your workspaces
              </h2>

              <p className="text-sm text-slate-500">
                Open a workspace to manage documents
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {workspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.workspaceId}
                  workspaceId={workspace.workspaceId}
                  name={workspace.name}
                  role={workspace.role}
                  joinedAt={workspace.joinedAt}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}