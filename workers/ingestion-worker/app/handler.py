import json
import logging
import os
from typing import Any, Dict, Optional, Tuple
from urllib.parse import unquote_plus
from app.s3_reader import read_s3_object
from app.pdf_extractor import extract_pdf_pages
from app.chunker import chunk_document
from app.services.embeddings import generate_embedding
from app.repositories.document_chunks import insert_document_chunks
from app.repositories.documents import find_document_by_storage_key
logger = logging.getLogger()
logger.setLevel(os.getenv("LOG_LEVEL", "INFO"))


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
        return payload.get("bucket_name"), payload["storageKey"], payload

    raise ValueError("Unsupported SQS message body format")


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

    first_chunk = chunks[0]

    log_info("document.process.embedding.start", chunkIndex=first_chunk["chunk_index"])
    embedding = generate_embedding(first_chunk["content"])
    log_info("document.process.embedding.done", embeddingLength=len(embedding))

    first_chunk["embedding"] = embedding

    if "page_start" not in first_chunk:
        page_number = first_chunk.get("page_number")
        first_chunk["page_start"] = page_number
        first_chunk["page_end"] = page_number

    document = find_document_by_storage_key(
                db_url=os.environ["DATABASE_URL"],
                storage_key=storage_key,
                )

    if not document:
        raise ValueError(f"Document not found for storage_key={storage_key}")

    log_info("document.process.db_insert.start", chunkIndex=first_chunk["chunk_index"])
    

    insert_document_chunks(
        db_url=os.environ["DATABASE_URL"],
        document_id=str(document["document_id"]),
        workspace_id=str(document["workspace_id"]),
        chunks=[first_chunk],
    )

    log_info("document.process.db_insert.done", chunkIndex=first_chunk["chunk_index"])

    print("Inserted chunk index:", first_chunk["chunk_index"])
    print("Embedding length:", len(embedding))



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