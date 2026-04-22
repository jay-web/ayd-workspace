import { db } from "@/lib/db/postgres";
import type { CreateDocumentChunkInput } from "./document.types";

function toVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}

const INSERT_CHUNK_SQL = `
  INSERT INTO document_chunks (
    chunk_id,
    document_id,
    workspace_id,
    chunk_index,
    content,
    embedding,
    page_number,
    token_count,
    metadata
  )
  VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6::vector,
    $7,
    $8,
    $9::jsonb
  )
`;

export async function deleteChunksByDocumentId(documentId: string): Promise<void> {
  await db.query(
    `
      DELETE FROM document_chunks
      WHERE document_id = $1
    `,
    [documentId]
  );
}

export async function insertChunks(
  chunks: CreateDocumentChunkInput[]
): Promise<void> {
  if (chunks.length === 0) return;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    for (const chunk of chunks) {
      await client.query(INSERT_CHUNK_SQL, [
        chunk.chunkId,
        chunk.documentId,
        chunk.workspaceId,
        chunk.chunkIndex,
        chunk.content,
        toVectorLiteral(chunk.embedding),
        chunk.pageNumber ?? null,
        chunk.tokenCount ?? null,
        JSON.stringify(chunk.metadata ?? {}),
      ]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function replaceChunksForDocument(
  documentId: string,
  chunks: CreateDocumentChunkInput[]
): Promise<void> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        DELETE FROM document_chunks
        WHERE document_id = $1
      `,
      [documentId]
    );

    for (const chunk of chunks) {
      await client.query(INSERT_CHUNK_SQL, [
        chunk.chunkId,
        chunk.documentId,
        chunk.workspaceId,
        chunk.chunkIndex,
        chunk.content,
        toVectorLiteral(chunk.embedding),
        chunk.pageNumber ?? null,
        chunk.tokenCount ?? null,
        JSON.stringify(chunk.metadata ?? {}),
      ]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function searchSimilarChunks({
  workspaceId,
  documentId,
  queryEmbedding,
  limit = 5,
}: {
  workspaceId: string;
  documentId: string;
  queryEmbedding: string;
  limit?: number;
}) {
  const result = await db.query(
    `
    SELECT
      chunk_id AS "chunkId",
      document_id AS "documentId",
      workspace_id AS "workspaceId",
      chunk_index AS "chunkIndex",
      content,
      page_start AS "pageStart",
      page_end AS "pageEnd",
      token_count AS "tokenCount",
      metadata,
      1 - (embedding <=> $1::vector) AS similarity
    FROM document_chunks
    WHERE workspace_id = $2
      AND document_id = $3
    ORDER BY embedding <=> $1::vector
    LIMIT $4
    `,
    [queryEmbedding, workspaceId, documentId, limit]
  );

  return result.rows;
}