"use client";

import { useEffect, useState } from "react";
import { WorkspaceDetails } from "../workspace.types";

type WorkspaceDashboardPageProps = {
  workspaceId: string;
};

type DashboardResponse = {
  documents: {
    totalDocuments: number;
    uploadedDocuments: number;
    processingDocuments: number;
    readyDocuments: number;
    failedDocuments: number;
  },
  recentDocuments: {
    documentId: string;
    name: string;
    status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
    createdAt: string;
  }[];
};

export function WorkspaceDashboardPage({
  workspaceId,
}: WorkspaceDashboardPageProps) {
  const [workspace, setWorkspace] = useState<WorkspaceDetails | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [workspaceRes, dashboardRes] = await Promise.all([
          fetch(`/api/v1/workspaces/${workspaceId}`),
          fetch(`/api/v1/workspaces/${workspaceId}/dashboard`),
        ]);

        if (!workspaceRes.ok) {
          throw new Error("Failed to load workspace details");
        }

        if (!dashboardRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const workspaceData: { workspace: WorkspaceDetails } =
          await workspaceRes.json();
        const dashboardData: DashboardResponse = await dashboardRes.json();

        setWorkspace(workspaceData.workspace);
        setDashboard(dashboardData);
      } catch (err) {
        console.error("Failed to fetch workspace dashboard data", err);
        setError("Unable to load workspace dashboard right now.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [workspaceId]);

  if (loading) {
    return (
      <section>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
          Loading workspace dashboard...
        </div>
      </section>
    );
  }

  if (error || !workspace || !dashboard) {
    return (
      <section>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700 shadow-sm">
          {error ?? "Workspace dashboard not found."}
        </div>
      </section>
    );
  }

  const cards = [
    {
      label: "Total Documents",
      value: dashboard.documents.totalDocuments,
    },
    {
      label: "Uploaded",
      value: dashboard.documents.uploadedDocuments,
    },
    {
      label: "Ready",
      value: dashboard.documents.readyDocuments,
    },
    {
      label: "Processing",
      value: dashboard.documents.processingDocuments,
    },
    {
      label: "Failed",
      value: dashboard.documents.failedDocuments,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 sm:px-8 lg:px-10">
      <div className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Workspace Overview
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {workspace.name}
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Manage documents and collaborate inside this workspace.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Role: {workspace.role}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
  <div className="border-b border-gray-100 px-5 py-4">
    <h2 className="text-sm font-semibold text-gray-900">
      Recent Documents
    </h2>
  </div>

  {dashboard.recentDocuments.length === 0 ? (
    <div className="px-5 py-8 text-sm text-gray-500">
      No recent documents.
    </div>
  ) : (
    <div className="divide-y divide-gray-100">
      {dashboard.recentDocuments.map((doc) => (
        <div
          key={doc.documentId}
          className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {doc.name}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {new Date(doc.createdAt).toLocaleString()}
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-gray-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {doc.status}
          </span>
        </div>
      ))}
    </div>
  )}
</div>
    </section>
  );
}