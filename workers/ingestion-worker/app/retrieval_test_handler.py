import json
import logging
import os
from typing import Any, Dict

from app.repositories.documents import find_document_by_storage_key
from app.repositories.retrieval import search_similar_chunks
from app.services.embeddings import generate_embedding

logger = logging.getLogger()
logger.setLevel(os.getenv("LOG_LEVEL", "INFO"))


def log_info(message: str, **kwargs: Any) -> None:
    logger.info(json.dumps({"message": message, **kwargs}, default=str))


def _to_pgvector(vector: list[float]) -> str:
    return "[" + ",".join(str(v) for v in vector) + "]"


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    query_text = event.get("query")
    storage_key = event.get("storageKey")

    if not query_text:
        raise ValueError("query is required")

    if not storage_key:
        raise ValueError("storageKey is required")

    document = find_document_by_storage_key(
        db_url=os.environ["DATABASE_URL"],
        storage_key=storage_key,
    )

    if not document:
        raise ValueError(f"Document not found for storage_key={storage_key}")

    log_info(
        "retrieval.test.start",
        query=query_text,
        storageKey=storage_key,
        workspaceId=str(document["workspace_id"]),
    )

    query_embedding = generate_embedding(query_text)
    query_embedding_str = _to_pgvector(query_embedding)

    results = search_similar_chunks(
        db_url=os.environ["DATABASE_URL"],
        workspace_id=str(document["workspace_id"]),
        document_id=str(document["document_id"]),
        query_embedding=query_embedding_str,
        limit=3,
        )

    log_info(
        "retrieval.test.done",
        resultCount=len(results),
    )

    return {
        "ok": True,
        "query": query_text,
        "storageKey": storage_key,
        "count": len(results),
        "results": [
            {
                "chunk_index": row["chunk_index"],
                "similarity": float(row["similarity"]),
                "page_start": row["page_start"],
                "page_end": row["page_end"],
                "preview": row["content"][:200],
            }
            for row in results
        ],
    }