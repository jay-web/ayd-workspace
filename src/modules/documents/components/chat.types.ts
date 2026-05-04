import { DocumentStatus } from "@/contracts/document";

export type ChatDocument = {
  documentId: string;
  name: string;
  status: DocumentStatus
};

export type ChatCitation = {
  chunkIndex: number;
  pageStart: number | null;
  pageEnd: number | null;
  content: string;
  documentId?: string;
  chunkId?: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
};

export type ChatDocumentView = {
  id: string;
  name: string;
  subtitle: string;
  status: ChatDocument["status"];
  accent: string;
};