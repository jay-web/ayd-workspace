from typing import Any, Dict, Optional

import psycopg
from psycopg.rows import dict_row


def find_document_by_storage_key(
    *,
    db_url: str,
    storage_key: str,
) -> Optional[Dict[str, Any]]:
    query = """
        SELECT document_id, workspace_id, storage_key
        FROM documents
        WHERE storage_key = %s
        LIMIT 1
    """

    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(query, (storage_key,))
            return cur.fetchone()