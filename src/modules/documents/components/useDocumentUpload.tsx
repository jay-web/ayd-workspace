"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

type UseDocumentUploadOptions = {
  workspaceId: string;
  onUploaded?: (documentId: string) => void | Promise<void>;
};

export function useDocumentUpload({
  workspaceId,
  onUploaded,
}: UseDocumentUploadOptions) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function uploadFileToS3(uploadUrl: string, file: File) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream",
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

  async function uploadDocument(file: File | null) {
    if (!file || uploading) return;

    setSelectedFile(file);
    setUploading(true);

    try {
      const createRes = await fetch(
        `/api/v1/workspaces/${workspaceId}/documents`,
        {
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
        },
      );

      if (!createRes.ok) {
        throw new Error("Failed to create document");
      }

      const data = await createRes.json();
      const documentId = data.document.documentId;

      setUploadProgress(0);
      await uploadFileToS3(data.uploadUrl, file);
      setUploadProgress(100);

      const completeUploadRes = await fetch(
        `/api/v1/documents/${documentId}/complete-upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspaceId,
          }),
        },
      );

      if (!completeUploadRes.ok) {
        throw new Error("Failed to complete document upload");
      }

      toast.success("Document uploaded successfully");

      setSelectedFile(null);
      setUploadProgress(0);
      resetInput();

      await onUploaded?.(documentId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      toast.error(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    await uploadDocument(file);
  }

  return {
    inputRef,
    selectedFile,
    uploading,
    uploadProgress,
    openFilePicker,
    uploadDocument,
    handleFileChange,
  };
}