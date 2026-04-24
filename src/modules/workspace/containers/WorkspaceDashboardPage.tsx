import Link from "next/link";
import { listDocumentsByWorkspace } from "@/modules/documents/document.repo";
import { getWorkspaceById } from "@/modules/workspace/workspace.repo";

type WorkspaceDashboardPageProps = {
  workspaceId: string;
};

function getCounts(documents: any[]) {
  return {
    total: documents.length,
    ready: documents.filter((d) => d.status === "READY").length,
    processing: documents.filter(
      (d) => d.status === "PROCESSING" || d.status === "UPLOADING"
    ).length,
    failed: documents.filter((d) => d.status === "FAILED").length,
  };
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "READY"
      ? "bg-emerald-50 text-emerald-700"
      : status === "FAILED"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
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

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                🧪
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-gray-950">
                    {workspace?.name ?? "Workspace"}
                  </h2>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Role: OWNER
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Manage and collaborate on AI-ready knowledge files.
                </p>
                <p className="text-sm text-gray-500">
                  Upload, process, and query your documents with AYD.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/workspaces/${workspaceId}/documents`}
                className="rounded-xl bg-[#0E5B48] px-4 py-2 text-sm font-semibold text-white shadow-sm"
              >
                Upload Document
              </Link>
              <Link
                href={`/workspaces/${workspaceId}/chat`}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Open Chat
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            ["📄", "Total Documents", counts.total, "↑ 2 vs last 7 days"],
            ["✅", "Ready", `${counts.ready ? "100%" : "0%"}`, `${counts.ready} of ${counts.total} documents`],
            ["💬", "Queries Today", "24", "↑ 33% vs yesterday"],
            ["🗄️", "Storage Used", "24.8 MB", "2% of 1 GB used"],
            ["⚡", "Avg. Response Time", "2.4s", "↓ 18% vs yesterday"],
          ].map(([icon, label, value, sub]) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-xl">
                  {icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-gray-950">{value}</p>
                  <p className="mt-1 text-xs text-gray-500">{sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      <div className="grid items-start gap-4 xl:grid-cols-[1fr_1fr_1fr_300px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-950">Knowledge Health</h3>
            <div className="mt-4 flex items-center gap-6">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border-[18px] border-emerald-500">
                <div className="text-center">
                  <p className="text-2xl font-semibold">{counts.total}</p>
                  <p className="text-xs text-gray-500">Total Docs</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <p>🟢 Ready <span className="ml-8 font-semibold">{counts.ready}</span></p>
                <p>🟠 Processing <span className="ml-2 font-semibold">{counts.processing}</span></p>
                <p>🔴 Failed <span className="ml-8 font-semibold">{counts.failed}</span></p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-950">Activity Timeline</h3>
            <div className="mt-4 space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.documentId} className="flex gap-3 text-sm">
                  <span>✅</span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.status} · {new Date(doc.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-950">AI Usage Today</h3>
            <div className="mt-5 flex h-36 items-end gap-2">
              {[20, 35, 50, 45, 60, 75, 65, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-[#0E5B48]" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-xs text-gray-500">Top Intent</p>
               <p className="text-sm font-semibold text-gray-900">Concept Explanation</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-xs text-gray-500">Top Model</p>
               <p className="text-sm font-semibold text-gray-900">Bedrock Nova</p>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-950">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              {[
                ["Upload Document", `/workspaces/${workspaceId}/documents`],
                ["Open AI Chat", `/workspaces/${workspaceId}/chat`],
                ["View All Documents", `/workspaces/${workspaceId}/documents`],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                 className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  {label}
                  <span>→</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>

       <div className="grid items-start gap-4 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-950">Most Queried Documents</h3>
            <div className="mt-4 space-y-3">
              {recentDocs.map((doc, index) => (
                <div key={doc.documentId} className="flex items-center justify-between gap-3 text-sm text-gray-700">
                  <span className="truncate">{index + 1}. {doc.name}</span>
                  <span className="text-xs text-gray-500">{8 - index} queries</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-950">Recent Ingestion</h3>
            <div className="mt-4 space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.documentId} className="flex items-center justify-between gap-2 text-sm text-gray-700">
                  <span className="truncate">{doc.name}</span>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-950">Workspace Members</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p>J You <span className="float-right rounded-full bg-emerald-50 px-2 text-xs text-emerald-700">OWNER</span></p>
              <p>N Nadine <span className="float-right rounded-full bg-gray-100 px-2 text-xs">EDITOR</span></p>
              <p>A Alex <span className="float-right rounded-full bg-gray-100 px-2 text-xs">VIEWER</span></p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-950">Storage Overview</h3>
            <div className="mt-5 flex h-28 w-28 items-center justify-center rounded-full border-[16px] border-gray-200">
              <div className="text-center">
                <p className="font-semibold">24.8 MB</p>
                <p className="text-xs text-gray-500">of 1 GB</p>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              2% of total storage used
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}