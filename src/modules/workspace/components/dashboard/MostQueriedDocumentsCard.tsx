import { formatDocumentName } from "./dashboard-formatters";

type DashboardDocument = {
  documentId: string;
  name: string;
};

type MostQueriedDocumentsCardProps = {
  documents: DashboardDocument[];
};



export function MostQueriedDocumentsCard({
  documents,
}: MostQueriedDocumentsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-950">
            Most Queried Documents
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Top documents by query count
          </p>
        </div>

        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-500">
          Top {documents.length}
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 text-sm text-gray-500">
            No queried documents yet.
          </div>
        ) : (
          documents.map((doc, index) => {
            const queries = 8 - index;

            return (
              <div
                key={doc.documentId}
                className="group flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5 transition hover:border-emerald-100 hover:bg-emerald-50/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-600 shadow-sm group-hover:text-[#0E5B48]">
                    {index + 1}
                  </span>

                 <p
  title={formatDocumentName(doc.name)}
  className="truncate text-sm font-medium text-gray-900"
>
  {formatDocumentName(doc.name)}
</p>
                </div>

               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#0E5B48] shadow-sm">
  {queries}
</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}