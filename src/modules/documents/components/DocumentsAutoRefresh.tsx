"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DocumentStatus } from "@/contracts/document";

type DocumentListItem = {
  status: DocumentStatus;
};

const POLLING_STATUSES: DocumentStatus[] = [
  "UPLOADING",
  "UPLOADED",
  "PROCESSING",
];

export default function DocumentsAutoRefresh({
  documents,
}: {
  documents: DocumentListItem[];
}) {
  const router = useRouter();

  useEffect(() => {
    const hasPendingDocuments = documents.some((document) =>
      POLLING_STATUSES.includes(document.status)
    );

    if (!hasPendingDocuments) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => clearInterval(interval);
  }, [documents, router]);

  return null;
}