import { DocumentStatus } from "@/contracts/document";

export type CreateDocumentInput = {
  documentId: string;
  workspaceId: string;
  name: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedBy: string;
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
  error_message: string | null;
  ingested_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type DocumentListRow = {
  document_id: string;
  name: string;
  status: DocumentStatus;
  created_at: Date | string;
};

export type DocumentStatsRow = {
  total_documents: string | number;
  uploading_documents: string | number;
  processing_documents: string | number;
  ready_documents: string | number;
  failed_documents: string | number;
};

export type DocumentStats = {
  totalDocuments: number;
  uploadingDocuments: number;
  processingDocuments: number;
  readyDocuments: number;
  failedDocuments: number;
};

export type DocumentChunkRow = {
  chunk_id: string;
  document_id: string;
  workspace_id: string;
  chunk_index: number;
  content: string;
  embedding: string | number[];
  page_number: number | null;
  token_count: number | null;
  metadata: Record<string, unknown>;
  created_at: Date | string;
};

export type CreateDocumentChunkInput = {
  chunkId: string;
  documentId: string;
  workspaceId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
  pageNumber?: number | null;
  tokenCount?: number | null;
  metadata?: Record<string, unknown>;
};