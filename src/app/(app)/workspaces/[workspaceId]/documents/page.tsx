import DocumentsUploadCard from "@/modules/documents/components/DocumentsUploadCard";
import { listDocumentsByWorkspace } from "@/modules/documents/document.repo";
import { isUserMemberOfWorkspace } from "@/modules/workspace/workspace.repo";
import { getServerSession } from "@/lib/auth/getServerSession";
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-10 sm:px-8 lg:px-10">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
          Documents
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 sm:text-lg">
          Manage documents for this workspace.
        </p>
      </div>

      <DocumentsUploadCard workspaceId={workspaceId} />

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Uploaded Documents
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {documents.length}{" "}
              {documents.length === 1 ? "document" : "documents"}
            </p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg">
              📄
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">
              No documents uploaded yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Upload your first document to start building this workspace knowledge base.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div
                key={doc.documentId}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm">
                    📄
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {doc.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Added {new Date(doc.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                    doc.status
                  )}`}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}