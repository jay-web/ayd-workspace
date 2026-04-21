from typing import Any, Dict, List

import psycopg
from psycopg.rows import dict_row


def search_similar_chunks(
    *,
    db_url: str,
    workspace_id: str,
    document_id: str,
    query_embedding: str,
    limit: int = 5,
) -> List[Dict[str, Any]]:
    query = """
        SELECT
            chunk_id,
            document_id,
            workspace_id,
            chunk_index,
            content,
            page_start,
            page_end,
            token_count,
            metadata,
            1 - (embedding <=> %s::vector) AS similarity
        FROM document_chunks
        WHERE workspace_id = %s AND document_id = %s
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """

    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(
                query,
                (query_embedding, workspace_id, document_id, query_embedding, limit),
            )
            return cur.fetchall()