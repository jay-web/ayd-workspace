
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
    <div className="h-[calc(100vh-72px)] min-h-0 overflow-hidden bg-[#f6f8f7]">
      <div className="flex h-full min-h-0 overflow-hidden">
        <WorkspaceSidebar workspaceId={workspaceId} />
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden bg-[#f6f8f7] py-1.5 pl-2 pr-1 sm:py-2 sm:pl-3 sm:pr-1.5">
          {children}
        </main>
      </div>
    </div>
  );
}
