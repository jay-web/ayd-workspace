import DocumentsAutoRefresh from "@/modules/documents/components/DocumentsAutoRefresh";
import DocumentsUploadCard from "@/modules/documents/components/DocumentsUploadCard";
import { listDocumentsByWorkspace } from "@/modules/documents/document.dynamo.repo";
import { getServerSession } from "@/lib/auth/getServerSession";

import { redirect } from "next/navigation";
import { isWorkspaceMember } from "@/modules/workspace/workspace.dynamo.repo";
import { DocumentStatus } from "@/contracts/document";
import DocumentsClientList from "@/modules/documents/components/DocumentsClientList";

type DocumentListItem = {
  documentId: string;
  name: string;
  status: DocumentStatus;
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

  const isMember = await isWorkspaceMember({workspaceId, userId: session.userId});

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

        
        </div>

   

      

  <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
         <DocumentsClientList workspaceId={workspaceId} documents={documents} />

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

            {/* <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
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
            </div> */}
          </aside>
        </div>
      </div>
    </section>
  );
}