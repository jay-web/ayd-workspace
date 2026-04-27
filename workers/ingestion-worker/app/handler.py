import json
import logging
import os
from typing import Any, Dict, Optional, Tuple
from urllib.parse import unquote_plus

from app.s3_reader import read_s3_object
from app.pdf_extractor import extract_pdf_pages
from app.chunker import chunk_document
from app.repositories.documents_dynamo import (
    find_document_by_storage_key,
    update_document_status,
)

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
        bucket_name = payload.get("bucket") or payload.get("bucket_name")
        return bucket_name, payload["storageKey"], payload

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

    # Temporary Phase 2 migration behavior:
    # We only prove S3 -> SQS -> Lambda -> DynamoDB status update first.
    # S3 Vectors insertion will be added in the next step.
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

            # Best-effort failure status update.
            # If parsing failed or document lookup failed, we may not know documentId/workspaceId.
            batch_item_failures.append({"itemIdentifier": message_id})

    result = {"batchItemFailures": batch_item_failures}

    log_info(
        "worker.batch.completed",
        failedCount=len(batch_item_failures),
        totalCount=len(records),
        result=result,
    )

    return result