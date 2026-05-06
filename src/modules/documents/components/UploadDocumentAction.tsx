"use client";

import { useRouter } from "next/navigation";
import { useDocumentUpload } from "./useDocumentUpload";

type UploadDocumentActionProps = {
  workspaceId: string;
};

export function UploadDocumentAction({ workspaceId }: UploadDocumentActionProps) {
  const router = useRouter();

  const {
    inputRef,
    uploading,
    uploadProgress,
    openFilePicker,
    handleFileChange,
  } = useDocumentUpload({
    workspaceId,
    onUploaded: () => {
      router.refresh();
    },
  });

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <button
        type="button"
        onClick={openFilePicker}
        disabled={uploading}
        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 text-left shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm text-[#0E5B48] shadow-sm transition group-hover:bg-[#0E5B48] group-hover:text-white">
            ↑
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-950">
              {uploading ? `Uploading ${uploadProgress}%` : "Upload Document"}
            </p>
            <p className="truncate text-xs text-gray-500">
              Add new knowledge files
            </p>
          </div>
        </div>

        <span className="shrink-0 text-sm font-semibold text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#0E5B48]">
          {uploading ? `${uploadProgress}%` : "→"}
        </span>
      </button>
    </>
  );
}