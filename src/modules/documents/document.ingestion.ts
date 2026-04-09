import { randomUUID } from "crypto";
import {
  getDocumentByStorageKey,
  markDocumentFailed,
  markDocumentProcessing,
  markDocumentReady,
} from "./document.repo";
import { replaceChunksForDocument } from "./documentChunks.repo";
import type { CreateDocumentChunkInput } from "./document.types";

export type IngestionChunkInput = {
  content: string;
  embedding: number[];
  pageNumber?: number | null;
  tokenCount?: number | null;
  metadata?: Record<string, unknown>;
};

export async function ingestDocumentChunks(params: {
  storageKey: string;
  chunks: IngestionChunkInput[];
}) {
  const document = await getDocumentByStorageKey(params.storageKey);

  if (!document) {
    throw new Error(`Document not found for storage key: ${params.storageKey}`);
  }

  try {
    await markDocumentProcessing(document.documentId);

    const chunkRows: CreateDocumentChunkInput[] = params.chunks.map(
      (chunk, index) => ({
        chunkId: randomUUID(),
        documentId: document.documentId,
        workspaceId: document.workspaceId,
        chunkIndex: index,
        content: chunk.content,
        embedding: chunk.embedding,
        pageNumber: chunk.pageNumber ?? null,
        tokenCount: chunk.tokenCount ?? null,
        metadata: chunk.metadata ?? {},
      })
    );

    await replaceChunksForDocument(document.documentId, chunkRows);

    return await markDocumentReady(document.documentId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown ingestion error";

    await markDocumentFailed(document.documentId, message);
    throw error;
  }
}