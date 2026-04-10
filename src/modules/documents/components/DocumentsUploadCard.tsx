"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type DocumentsUploadCardProps = {
  workspaceId: string;
};

export default function DocumentsUploadCard({
  workspaceId,
}: DocumentsUploadCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleOpenPicker() {
    inputRef.current?.click();
  }

  function uploadFileToS3(uploadUrl: string, file: File) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("PUT", uploadUrl);

      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream"
      );

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;

        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
          return;
        }

        reject(new Error("Failed to upload file to S3"));
      };

      xhr.onerror = () => {
        reject(new Error("Failed to upload file to S3"));
      };

      xhr.send(file);
    });
  }

  async function createDocumentMetadata(file: File) {
    setUploading(true);

    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file.name,
          originalFileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create document");
      }

      const data = await res.json();
      const { uploadUrl } = data;

      setUploadProgress(0);
      await uploadFileToS3(uploadUrl, file);
      setUploadProgress(100);

      await fetch(`/api/v1/documents/${data.document.documentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "PROCESSING",
        }),
      });

      await fetch(`/api/v1/documents/${data.document.documentId}/complete-upload`, {
  method: "POST",
});

      toast.success("Document uploaded successfully");
      setSelectedFile(null);
      setUploadProgress(0);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      toast.error(message);
    } finally {
      setUploading(false);
      setIsDragging(false);
      setUploadProgress(0);
    }
  }

  async function handleSelectedFile(file: File | null) {
    if (!file) return;

    setSelectedFile(file);
    await createDocumentMetadata(file);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    await handleSelectedFile(file);
  }

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
    await handleSelectedFile(file);
  }

  return (
    <div className="rounded-[32px] border border-gray-200 bg-white p-7 shadow-xl">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">
          Upload Documents
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
          Add files to this workspace to enable search and chat.
        </p>
      </div>

      <div
        onClick={handleOpenPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group cursor-pointer rounded-[28px] border border-dashed px-6 py-12 text-center transition ${isDragging
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
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60"
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