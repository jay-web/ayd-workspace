import Link from "next/link";
import { ReactNode } from "react";
import { UserProfileBadge } from "@/components/UserProfileBadge";

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
        <aside className="flex flex-col border-r bg-white p-6">
          <nav className="flex flex-col gap-4">
            <Link
              href={`/workspaces/${workspaceId}`}
              className="rounded-2xl bg-black px-5 py-4 text-2xl text-white"
            >
              Dashboard
            </Link>

            <Link
              href={`/workspaces/${workspaceId}/documents`}
              className="rounded-2xl px-5 py-4 text-2xl text-slate-700 hover:bg-slate-100"
            >
              Documents
            </Link>

            <Link
              href={`/workspaces/${workspaceId}/chat`}
              className="rounded-2xl px-5 py-4 text-2xl text-slate-700 hover:bg-slate-100"
            >
              Chat
            </Link>
          </nav>

          <div className="mt-auto pt-12">
            <UserProfileBadge />
          </div>
        </aside>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}