"use client";

import { useEffect, useMemo, useState } from "react";
import { DocumentStatus } from "@/contracts/document";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import DeleteDocumentsDialog from "./DeleteDocumentsDialog";
import { formatFileSize } from "@/lib/utils";


type DocumentListItem = {
    documentId: string;
    name: string;
    status: DocumentStatus;
    createdAt: string;
    sizeBytes?: number;
    chunkCount?: number | null;
};

type StatusFilter = "ALL" | "READY" | "PROCESSING" | "FAILED";

type DocumentsClientListProps = {
    workspaceId: string;
    documents: DocumentListItem[];
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



export default function DocumentsClientList({
    workspaceId,
    documents,
}: DocumentsClientListProps) {
    const [documentItems, setDocumentItems] = useState(documents);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [typeFilter, setTypeFilter] = useState<"ALL" | "PDF">("ALL");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const router = useRouter();
    const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setDocumentItems(documents);
    }, [documents]);

    const counts = useMemo(() => {
        return {
            total: documentItems.length,
            ready: documentItems.filter((doc) => doc.status === "READY").length,
            processing: documentItems.filter(
                (doc) => doc.status === "PROCESSING" || doc.status === "UPLOADING"
            ).length,
            failed: documentItems.filter((doc) => doc.status === "FAILED").length,
        };
    }, [documentItems]);

    const filteredDocuments = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        const filtered = documentItems.filter((doc) => {
            const matchesSearch = query
                ? doc.name.toLowerCase().includes(query)
                : true;

            const matchesStatus =
                statusFilter === "ALL"
                    ? true
                    : statusFilter === "PROCESSING"
                        ? doc.status === "PROCESSING" || doc.status === "UPLOADING"
                        : doc.status === statusFilter;

            const matchesType =
                typeFilter === "ALL" ? true : doc.name.toLowerCase().endsWith(".pdf");

            return matchesSearch && matchesStatus && matchesType;
        });

        return filtered.sort((a, b) => {
            const firstDate = new Date(a.createdAt).getTime();
            const secondDate = new Date(b.createdAt).getTime();

            return sortOrder === "newest"
                ? secondDate - firstDate
                : firstDate - secondDate;
        });
    }, [documentItems, searchQuery, statusFilter, typeFilter, sortOrder]);

    const allVisibleSelected =
        filteredDocuments.length > 0 &&
        filteredDocuments.every((doc) => selectedIds.includes(doc.documentId));

    function toggleDocument(documentId: string) {
        setSelectedIds((current) =>
            current.includes(documentId)
                ? current.filter((id) => id !== documentId)
                : [...current, documentId]
        );
    }

    function toggleAllVisible() {
        if (allVisibleSelected) {
            setSelectedIds((current) =>
                current.filter(
                    (id) => !filteredDocuments.some((doc) => doc.documentId === id)
                )
            );
            return;
        }

        setSelectedIds((current) => {
            const next = new Set(current);

            for (const doc of filteredDocuments) {
                next.add(doc.documentId);
            }

            return Array.from(next);
        });
    }

    const tabs: {
        label: string;
        value: StatusFilter;
        count: number;
    }[] = [
            { label: "All Files", value: "ALL", count: counts.total },
            { label: "Ready", value: "READY", count: counts.ready },
            { label: "Processing", value: "PROCESSING", count: counts.processing },
            { label: "Failed", value: "FAILED", count: counts.failed },
        ];

    async function handleViewDocument(documentId: string) {
        try {
            const response = await fetch(
                `/api/v1/workspaces/${workspaceId}/documents/${documentId}/open`
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to open document");
                return;
            }

            window.open(data.url, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Failed to open document:", error);
            alert("Failed to open document");
        }
    }

    const deleteTargetDocuments = useMemo(() => {
        return documentItems
            .filter((doc) => deleteTargetIds.includes(doc.documentId))
            .map((doc) => ({
                documentId: doc.documentId,
                name: doc.name,
            }));
    }, [documentItems, deleteTargetIds]);

    function openDeleteDialog(documentIds: string[]) {
        if (documentIds.length === 0) return;
        setDeleteTargetIds(documentIds);
    }




    function closeDeleteDialog() {
        if (isDeleting) return;
        setDeleteTargetIds([]);
    }

    async function confirmDeleteDocuments() {
        if (deleteTargetIds.length === 0) return;

        try {
            setIsDeleting(true);

            await Promise.all(
                deleteTargetIds.map(async (documentId) => {
                    const response = await fetch(
                        `/api/v1/workspaces/${workspaceId}/documents/${documentId}`,
                        { method: "DELETE" }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Failed to delete document");
                    }
                })
            );

            setDocumentItems((current) =>
                current.filter((doc) => !deleteTargetIds.includes(doc.documentId))
            );

            setSelectedIds((current) =>
                current.filter((id) => !deleteTargetIds.includes(id))
            );

            setDeleteTargetIds([]);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete document(s):", error);
            alert("Failed to delete document(s)");
        } finally {
            setIsDeleting(false);
        }
    }
    return (
        <div className="space-y-4 w-full max-w-full overflow-x-hidden">
            <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search documents..."
                        className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 outline-none focus:border-[#0E5B48] focus:bg-white"
                    />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:flex">
                        <button
                            onClick={() =>
                                setTypeFilter((current) => (current === "ALL" ? "PDF" : "ALL"))
                            }
                            className="w-full h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            {typeFilter === "ALL" ? "All Types" : "PDF Only"}
                        </button>

                        <button
                            onClick={() =>
                                setSortOrder((current) => (current === "newest" ? "oldest" : "newest"))
                            }
                            className="w-full h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm overflow-x-auto whitespace-nowrap">
                {tabs.map((tab) => {
                    const isActive = statusFilter === tab.value;

                    return (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold ${isActive
                                ? "bg-[#0E5B48] text-white"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {tab.label} {" "}
                            <span
                                className={`ml-1 rounded-full px-2 py-0.5 text-[11px] ${isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-100 text-gray-500"
                                    }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="min-w-0 self-start rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-950">
                            All Documents
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Showing {filteredDocuments.length} of {documents.length} documents
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{selectedIds.length} selected</span>
                        <button
                            onClick={() => openDeleteDialog(selectedIds)}
                            disabled={selectedIds.length === 0}
                            className={`rounded-xl border px-3 py-2 font-medium ${selectedIds.length > 0
                                ? "border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                                : "cursor-not-allowed border-gray-200 text-gray-400"
                                }`}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {filteredDocuments.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                            🔍
                        </div>
                        <p className="mt-4 text-sm font-semibold text-gray-900">
                            No matching documents
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Try another search or status filter.
                        </p>
                    </div>
                                ) : (
                                        <>
                                            {/* Mobile stacked list */}
                                              <div className="space-y-3 sm:hidden w-full max-w-full">
                                                {filteredDocuments.map((doc) => {
                                                    const isReady = doc.status === "READY";
                                                    const isSelected = selectedIds.includes(doc.documentId);

                                                    return (
                                                        <div
                                                            key={doc.documentId}
                                                            className="rounded-2xl border border-gray-200 bg-white p-3 w-full max-w-full min-w-0"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex items-start gap-3 min-w-0">
                                                                    <input
                                                                        checked={isSelected}
                                                                        onChange={() => toggleDocument(doc.documentId)}
                                                                        type="checkbox"
                                                                        className="mt-1 h-4 w-4 shrink-0 rounded border border-gray-300 accent-[#0E5B48]"
                                                                    />

                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-semibold text-gray-950">
                                                                            {doc.name}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-gray-500">
                                                                            {doc.status} • {formatFileSize(doc.sizeBytes)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="shrink-0 flex items-center gap-2 whitespace-nowrap">
                                                                    <button
                                                                        onClick={() => handleViewDocument(doc.documentId)}
                                                                        className="inline-flex h-8 items-center justify-center rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        View
                                                                    </button>

                                                                    {isReady ? (
                                                                        <Link
                                                                            href={`/workspaces/${workspaceId}/chat?documentId=${doc.documentId}`}
                                                                            className="inline-flex h-8 items-center justify-center rounded-md bg-[#0E5B48] px-2 py-1 text-xs font-semibold text-white hover:bg-[#0b493a]"
                                                                        >
                                                                            Ask
                                                                        </Link>
                                                                    ) : (
                                                                        <button
                                                                            disabled
                                                                            className="inline-flex h-8 items-center justify-center rounded-lg bg-gray-100 px-2 text-xs font-semibold text-gray-400"
                                                                        >
                                                                            Ask
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 flex-wrap">
                                                                <div className="min-w-0 truncate">
                                                                    {doc.chunkCount ? `${doc.chunkCount} chunks` : "—"}
                                                                </div>
                                                                <div className="whitespace-nowrap">{new Date(doc.createdAt).toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Desktop/tablet table */}
                                            <div className="hidden sm:block overflow-x-auto">
                                                <table className="min-w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="w-14 px-0 py-2.5 text-center">
                                        <input
                                            checked={allVisibleSelected}
                                            onChange={toggleAllVisible}
                                            type="checkbox"
                                            className="mx-auto block h-4 w-4 cursor-pointer rounded border border-gray-300 accent-[#0E5B48] transition duration-150 hover:scale-105 focus:ring-2 focus:ring-[#0E5B48]/20"
                                        />
                                    </th>
                                    <th className="px-4 py-2.5">Document</th>
                                    <th className="px-4 py-2.5">Status</th>
                                    <th className="px-4 py-2.5">Updated</th>
                                    <th className="px-4 py-2.5">Size / Chunks</th>
                                    <th className="px-5 py-2.5 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredDocuments.map((doc) => {
                                    const isReady = doc.status === "READY";
                                    const isSelected = selectedIds.includes(doc.documentId);

                                    return (
                                        <tr key={doc.documentId} className="hover:bg-gray-50">
                                            <td className="w-14 px-0 py-3 text-center">
                                                <input
                                                    checked={isSelected}
                                                    onChange={() => toggleDocument(doc.documentId)}
                                                    type="checkbox"
                                                    className="mx-auto block h-4 w-4 cursor-pointer rounded border border-gray-300 accent-[#0E5B48] transition duration-150 hover:scale-105 focus:ring-2 focus:ring-[#0E5B48]/20"
                                                />
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
                                                {formatFileSize(doc.sizeBytes)}
                                                <span className="mx-1 text-gray-300">/</span>
                                                {doc.chunkCount ? `${doc.chunkCount} chunks` : "—"}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDocument(doc.documentId)}
                                                        className="inline-flex h-9 min-w-[56px] cursor-pointer items-center justify-center rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        View
                                                    </button>

                                                    {isReady ? (
                                                        <Link
                                                            href={`/workspaces/${workspaceId}/chat?documentId=${doc.documentId}`}
                                                            className="inline-flex h-9 min-w-[64px] items-center justify-center rounded-lg bg-[#0E5B48] px-3 text-xs font-semibold text-white hover:bg-[#0b493a]"
                                                        >
                                                            Ask AI
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="inline-flex h-9 min-w-[64px] cursor-not-allowed items-center justify-center rounded-lg bg-gray-100 px-3 text-xs font-semibold text-gray-400"
                                                        >
                                                            Ask AI
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => openDeleteDialog([doc.documentId])}
                                                        aria-label="Delete document"
                                                        title="Delete document"
                                                        className="inline-flex h-9 w-9 items-center justify-center cursor-pointer rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                                            </div>
                                            </>
                )}
            </div>
            <DeleteDocumentsDialog
                documents={deleteTargetDocuments}
                isDeleting={isDeleting}
                onCancel={closeDeleteDialog}
                onConfirm={confirmDeleteDocuments}
            />
        </div>
    );
}