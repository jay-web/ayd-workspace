
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
    <div className="flex min-h-[calc(100vh-72px)] gap-6 p-0">
      <WorkspaceSidebar workspaceId={workspaceId} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  </div>
  );
}