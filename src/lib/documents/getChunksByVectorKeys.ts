import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import type { QueryOutputVector } from "@aws-sdk/client-s3vectors";

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION,
  })
);

function parseVectorKey(vectorKey: string) {
  const parts = vectorKey.split("/");

  if (parts.length !== 3) {
    throw new Error(`Invalid vector key format: ${vectorKey}`);
  }

  const [workspaceId, documentId, chunkId] = parts;

  return {
    workspaceId,
    documentId,
    chunkId,
  };
}

export async function getChunksByVectorKeys(vectorResults: QueryOutputVector[]) {
  const validResults = vectorResults.filter(
    (result): result is QueryOutputVector & { key: string } =>
      typeof result.key === "string"
  );

  if (validResults.length === 0) {
    return [];
  }

  const keys = validResults.map((result) => {
    const parsed = parseVectorKey(result.key);

    return {
      documentId: parsed.documentId,
      chunkId: parsed.chunkId,
    };
  });

  const command = new BatchGetCommand({
    RequestItems: {
      [process.env.DOCUMENT_CHUNKS_TABLE!]: {
        Keys: keys,
      },
    },
  });

  const response = await dynamo.send(command);

  const items =
    response.Responses?.[process.env.DOCUMENT_CHUNKS_TABLE!] ?? [];

  return validResults.map((result) => {
    const parsed = parseVectorKey(result.key);

    const chunk = items.find(
      (item) =>
        item.documentId === parsed.documentId &&
        item.chunkId === parsed.chunkId
    );

    return {
      vectorKey: result.key,
      distance: result.distance,
      metadata: result.metadata,
      chunk,
    };
  });
}