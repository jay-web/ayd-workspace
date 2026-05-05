"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

type DeleteDialogDocument = {
  documentId: string;
  name: string;
};

type DeleteDocumentsDialogProps = {
  documents: DeleteDialogDocument[];
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteDocumentsDialog({
  documents,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteDocumentsDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (documents.length === 0) return;

    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [documents.length]);

  if (documents.length === 0) {
    return null;
  }

  const isBulkDelete = documents.length > 1;
  const visibleDocuments = documents.slice(0, 3);
  const hiddenCount = documents.length - visibleDocuments.length;

  function handleCancel() {
    if (isDeleting) return;

    setIsVisible(false);

    window.setTimeout(() => {
      onCancel();
    }, 180);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm transition-all duration-200 ease-out ${
        isVisible ? "bg-slate-950/40 opacity-100" : "bg-slate-950/0 opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl transition-all duration-200 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-950">
            {isBulkDelete ? "Delete documents?" : "Delete document?"}
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {isBulkDelete
              ? `This will permanently remove ${documents.length} documents from this workspace.`
              : "This will permanently remove this document from this workspace."}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {isBulkDelete ? "Selected files" : "Selected file"}
          </p>

          <div className="mt-2 space-y-2">
            {visibleDocuments.map((document) => (
              <div
                key={document.documentId}
                className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-left"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[10px] font-bold text-red-600">
                  PDF
                </div>

                <p className="min-w-0 truncate text-sm font-medium text-gray-800">
                  {document.name}
                </p>
              </div>
            ))}

            {hiddenCount > 0 && (
              <p className="px-1 text-xs text-gray-500">
                +{hiddenCount} more document{hiddenCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          This action cannot be undone.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isDeleting}
            className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}