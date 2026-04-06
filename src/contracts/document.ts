export type DocumentStatus = "UPLOADING" | "UPLOADED" | "PROCESSING" | "READY" | "FAILED";

export interface Document {
  documentId: string;
  workspaceId: string;
  name: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedBy: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

// 1. Create Document
export interface CreateDocumentRequest {
  workspaceId: string;
  name: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface CreateDocumentResponse {
  document: Document;
}

// 2. List Documents (per workspace)
export interface DocumentListItem {
  documentId: string;
  name: string;
  status: DocumentStatus;
  createdAt: string;
}

export interface ListDocumentsResponse {
  items: DocumentListItem[];
}

export interface GetDocumentResponse {
  document: Document;
}