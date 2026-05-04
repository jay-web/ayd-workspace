import json
import logging
import os
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import unquote_plus
from datetime import datetime, timezone

import boto3

from app.s3_reader import read_s3_object
from app.pdf_extractor import extract_pdf_pages
from app.chunker import chunk_document
from app.repositories.documents_dynamo import (
    find_document_by_storage_key,
    update_document_status,
)

logger = logging.getLogger()
logger.setLevel(os.getenv("LOG_LEVEL", "INFO"))

BEDROCK_REGION = os.getenv("BEDROCK_REGION", "ap-south-1")
EMBEDDING_MODEL_ID = os.getenv("EMBEDDING_MODEL_ID", "amazon.titan-embed-text-v2:0")

VECTOR_BUCKET_NAME = os.getenv("VECTOR_BUCKET_NAME")
VECTOR_INDEX_NAME = os.getenv("VECTOR_INDEX_NAME")

EMBEDDING_DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSIONS", "1024"))
VECTOR_BATCH_SIZE = int(os.getenv("VECTOR_BATCH_SIZE", "100"))

DOCUMENT_CHUNKS_TABLE = os.environ["DOCUMENT_CHUNKS_TABLE"]

bedrock_runtime = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)
s3vectors = boto3.client("s3vectors")

dynamodb = boto3.resource("dynamodb")
document_chunks_table = dynamodb.Table(DOCUMENT_CHUNKS_TABLE)


def log_info(message: str, **kwargs: Any) -> None:
    logger.info(json.dumps({"message": message, **kwargs}, default=str))


def log_error(message: str, **kwargs: Any) -> None:
    logger.error(json.dumps({"message": message, **kwargs}, default=str))


def parse_sqs_body(body: str) -> Tuple[Optional[str], str, Dict[str, Any]]:
    """
    Supports:
    1) Real S3 -> SQS notification payload
    2) Manual test payload like: { "storageKey": "...", "bucket": "..." }
    """
    payload = json.loads(body)

    # Case 1: direct S3 event notification inside SQS body
    if isinstance(payload, dict) and "Records" in payload and payload["Records"]:
        first = payload["Records"][0]

        if first.get("eventSource") == "aws:s3":
            bucket_name = first["s3"]["bucket"]["name"]
            raw_key = first["s3"]["object"]["key"]
            storage_key = unquote_plus(raw_key)
            return bucket_name, storage_key, payload

    # Case 2: manual/custom payload
    if isinstance(payload, dict) and payload.get("storageKey"):
        bucket_name = payload.get("bucket") or payload.get("bucket_name")
        return bucket_name, payload["storageKey"], payload

    raise ValueError("Unsupported SQS message body format")


def get_chunk_value(chunk: Any, key: str, default: Any = None) -> Any:
    """
    Supports chunk as dict or object.

    This protects us because your chunker may return either:
      { "text": "...", "pageNumber": 1 }
    or:
      Chunk(text="...", page_number=1)
    """
    if isinstance(chunk, dict):
        return chunk.get(key, default)

    return getattr(chunk, key, default)


def get_chunk_text(chunk: Any) -> str:
    text = (
        get_chunk_value(chunk, "text")
        or get_chunk_value(chunk, "content")
        or get_chunk_value(chunk, "chunk_text")
        or ""
    )

    return str(text).strip()


def get_chunk_page_number(chunk: Any) -> Optional[int]:
    page_number = (
        get_chunk_value(chunk, "pageNumber")
        or get_chunk_value(chunk, "page_number")
        or get_chunk_value(chunk, "page")
    )

    if page_number is None:
        return None

    try:
        return int(page_number)
    except Exception:
        return None


def create_embedding(text: str) -> List[float]:
    """
    Creates a 1024-dimension float embedding using Amazon Titan Text Embeddings V2.
    This must match the S3 Vector index dimension.
    """
    if not text:
        raise ValueError("Cannot create embedding for empty text")

    body = {
        "inputText": text,
        "dimensions": EMBEDDING_DIMENSIONS,
        "normalize": True,
        "embeddingTypes": ["float"],
    }

    response = bedrock_runtime.invoke_model(
        modelId=EMBEDDING_MODEL_ID,
        body=json.dumps(body),
        accept="application/json",
        contentType="application/json",
    )

    response_body = json.loads(response["body"].read())

    embedding = response_body.get("embedding")

    if not embedding:
        embedding = response_body.get("embeddingsByType", {}).get("float")

    if not embedding:
        raise ValueError("Bedrock embedding response did not contain a float embedding")

    return [float(value) for value in embedding]


def build_vector_key(workspace_id: str, document_id: str, chunk_index: int) -> str:
    return f"{workspace_id}/{document_id}/chunk-{chunk_index:04d}"


def batch_items(items: List[Dict[str, Any]], batch_size: int) -> List[List[Dict[str, Any]]]:
    return [items[i : i + batch_size] for i in range(0, len(items), batch_size)]


def put_chunk_vectors(
    workspace_id: str,
    document_id: str,
    storage_key: str,
    chunks: List[Any],
) -> None:
    if not VECTOR_BUCKET_NAME:
        raise ValueError("VECTOR_BUCKET_NAME environment variable is missing")

    if not VECTOR_INDEX_NAME:
        raise ValueError("VECTOR_INDEX_NAME environment variable is missing")

    vectors: List[Dict[str, Any]] = []

    for chunk_index, chunk in enumerate(chunks):
        text = get_chunk_text(chunk)

        if not text:
            log_info(
                "document.vector.chunk.skipped_empty",
                workspaceId=workspace_id,
                documentId=document_id,
                chunkIndex=chunk_index,
            )
            continue

        page_number = get_chunk_page_number(chunk)
        vector_key = build_vector_key(workspace_id, document_id, chunk_index)

        embedding = create_embedding(text)
        
        # Extract page range and preview
        chunk_metadata = get_chunk_value(chunk, "metadata", {})
        page_start = chunk_metadata.get("page_start", page_number)
        page_end = chunk_metadata.get("page_end", page_number)
        source_preview = generate_source_preview(text)

        metadata: Dict[str, Any] = {
            "workspaceId": workspace_id,
            "documentId": document_id,
            "chunkIndex": chunk_index,
            "storageKey": storage_key,
        }

        if page_number is not None:
            metadata["pageNumber"] = page_number
        if page_start is not None:
            metadata["pageStart"] = page_start
        if page_end is not None:
            metadata["pageEnd"] = page_end
        if source_preview:
            metadata["sourcePreview"] = source_preview

        vectors.append(
            {
                "key": vector_key,
                "data": {
                    "float32": embedding,
                },
                "metadata": metadata,
            }
        )

        log_info(
            "document.vector.chunk.embedded",
            workspaceId=workspace_id,
            documentId=document_id,
            chunkIndex=chunk_index,
            vectorKey=vector_key,
            dimension=len(embedding),
        )

    if not vectors:
        raise ValueError("No vectors created from chunks")

    for batch in batch_items(vectors, VECTOR_BATCH_SIZE):
        s3vectors.put_vectors(
            vectorBucketName=VECTOR_BUCKET_NAME,
            indexName=VECTOR_INDEX_NAME,
            vectors=batch,
        )

        log_info(
            "document.vector.batch.put",
            workspaceId=workspace_id,
            documentId=document_id,
            batchSize=len(batch),
            vectorBucketName=VECTOR_BUCKET_NAME,
            vectorIndexName=VECTOR_INDEX_NAME,
        )

    log_info(
        "document.vector.put.done",
        workspaceId=workspace_id,
        documentId=document_id,
        vectorCount=len(vectors),
    )

def generate_source_preview(text: str, max_length: int = 200) -> str:
    """
    Generate a truncated preview of the chunk text for display.
    Keeps it under 200 characters and removes excessive whitespace.
    """
    if not text:
        return ""
    
    # Replace multiple newlines/spaces with single space
    cleaned = " ".join(text.split())
    
    # Truncate to max_length
    if len(cleaned) <= max_length:
        return cleaned
    
    return cleaned[:max_length].rstrip() + "..."


def save_document_chunks(
    *,
    workspace_id: str,
    document_id: str,
    chunks: List[Any],
):
    now = datetime.now(timezone.utc).isoformat()

    with document_chunks_table.batch_writer() as batch:
        for index, chunk in enumerate(chunks):
            chunk_id = f"chunk-{index:04d}"
            vector_key = f"{workspace_id}/{document_id}/{chunk_id}"

            # Extract chunk content and metadata
            content = get_chunk_text(chunk)
            page_number = get_chunk_page_number(chunk)
            metadata = get_chunk_value(chunk, "metadata", {})
            
            # Fallback page range if not in metadata
            page_start = metadata.get("page_start", page_number) or page_number
            page_end = metadata.get("page_end", page_number) or page_number
            
            # Generate source preview
            source_preview = generate_source_preview(content)

            batch.put_item(
                Item={
                    "documentId": document_id,
                    "chunkId": chunk_id,
                    "workspaceId": workspace_id,
                    "text": content,
                    "pageNumber": page_number or 1,
                    "pageStart": page_start or 1,
                    "pageEnd": page_end or 1,
                    "sourcePreview": source_preview,
                    "vectorKey": vector_key,
                    "createdAt": now,
                }
            )


def process_document_message(
    bucket_name: Optional[str],
    storage_key: str,
    payload: Dict[str, Any],
) -> None:
    log_info(
        "document.process.start",
        bucketName=bucket_name,
        storageKey=storage_key,
    )

    if not bucket_name:
        raise ValueError("bucket_name is missing in message payload")

    document = find_document_by_storage_key(storage_key)

    if not document:
        raise ValueError(f"Document not found for storage_key={storage_key}")

    workspace_id = str(document["workspaceId"])
    document_id = str(document["documentId"])

    log_info(
        "document.process.metadata.found",
        workspaceId=workspace_id,
        documentId=document_id,
        status=document.get("status"),
    )

    update_document_status(
        workspace_id=workspace_id,
        document_id=document_id,
        status="PROCESSING",
    )

    log_info(
        "document.process.status.updated",
        workspaceId=workspace_id,
        documentId=document_id,
        status="PROCESSING",
    )

    file_bytes = read_s3_object(bucket_name, storage_key)

    log_info(
        "document.process.s3_downloaded",
        bucketName=bucket_name,
        storageKey=storage_key,
        fileSizeBytes=len(file_bytes),
    )

    log_info("document.process.extract.start")
    pages = extract_pdf_pages(file_bytes)

  

    log_info(
        "document.process.extract.done",
        pageCount=len(pages),
    )

    chunks = chunk_document(pages)

    log_info(
        "document.process.chunk.done",
        chunkCount=len(chunks),
    )

    if not chunks:
        raise ValueError(f"No chunks generated for storage_key={storage_key}")
    
    save_document_chunks(
        workspace_id=workspace_id,
        document_id=document_id,
        chunks=chunks,
        )

    put_chunk_vectors(
        workspace_id=workspace_id,
        document_id=document_id,
        storage_key=storage_key,
        chunks=chunks,
    )

    update_document_status(
        workspace_id=workspace_id,
        document_id=document_id,
        status="READY",
    )

    log_info(
        "document.process.status.updated",
        workspaceId=workspace_id,
        documentId=document_id,
        status="READY",
    )


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    records = event.get("Records", [])

    log_info(
        "worker.batch.received",
        recordCount=len(records),
        requestId=getattr(context, "aws_request_id", None),
    )

    batch_item_failures = []

    for record in records:
        message_id = record.get("messageId", "unknown")
        receipt_handle = record.get("receiptHandle")

        try:
            body = record["body"]

            log_info(
                "worker.record.received",
                messageId=message_id,
                hasReceiptHandle=bool(receipt_handle),
            )

            bucket_name, storage_key, parsed_payload = parse_sqs_body(body)

            log_info(
                "worker.record.parsed",
                messageId=message_id,
                bucketName=bucket_name,
                storageKey=storage_key,
            )

            process_document_message(
                bucket_name=bucket_name,
                storage_key=storage_key,
                payload=parsed_payload,
            )

            log_info(
                "worker.record.success",
                messageId=message_id,
                storageKey=storage_key,
            )

        except Exception as exc:
            log_error(
                "worker.record.failed",
                messageId=message_id,
                error=str(exc),
            )

            batch_item_failures.append({"itemIdentifier": message_id})

    result = {"batchItemFailures": batch_item_failures}

    log_info(
        "worker.batch.completed",
        failedCount=len(batch_item_failures),
        totalCount=len(records),
        result=result,
    )

    return result


