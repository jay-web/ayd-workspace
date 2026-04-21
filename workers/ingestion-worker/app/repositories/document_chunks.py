import json
import uuid
from typing import Any, Dict, List

import psycopg


def _to_pgvector(vector: List[float]) -> str:
    return "[" + ",".join(str(value) for value in vector) + "]"


def insert_document_chunks(
    *,
    db_url: str,
    document_id: str,
    workspace_id: str,
    chunks: List[Dict[str, Any]],
) -> None:
    if not chunks:
        return

    rows = []

    for chunk in chunks:
        rows.append(
            (
                str(uuid.uuid4()),
                document_id,
                workspace_id,
                chunk["chunk_index"],
                chunk["content"],
                _to_pgvector(chunk["embedding"]),
                chunk.get("page_start"),
                chunk.get("page_end"),
                chunk.get("token_count"),
                json.dumps(chunk.get("metadata", {})),
            )
        )

    delete_query = """
        DELETE FROM document_chunks
        WHERE document_id = %s
    """

    insert_query = """
        INSERT INTO document_chunks (
            chunk_id,
            document_id,
            workspace_id,
            chunk_index,
            content,
            embedding,
            page_start,
            page_end,
            token_count,
            metadata
        )
        VALUES (
            %s, %s, %s, %s, %s,
            %s::vector,
            %s, %s, %s, %s::jsonb
        )
    """

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(delete_query, (document_id,))
            cur.executemany(insert_query, rows)
        conn.commit()