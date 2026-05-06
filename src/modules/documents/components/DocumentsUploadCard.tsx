"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDocumentUpload } from "./useDocumentUpload";

type DocumentsUploadCardProps = {
  workspaceId: string;
};

export default function DocumentsUploadCard({
  workspaceId,
}: DocumentsUploadCardProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const {
    inputRef,
    selectedFile,
    uploading,
    uploadProgress,
    openFilePicker,
    uploadDocument,
    handleFileChange,
  } = useDocumentUpload({
    workspaceId,
    onUploaded: () => {
      router.refresh();
    },
  });

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    if (!uploading) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);

    if (uploading) return;

    const file = e.dataTransfer.files?.[0] ?? null;
    await uploadDocument(file);
  }

  return (
    <div className="rounded-2xl sm:rounded-[32px] border border-gray-200 bg-white p-4 sm:p-7 shadow-xl">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <div className="mb-4 sm:mb-5">
        <h2 className="text-xl font-semibold text-gray-900">
          Upload Documents
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Add files to this workspace to enable search and chat.
        </p>
      </div>

      <div
        onClick={openFilePicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group cursor-pointer rounded-xl sm:rounded-[28px] border border-dashed px-4 sm:px-6 py-8 sm:py-12 text-center transition ${
          isDragging
            ? "border-gray-500 bg-gray-100"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
        }`}
      >
        <p className="text-sm font-medium text-gray-700">
          {isDragging ? "Drop file here" : "Drag and drop files here"}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          PDF, DOCX, TXT • Max 10MB
        </p>

        <button
          type="button"
          disabled={uploading}
          className="mt-4 w-full sm:inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Choose File"}
        </button>
      </div>

      {selectedFile ? (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>

            {uploading ? (
              <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gray-900 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            ) : null}
          </div>

          <span className="text-xs text-gray-400">
            {uploading ? `${uploadProgress}%` : "Ready"}
          </span>
        </div>
      ) : null}
    </div>
  );
}