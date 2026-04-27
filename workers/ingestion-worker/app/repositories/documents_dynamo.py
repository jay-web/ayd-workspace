import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource(
    "dynamodb",
    region_name=os.getenv("AWS_REGION") or os.getenv("BEDROCK_REGION") or "ap-south-1",
)

documents_table = dynamodb.Table(os.environ["DOCUMENTS_TABLE_NAME"])

DOCUMENT_STORAGE_KEY_INDEX_NAME = os.getenv(
    "DOCUMENT_STORAGE_KEY_INDEX_NAME",
    "DocumentStorageKeyIndex",
)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def find_document_by_storage_key(storage_key: str) -> Optional[Dict[str, Any]]:
    result = documents_table.query(
        IndexName=DOCUMENT_STORAGE_KEY_INDEX_NAME,
        KeyConditionExpression=Key("storageKey").eq(storage_key),
        Limit=1,
    )

    items = result.get("Items", [])

    if not items:
        return None

    return items[0]


def update_document_status(
    workspace_id: str,
    document_id: str,
    status: str,
    error_message: Optional[str] = None,
) -> Dict[str, Any]:
    now = utc_now_iso()
    ingested_at = now if status == "READY" else None

    result = documents_table.update_item(
        Key={
            "workspaceId": workspace_id,
            "documentId": document_id,
        },
        UpdateExpression="""
            SET #status = :status,
                errorMessage = :errorMessage,
                ingestedAt = :ingestedAt,
                updatedAt = :updatedAt
        """,
        ExpressionAttributeNames={
            "#status": "status",
        },
        ExpressionAttributeValues={
            ":status": status,
            ":errorMessage": error_message,
            ":ingestedAt": ingested_at,
            ":updatedAt": now,
        },
        ReturnValues="ALL_NEW",
    )

    return result["Attributes"]