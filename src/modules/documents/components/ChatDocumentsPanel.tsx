"use client";

import { FileText, Filter, Search, Upload } from "lucide-react";
import { ChatDocumentView } from "./chat.types";

type ChatDocumentsPanelProps = {
  documents: ChatDocumentView[];
  selectedDocumentId: string;
  onSelectDocument: (id: string) => void;
};

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

export default function ChatDocumentsPanel({
  documents,
  selectedDocumentId,
  onSelectDocument,
}: ChatDocumentsPanelProps) {
  return (
    <aside className="flex w-[264px] shrink-0 flex-col rounded-[20px] border border-slate-200/80 bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900">
          Documents
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[12px] font-medium text-emerald-700 transition hover:bg-emerald-50"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-300"
          />
        </label>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          aria-label="Filter documents"
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {documents.map((doc) => {
          const isSelected = doc.id === selectedDocumentId;

          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelectDocument(doc.id)}
              className={`w-full rounded-[16px] border px-3 py-2.5 text-left transition ${
                isSelected
                  ? "border-emerald-200 bg-emerald-50/50 shadow-[0_8px_22px_rgba(16,185,129,0.07)]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${doc.accent}`}
                >
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-slate-900">
                    {doc.name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-slate-500">{doc.subtitle}</p>
                  <div className="mt-1.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.05em] ${getStatusClasses(
                        doc.status,
                      )}`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="pt-3 text-[12px] text-slate-500">
        Showing {documents.length} of {documents.length} documents
      </p>
    </aside>
  );
}