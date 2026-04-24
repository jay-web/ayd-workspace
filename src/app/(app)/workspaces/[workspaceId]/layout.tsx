
import { ReactNode } from "react";
import { WorkspaceSidebar } from "@/modules/workspace/components/WorkspaceSidebar";

type WorkspaceLayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspaceId } = await params;
  

  return (
  <div className="min-h-screen bg-gray-50">
    <div className="flex h-[calc(100vh-72px)] min-h-0">
      <WorkspaceSidebar workspaceId={workspaceId} />
      <main className="min-h-0 min-w-0 flex-1 py-1.5 pl-2 pr-1 sm:py-2 sm:pl-3 sm:pr-1.5">
        {children}
      </main>
    </div>
  </div>
  );
}
