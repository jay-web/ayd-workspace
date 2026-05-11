
import { ReactNode } from "react";
import { WorkspaceSidebar } from "@/modules/workspace/components/WorkspaceSidebar";
import { MobileBottomNav } from "@/modules/workspace/components/MobileBottomNav";
import { getWorkspaceById } from "@/modules/workspace/workspace.dynamo.repo";

type WorkspaceLayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspaceId } = await params;
  const workspace = await getWorkspaceById(workspaceId);
  const workspaceName = workspace?.name ?? null;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f6f8f7] md:h-[calc(100vh-72px)] md:min-h-0 md:overflow-hidden">
      <div className="flex min-h-[calc(100vh-72px)] md:h-full md:min-h-0 md:overflow-hidden">
        <div className="hidden md:block">
          <WorkspaceSidebar workspaceId={workspaceId} workspaceName={workspaceName} />
        </div>
        <main className="min-w-0 flex-1 bg-[#f6f8f7] py-1.5 pl-2 pr-1 pb-24 md:min-h-0 md:overflow-hidden md:pb-0 sm:py-2 sm:pl-3 sm:pr-1.5">
          {children}
        </main>

        <MobileBottomNav workspaceId={workspaceId} />
      </div>
    </div>
  );
}
