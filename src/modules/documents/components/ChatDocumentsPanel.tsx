"use client";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ChatDocumentView } from "./chat.types";
import { useDocumentUpload } from "./useDocumentUpload";

type ChatDocumentsPanelProps = {
  workspaceId: string;
  documents: ChatDocumentView[];
  selectedDocumentId: string;
  onSelectDocument: (id: string) => void;
  onDocumentsChanged?: (documentId?: string) => void | Promise<void>;
};

type DocumentFilter = "ALL" | "READY" | "PROCESSING" | "FAILED";

function getStatusClasses(status: ChatDocumentView["status"]) {
  switch (status) {
    case "READY":
      return "bg-emerald-100 text-emerald-700";
    case "PROCESSING":
      return "bg-amber-100 text-amber-700";
    case "UPLOADING":
      return "bg-sky-100 text-sky-700";
    case "FAILED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getStatusDotColor(status: ChatDocumentView["status"]) {
  switch (status) {
    case "READY":
      return "bg-emerald-500";
    case "PROCESSING":
      return "bg-amber-400";
    case "UPLOADING":
      return "bg-sky-400";
    case "FAILED":
      return "bg-rose-500";
    default:
      return "bg-slate-400";
  }
}

function getStatusLabel(status: ChatDocumentView["status"]) {
  switch (status) {
    case "PROCESSING":
      return "Processing now";
    case "UPLOADING":
      return "Uploading now";
    default:
      return status;
  }
}

function isActiveStatus(status: ChatDocumentView["status"]) {
  return status === "PROCESSING" || status === "UPLOADING";
}

function ActiveStatusDots() {
  return (
    <span className="inline-flex items-center gap-0.5 leading-none">
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-[bounce_1s_infinite_0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-[bounce_1s_infinite_0.3s]" />
    </span>
  );
}

export default function ChatDocumentsPanel({
  workspaceId,
  documents,
  selectedDocumentId,
  onSelectDocument,
  onDocumentsChanged,
}: ChatDocumentsPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState<DocumentFilter>("ALL");
const [latestUploadedDocumentId, setLatestUploadedDocumentId] = useState<string | null>(null);

  const {
    inputRef,
    uploading,
    uploadProgress,
    openFilePicker,
    handleFileChange,
  } = useDocumentUpload({
    workspaceId,
    onUploaded: async (documentId) => {
  setLatestUploadedDocumentId(documentId);
  setStatusFilter("ALL");
  setSearchTerm("");

  await onDocumentsChanged?.(documentId);
  onSelectDocument(documentId);
},
  });

 const filteredDocuments = useMemo(() => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      doc.name.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "ALL" || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!latestUploadedDocumentId) {
    return filtered;
  }

  return [...filtered].sort((a, b) => {
    if (a.id === latestUploadedDocumentId) return -1;
    if (b.id === latestUploadedDocumentId) return 1;
    return 0;
  });
}, [documents, searchTerm, statusFilter, latestUploadedDocumentId]);

  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-2.5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-[320px]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <div className="shrink-0">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between gap-2"
          }`}
        >
          {!collapsed ? (
            <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900">
              Documents
            </h2>
          ) : null}

          <div className={`flex items-center ${collapsed ? "" : "gap-2"}`}>
            {!collapsed ? (
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-2.5 py-2 text-[12px] font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading ? `${uploadProgress}%` : "Upload"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label={
                collapsed
                  ? "Expand documents sidebar"
                  : "Collapse documents sidebar"
              }
              title={
                collapsed
                  ? "Expand documents sidebar"
                  : "Collapse documents sidebar"
              }
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {!collapsed ? (
          <div className="mt-2.5 flex items-center gap-1.5">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-300"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as DocumentFilter)
              }
              aria-label="Filter documents by status"
              className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-600 outline-none transition focus:border-emerald-300"
            >
              <option value="ALL">All</option>
              <option value="READY">Ready</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        ) : null}
      </div>

      <div
        className={`ayd-scrollbar mt-2.5 min-h-0 flex-1 overflow-y-auto ${
          collapsed ? "" : "pr-1"
        }`}
      >
        <div className="space-y-1.5">
          {filteredDocuments.length === 0 && !collapsed ? (
            <div className="rounded-[14px] border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center">
              <p className="text-[12px] font-medium text-slate-700">
                No documents found
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Try a different search or status filter.
              </p>
            </div>
          ) : null}

          {filteredDocuments.map((doc) => {
            const isSelected = doc.id === selectedDocumentId;
            const isActive = isActiveStatus(doc.status);

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDocument(doc.id)}
                title={doc.name}
                className={`w-full rounded-[14px] border text-left transition ${
                  isSelected
                    ? collapsed
                      ? "border-emerald-400 bg-emerald-100/40 shadow-[0_4px_12px_rgba(16,185,129,0.1)]"
                      : "border-emerald-200 bg-emerald-50/50 shadow-[0_8px_18px_rgba(16,185,129,0.06)]"
                    : collapsed
                      ? "border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-100/50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div
                  className={`flex ${
                    collapsed
                      ? "items-center justify-center px-2 py-2"
                      : "items-start gap-2 px-2.5 py-2"
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${doc.accent}`}
                    >
                      <FileText className="h-4 w-4" />
                    </div>

                    <div
                      className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${getStatusDotColor(
                        doc.status,
                      )} ${isActive ? "animate-pulse" : ""}`}
                      title={getStatusLabel(doc.status)}
                      aria-label={`Status: ${getStatusLabel(doc.status)}`}
                    />
                  </div>

                  {!collapsed ? (
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[12.5px] font-semibold tracking-[-0.02em] text-slate-900"
                        title={doc.name}
                      >
                        {doc.name}
                      </p>

                      {!isActive ? (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {doc.subtitle}
                        </p>
                      ) : null}

                      <div className={isActive ? "mt-1" : "mt-1.5"}>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[9px] font-semibold tracking-[0.05em] ${getStatusClasses(
                            doc.status,
                          )}`}
                        >
                          <span className="inline-flex items-center gap-1.5 leading-none">
                            {isActive ? (
                              <>
                                <span>{getStatusLabel(doc.status)}</span>
                                <ActiveStatusDots />
                              </>
                            ) : (
                              getStatusLabel(doc.status)
                            )}
                          </span>
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!collapsed ? (
        <p className="shrink-0 pt-2 text-[12px] text-slate-500">
          Showing {filteredDocuments.length} of {documents.length} documents
        </p>
      ) : null}
    </aside>
  );
}