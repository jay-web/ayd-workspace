import { WorkspaceDashboardPage } from "@/modules/workspace/containers/WorkspaceDashboardPage";

type WorkspaceDashboardRouteProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceDashboardRoute({
  params,
}: WorkspaceDashboardRouteProps) {
  const { workspaceId } = await params;

  return <WorkspaceDashboardPage workspaceId={workspaceId} />;
}