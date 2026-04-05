
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
      <div className="grid min-h-[calc(100vh-88px)] grid-cols-[260px_1fr]">
        <WorkspaceSidebar workspaceId={workspaceId} />

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}