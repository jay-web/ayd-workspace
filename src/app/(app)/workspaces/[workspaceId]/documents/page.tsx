import CreateTestDocumentForm from "@/modules/documents/components/CreateTestDocumentForm";

type DocumentListItem = {
  documentId: string;
  name: string;
  status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
  createdAt: string;
};

async function getDocuments(workspaceId: string): Promise<DocumentListItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/v1/workspaces/${workspaceId}/documents`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }

  const data = await res.json();
  return data.items ?? [];
}

export default async function WorkspaceDocumentsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const documents = await getDocuments(workspaceId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage documents for this workspace.
        </p>
      </div>
       {/* 🔥 Add this form */}
      <CreateTestDocumentForm workspaceId={workspaceId} />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Uploaded Documents
          </h2>
        </div>

        {documents.length === 0 ? (
          <div className="px-5 py-10 text-sm text-gray-500">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div
                key={doc.documentId}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(doc.createdAt).toLocaleString()}
                  </p>
                </div>

                <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
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