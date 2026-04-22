type ChatDocument = {
  documentId: string;
  name: string;
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
};

function getStatusClasses(status: ChatDocument["status"]) {
  switch (status) {
    case "READY":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PROCESSING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "UPLOADING":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "FAILED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

export default function ChatSidebar({
  documents,
  documentId,
  onSelectDocument,
}: {
  documents: ChatDocument[];
  documentId: string;
  onSelectDocument: (value: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-slate-200 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Documents
            </p>
            <h3 className="mt-2 text-[20px] font-semibold tracking-tight text-slate-950">
              Your files
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Total
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {documents.length}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-4">
          {documents.map((doc) => {
            const isSelected = documentId === doc.documentId;

            return (
              <button
                key={doc.documentId}
                type="button"
                onClick={() => onSelectDocument(doc.documentId)}
                className={`block w-full rounded-[26px] border p-5 text-left transition ${
                  isSelected
                    ? "border-slate-900 bg-slate-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-xl ${
                        isSelected
                          ? "border-slate-300 bg-white"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      📄
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-900">
                        {doc.name}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Ready for grounded Q&amp;A
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
                      doc.status
                    )}`}
                  >
                    {doc.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 px-6 py-5">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Grounded answers</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select a file, ask questions, and inspect source evidence on the
            right.
          </p>
        </div>
      </div>
    </div>
  );
}