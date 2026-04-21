import json
import os
from typing import List

import boto3


BEDROCK_REGION = os.getenv("BEDROCK_REGION", "ap-south-1")
EMBEDDING_MODEL_ID = os.getenv(
    "EMBEDDING_MODEL_ID",
    "amazon.titan-embed-text-v2:0",
)

bedrock_runtime = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)


def generate_embedding(text: str) -> List[float]:
    if not text or not text.strip():
        raise ValueError("Cannot generate embedding for empty text.")

    body = {
        "inputText": text,
    }

    response = bedrock_runtime.invoke_model(
        modelId=EMBEDDING_MODEL_ID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json",
    )

    response_body = json.loads(response["body"].read())
    embedding = response_body.get("embedding")

    if not embedding:
        raise ValueError("Embedding model returned no embedding.")

    return embedding