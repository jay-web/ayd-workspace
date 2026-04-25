import { ActivityTimelineCard } from "@/modules/workspace/components/dashboard/ActivityTimelineCard";
import { AiUsageTodayCard } from "@/modules/workspace/components/dashboard/AiUsageTodayCard";
import { DashboardStatCard } from "@/modules/workspace/components/dashboard/DashboardStatCard";
import { KnowledgeHealthCard } from "@/modules/workspace/components/dashboard/KnowledgeHealthCard";
import { MostQueriedDocumentsCard } from "@/modules/workspace/components/dashboard/MostQueriedDocumentsCard";
import { QuickActionsCard } from "@/modules/workspace/components/dashboard/QuickActionsCard";
import { RecentIngestionCard } from "@/modules/workspace/components/dashboard/RecentIngestionCard";
import { StorageOverviewCard } from "@/modules/workspace/components/dashboard/StorageOverviewCard";
import { WorkspaceDashboardHero } from "@/modules/workspace/components/dashboard/WorkspaceDashboardHero";
import { WorkspaceMembersCard } from "@/modules/workspace/components/dashboard/WorkspaceMembersCard";
import { listDocumentsByWorkspace } from "@/modules/documents/document.repo";
import { getWorkspaceById } from "@/modules/workspace/workspace.repo";

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
  const recentDocs = documents.slice(0, 4);

  return (
    <section className="h-full overflow-y-auto bg-[#f6f8f7]">
      <div className="space-y-4 px-4 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Workspace overview, activity, and AI knowledge health at a glance.
          </p>
        </div>

        <WorkspaceDashboardHero
          workspaceId={workspaceId}
          workspaceName={workspace?.name}
        />

        <div className="grid gap-4 md:grid-cols-5">
          <DashboardStatCard
            icon="📄"
            label="Total Documents"
            value={counts.total}
            sub="↑ 2 vs last 7 days"
          />

          <DashboardStatCard
            icon="✅"
            label="Ready"
            value={counts.ready ? "100%" : "0%"}
            sub={`${counts.ready} of ${counts.total} documents`}
          />

          <DashboardStatCard
            icon="💬"
            label="Queries Today"
            value="24"
            sub="↑ 33% vs yesterday"
          />

          <DashboardStatCard
            icon="🗄️"
            label="Storage Used"
            value="24.8 MB"
            sub="2% of 1 GB used"
          />

          <DashboardStatCard
            icon="⚡"
            label="Avg. Response Time"
            value="2.4s"
            sub="↓ 18% vs yesterday"
          />
        </div>

        <div className="grid items-stretch gap-4 xl:grid-cols-[1fr_1fr_1fr_300px]">
          <KnowledgeHealthCard
            total={counts.total}
            ready={counts.ready}
            processing={counts.processing}
            failed={counts.failed}
          />

          <ActivityTimelineCard documents={recentDocs} />

          <AiUsageTodayCard />

          <QuickActionsCard workspaceId={workspaceId} />
        </div>

     <div className="grid items-stretch gap-4 xl:grid-cols-4">
  <MostQueriedDocumentsCard documents={recentDocs} />
  <RecentIngestionCard documents={recentDocs} />
  <WorkspaceMembersCard />
  <StorageOverviewCard />
</div>
      </div>
    </section>
  );
}