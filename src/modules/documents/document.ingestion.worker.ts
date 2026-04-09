import type { SQSEvent, SQSRecord } from "aws-lambda";
import { ingestDocumentChunks } from "./document.ingestion";

type S3EventRecord = {
  s3: {
    object: {
      key: string;
    };
  };
};

type S3EventMessage = {
  Records: S3EventRecord[];
};

function getStorageKeyFromSqsRecord(record: SQSRecord): string {
  const message = JSON.parse(record.body) as S3EventMessage;

  const storageKey = message.Records?.[0]?.s3?.object?.key;

  if (!storageKey) {
    throw new Error("Missing storage key in SQS message");
  }

  return decodeURIComponent(storageKey.replace(/\+/g, " "));
}

function createMockEmbedding(dim = 1024): number[] {
  return Array.from({ length: dim }, () => 0.001);
}

export async function handleDocumentIngestionEvent(event: SQSEvent) {
  for (const record of event.Records) {
    const storageKey = getStorageKeyFromSqsRecord(record);

    await ingestDocumentChunks({
      storageKey,
      chunks: [
        {
          content: "This is mock chunk 1 for ingestion pipeline testing.",
          embedding: createMockEmbedding(),
          pageNumber: 1,
          tokenCount: 10,
          metadata: {
            source: "mock-worker",
            chunkLabel: "chunk-1",
          },
        },
        {
          content: "This is mock chunk 2 for ingestion pipeline testing.",
          embedding: createMockEmbedding(),
          pageNumber: 1,
          tokenCount: 10,
          metadata: {
            source: "mock-worker",
            chunkLabel: "chunk-2",
          },
        },
      ],
    });
  }
}