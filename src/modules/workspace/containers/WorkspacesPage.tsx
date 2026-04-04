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
      console.log("Data", data);
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

      const data:CreateWorkspaceResponse = await res.json();

        const newWorkspaceId = data.workspace.workspaceId;

        // 🚀 redirect user into workspace
        router.push(`/workspaces/${newWorkspaceId}`);
    } catch (err) {
      console.error("Failed to create workspace", err);
      setCreateError("Unable to create workspace right now.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="px-6 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Workspaces
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage your document workspaces.
          </p>
        </div>

        <div className="mb-10">
          <CreateWorkspaceForm
            onCreate={handleCreateWorkspace}
            creating={creating}
            error={createError}
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
            Loading workspaces...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : workspaces?.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No workspaces yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Create your first workspace to start uploading and organizing documents.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {workspaces?.map((workspace) => (
              <WorkspaceCard
                key={workspace.workspaceId}
                workspaceId={workspace.workspaceId}
                name={workspace.name}
                role={workspace.role}
                joinedAt={workspace.joinedAt}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}