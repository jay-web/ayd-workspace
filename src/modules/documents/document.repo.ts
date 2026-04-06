import type { Document, DocumentListItem } from "@/contracts/document";
import { db } from "@/lib/db/postgres";
import type {
  CreateDocumentInput,
  DocumentListRow,
  DocumentRow,
  DocumentStats,
  DocumentStatsRow,
} from "./document.types";

function mapDocumentRow(row: DocumentRow): Document {
  return {
    documentId: row.document_id,
    workspaceId: row.workspace_id,
    name: row.name,
    originalFileName: row.original_file_name,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    storageKey: row.storage_key,
    uploadedBy: row.uploaded_by,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function mapDocumentListRow(row: DocumentListRow): DocumentListItem {
  return {
    documentId: row.document_id,
    name: row.name,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapDocumentStatsRow(row: DocumentStatsRow): DocumentStats {
  return {
    totalDocuments: Number(row.total_documents),
    uploadedDocuments: Number(row.uploaded_documents),
    processingDocuments: Number(row.processing_documents),
    readyDocuments: Number(row.ready_documents),
    failedDocuments: Number(row.failed_documents),
  };
}

export async function createDocument(
  input: CreateDocumentInput
): Promise<Document> {
  const status = input.status ?? "UPLOADING";

  const result = await db.query<DocumentRow>(
    `
      INSERT INTO documents (
        document_id,
        workspace_id,
        name,
        original_file_name,
        mime_type,
        size_bytes,
        storage_key,
        uploaded_by,
        status,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      RETURNING
        document_id,
        workspace_id,
        name,
        original_file_name,
        mime_type,
        size_bytes,
        storage_key,
        uploaded_by,
        status,
        created_at,
        updated_at
    `,
    [
      input.documentId,
      input.workspaceId,
      input.name,
      input.originalFileName,
      input.mimeType,
      input.sizeBytes,
      input.storageKey,
      input.uploadedBy,
      status,
    ]
  );

  return mapDocumentRow(result.rows[0]);
}

export async function listDocumentsByWorkspace(
  workspaceId: string
): Promise<DocumentListItem[]> {
  const result = await db.query<DocumentListRow>(
    `
      SELECT
        document_id,
        name,
        status,
        created_at
      FROM documents
      WHERE workspace_id = $1
      ORDER BY created_at DESC
    `,
    [workspaceId]
  );

  return result.rows.map(mapDocumentListRow);
}

export async function getDocumentById(
  documentId: string
): Promise<Document | null> {
  const result = await db.query<DocumentRow>(
    `
      SELECT
        document_id,
        workspace_id,
        name,
        original_file_name,
        mime_type,
        size_bytes,
        storage_key,
        uploaded_by,
        status,
        created_at,
        updated_at
      FROM documents
      WHERE document_id = $1
      LIMIT 1
    `,
    [documentId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapDocumentRow(result.rows[0]);
}

export async function getDocumentStatsByWorkspace(
  workspaceId: string
): Promise<DocumentStats> {
  const result = await db.query<DocumentStatsRow>(
    `
      SELECT
        COUNT(*) AS total_documents,
        COUNT(*) FILTER (WHERE status = 'UPLOADED') AS uploaded_documents,
        COUNT(*) FILTER (WHERE status = 'PROCESSING') AS processing_documents,
        COUNT(*) FILTER (WHERE status = 'READY') AS ready_documents,
        COUNT(*) FILTER (WHERE status = 'FAILED') AS failed_documents
      FROM documents
      WHERE workspace_id = $1
    `,
    [workspaceId]
  );

  return mapDocumentStatsRow(result.rows[0]);
}