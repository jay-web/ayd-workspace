import { formatDocumentName } from "./dashboard-formatters";

type DashboardDocument = {
    documentId: string;
    name: string;
    status: string;
};

type RecentIngestionCardProps = {
    documents: DashboardDocument[];
};



export function RecentIngestionCard({ documents }: RecentIngestionCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-950">
                        Recent Ingestion
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                        Latest document processing results
                    </p>
                </div>

                <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-500">
                    Latest
                </span>
            </div>

            <div className="mt-4 space-y-2.5">
                {documents.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 text-sm text-gray-500">
                        No ingestion activity yet.
                    </div>
                ) : (
                    documents.map((doc) => (
                        <div
                            key={doc.documentId}
                            className="group flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2 transition hover:border-emerald-100 hover:bg-emerald-50/50"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 shadow-sm">
                                    {getStatusIcon(doc.status)}
                                </span>

                                <p
                                    title={formatDocumentName(doc.name)}
                                    className="truncate text-sm font-medium text-gray-900"
                                >
                                    {formatDocumentName(doc.name)}
                                </p>
                            </div>

                            <StatusBadge status={doc.status} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles =
        status === "READY"
            ? "bg-emerald-50 text-emerald-700"
            : status === "FAILED"
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700";

    return (
        <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
        >
            {status}
        </span>
    );
}

function getStatusIcon(status: string) {
    if (status === "READY") return "✓";
    if (status === "FAILED") return "!";
    return "…";
}