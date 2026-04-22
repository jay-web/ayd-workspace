"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type DocumentListItem = {
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
};

export default function DocumentsAutoRefresh({
  documents,
}: {
  documents: DocumentListItem[];
}) {
  const router = useRouter();

  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.status === "UPLOADING" || d.status === "PROCESSING"
    );

    if (!hasProcessing) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 4000); // 4 sec

    return () => clearInterval(interval);
  }, [documents, router]);

  return null;
}