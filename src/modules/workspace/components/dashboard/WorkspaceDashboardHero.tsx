import Link from "next/link";

type WorkspaceDashboardHeroProps = {
  workspaceId: string;
  workspaceName?: string | null;
};

export function WorkspaceDashboardHero({
  workspaceId,
  workspaceName,
}: WorkspaceDashboardHeroProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-100 hover:shadow-lg">
      <div className="flex items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-3xl shadow-sm">
            🧪
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="truncate text-2xl font-semibold tracking-tight text-gray-950">
                {workspaceName ?? "Workspace"}
              </h2>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Role: OWNER
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-600">
              Manage and collaborate on AI-ready knowledge files.
            </p>

            <p className="mt-0.5 text-sm text-gray-500">
              Upload, process, and query your documents with AYD.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={`/workspaces/${workspaceId}/documents`}
            className="rounded-xl bg-[#0E5B48] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0b4d3d] hover:shadow-md"
          >
            Upload Document
          </Link>

          <Link
            href={`/workspaces/${workspaceId}/chat`}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:bg-emerald-50/50 hover:text-[#0E5B48] hover:shadow-md"
          >
            Open Chat
          </Link>
        </div>
      </div>
    </div>
  );
}