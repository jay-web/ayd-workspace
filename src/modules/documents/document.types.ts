import { DocumentStatus } from "@/contracts/document";

export type CreateDocumentInput = {
  workspaceId: string;
  name: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  storageKey: string;
  status?: DocumentStatus;
};

export type DocumentRow = {
  document_id: string;
  workspace_id: string;
  name: string;
  original_file_name: string;
  mime_type: string;
  size_bytes: string | number;
  storage_key: string;
  uploaded_by: string;
  status: DocumentStatus;
  created_at: Date | string;
  updated_at: Date | string;
};

export type DocumentListRow = {
  document_id: string;
  name: string;
  status: DocumentStatus;
  created_at: Date | string;
};