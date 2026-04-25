import { formatDocumentName } from "./dashboard-formatters";

type DashboardDocument = {
  documentId: string;
  name: string;
  status: string;
  createdAt: string | Date;
};

type ActivityTimelineCardProps = {
  documents: DashboardDocument[];
};

export function ActivityTimelineCard({ documents }: ActivityTimelineCardProps) {
   
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-950">
            Activity Timeline
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Latest document processing activity
          </p>
        </div>

        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-500">
          Recent
        </span>
      </div>

      <div className="mt-5 space-y-0">
        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 text-sm text-gray-500">
            No recent document activity yet.
          </div>
        ) : (
          documents.map((doc, index) => {
            const isLast = index === documents.length - 1;

            return (
             <div key={doc.documentId} className="relative flex gap-3 pb-3.5">
                {!isLast && (
                  <span className="absolute left-[9px] top-6 h-full w-px bg-emerald-100" />
                )}

                <span className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] text-emerald-700">
                  ✓
                </span>

                <div className="min-w-0 flex-1">
                 <p className="truncate text-sm font-medium text-gray-900">
                  {formatDocumentName(doc.name)}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold text-emerald-700">
                      {doc.status}
                    </span>
                    <span>•</span>
                    <span>{new Date(doc.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}