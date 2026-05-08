
import { DashboardStatCard } from "@/modules/workspace/components/dashboard/DashboardStatCard";

import { QuickActionsCard } from "@/modules/workspace/components/dashboard/QuickActionsCard";


import { WorkspaceDashboardHero } from "@/modules/workspace/components/dashboard/WorkspaceDashboardHero";
import DocumentsAutoRefresh from "@/modules/documents/components/DocumentsAutoRefresh";

import { listDocumentsByWorkspace } from "@/modules/documents/document.dynamo.repo";
import { getWorkspaceById } from "@/modules/workspace/workspace.dynamo.repo";
import { formatFileSize } from "@/lib/utils";


type WorkspaceDashboardPageProps = {
  workspaceId: string;
};

function getCounts(documents: any[]) {
  return {
    total: documents.length,
    ready: documents.filter((document) => document.status === "READY").length,
    processing: documents.filter(
      (document) =>
        document.status === "PROCESSING" || document.status === "UPLOADING"
    ).length,
    failed: documents.filter((document) => document.status === "FAILED").length,
  };
}

export async function WorkspaceDashboardPage({
  workspaceId,
}: WorkspaceDashboardPageProps) {
  const workspace = await getWorkspaceById(workspaceId);
  const documents = await listDocumentsByWorkspace(workspaceId);
  const counts = getCounts(documents);
  const recentDocs = documents.slice(0, 5);

  return (
    <section className="h-full overflow-y-auto overflow-x-hidden bg-[#f6f8f7]">
      <DocumentsAutoRefresh documents={documents} />
      <div className="space-y-4 px-3 sm:px-4 md:px-6 lg:px-8 py-4 pb-20 md:pb-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Workspace</h1>
          <p className="mt-1 text-sm text-gray-600">
            Workspace overview, document activity, members, and AI access at a glance.
          </p>
        </div>

        <WorkspaceDashboardHero
          workspaceId={workspaceId}
          workspaceName={workspace?.name}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            icon="📄"
            label="Total Documents"
            value={counts.total}
            sub={`${counts.total} uploaded files`}
          />

          <DashboardStatCard
            icon="✅"
            label="Ready"
            value={counts.ready}
            sub={`${counts.ready} available for chat`}
          />

          <DashboardStatCard
            icon="⏳"
            label="Processing"
            value={counts.processing}
            sub="Currently being prepared"
          />

          <DashboardStatCard
            icon="⚠️"
            label="Failed"
            value={counts.failed}
            sub="Needs retry or review"
          />
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-950">
                  Recent Documents
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Latest files added to this workspace.
                </p>
              </div>

              <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                {recentDocs.length}
              </span>
            </div>

            <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
              {recentDocs.map((document) => (
                <div
                  key={document.documentId}
                  className="flex flex-col gap-2 px-4 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_120px_100px_120px] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-950">
                      {document.originalFileName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {document.status}
                    </p>
                  </div>

                  <p className="text-xs font-medium text-gray-600 sm:text-right">
                    {formatFileSize(document.sizeBytes)}
                  </p>

                  <p className="text-xs font-medium text-gray-600 sm:text-right">
                    {document.chunkCount ?? 0} chunks
                  </p>

                  <p className="text-xs font-medium text-gray-600 sm:text-right">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <QuickActionsCard workspaceId={workspaceId} />
        </div>


      </div>
    </section>
  );
}