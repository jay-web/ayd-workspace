import DocumentsAutoRefresh from "@/modules/documents/components/DocumentsAutoRefresh";
import DocumentsUploadCard from "@/modules/documents/components/DocumentsUploadCard";
import { listDocumentsByWorkspace } from "@/modules/documents/document.repo";
import { getServerSession } from "@/lib/auth/getServerSession";
import { isUserMemberOfWorkspace } from "@/modules/workspace/workspace.repo";
import { redirect } from "next/navigation";

type DocumentListItem = {
  documentId: string;
  name: string;
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
  createdAt: string;
};

function getStatusClasses(status: DocumentListItem["status"]) {
  switch (status) {
    case "READY":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PROCESSING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";
    case "UPLOADING":
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getStatusCounts(documents: DocumentListItem[]) {
  return {
    total: documents.length,
    ready: documents.filter((doc) => doc.status === "READY").length,
    processing: documents.filter((doc) => doc.status === "PROCESSING").length,
    uploading: documents.filter((doc) => doc.status === "UPLOADING").length,
    failed: documents.filter((doc) => doc.status === "FAILED").length,
  };
}

export default async function WorkspaceDocumentsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const session = await getServerSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const isMember = await isUserMemberOfWorkspace(session.userId, workspaceId);

  if (!isMember) {
    redirect("/workspaces");
  }

  const documents = await listDocumentsByWorkspace(workspaceId);
  const counts = getStatusCounts(documents);

  return (
    <section className="h-full min-h-0 overflow-y-auto bg-[#f6f8f7]">
      <DocumentsAutoRefresh documents={documents} />

 <div className="min-h-full space-y-4 px-4 py-4">
       <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
         <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
              Documents
            </h1>
         <p className="mt-1 max-w-2xl text-sm text-gray-600">
              Manage your knowledge base, ingestion status, and file operations.
            </p>
          </div>

          <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#0E5B48] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b493a]">
            Upload
          </button>
        </div>

       <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex h-10 flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-500">
              Search documents...
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex">
              <button className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700">
                All Status
              </button>
              <button className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700">
                All Types
              </button>
              <button className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700">
                Newest First
              </button>
            </div>
          </div>
        </div>

       <div className="flex gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          {[
            ["All Files", counts.total],
            ["Ready", counts.ready],
            ["Processing", counts.processing + counts.uploading],
            ["Failed", counts.failed],
            ["Collections", 0],
          ].map(([label, count]) => (
            <button
              key={label}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-sm font-semibold ${
                label === "All Files"
                  ? "bg-[#0E5B48] text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}{" "}
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                  label === "All Files"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

  <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 self-start rounded-3xl border border-gray-200 bg-white shadow-sm">
           <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-950">
                  All Documents
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {documents.length}{" "}
                  {documents.length === 1 ? "document" : "documents"} in this
                  workspace
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>0 selected</span>
                <button className="rounded-xl border border-gray-200 px-3 py-2 font-medium text-gray-600">
                  Delete
                </button>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                  📄
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-900">
                  No documents uploaded yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Upload your first PDF to start building this workspace
                  knowledge base.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="w-12 px-5 py-2.5">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="px-4 py-2.5">Document</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Updated</th>
                      <th className="px-4 py-2.5">Size / Chunks</th>
                      <th className="px-5 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {documents.map((doc) => {
                      const isReady = doc.status === "READY";

                      return (
                        <tr key={doc.documentId} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input type="checkbox" className="rounded" />
                          </td>

                          <td className="min-w-[280px] px-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[11px] font-bold text-red-600">
                                PDF
                              </div>

                              <div className="min-w-0">
                               <p className="truncate text-sm font-semibold text-gray-950">
                                  {doc.name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  PDF document
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusClasses(
                                doc.status
                              )}`}
                            >
                              {doc.status}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                            {new Date(doc.createdAt).toLocaleString()}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                            —
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                                View
                              </button>

                              <button
                                disabled={!isReady}
                                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                  isReady
                                    ? "bg-[#0E5B48] text-white hover:bg-[#0b493a]"
                                    : "cursor-not-allowed bg-gray-100 text-gray-400"
                                }`}
                              >
                                Ask AI
                              </button>

                              <button className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                                ⋯
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        <aside className="self-start space-y-4">
            <DocumentsUploadCard workspaceId={workspaceId} />

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-950">
                Ingestion Queue
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                  <span className="text-sm font-medium text-emerald-800">
                    Ready
                  </span>
                  <span className="text-sm font-bold text-emerald-800">
                    {counts.ready}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
                  <span className="text-sm font-medium text-amber-800">
                    Processing
                  </span>
                  <span className="text-sm font-bold text-amber-800">
                    {counts.processing + counts.uploading}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3">
                  <span className="text-sm font-medium text-red-800">
                    Failed
                  </span>
                  <span className="text-sm font-bold text-red-800">
                    {counts.failed}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-950">Storage</h3>
              <p className="mt-2 text-sm text-gray-500">
                {documents.length} files stored in this workspace.
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-[12%] rounded-full bg-[#0E5B48]" />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Storage tracking will connect to real file metadata later.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}