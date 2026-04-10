import type { SQSEvent, SQSRecord } from "aws-lambda";
import { readS3ObjectBuffer } from "@/lib/aws/s3";
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

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function createMockEmbedding(dim = 1024): number[] {
  return Array.from({ length: dim }, () => 0.001);
}

export async function handleDocumentIngestionEvent(event: SQSEvent) {
  const bucketName = getRequiredEnv("S3_BUCKET_NAME");

  for (const record of event.Records) {
    const storageKey = getStorageKeyFromSqsRecord(record);

    const s3File = await readS3ObjectBuffer(bucketName, storageKey);

    console.log("S3 file downloaded successfully", {
      storageKey,
      contentType: s3File.contentType,
      contentLength: s3File.contentLength,
      eTag: s3File.eTag,
    });

    const placeholderChunkText = `S3 download successful. contentType=${
      s3File.contentType ?? "unknown"
    }, size=${s3File.contentLength} bytes`;

    await ingestDocumentChunks({
      storageKey,
      chunks: [
        {
          content: placeholderChunkText,
          embedding: createMockEmbedding(),
          pageNumber: 1,
          tokenCount: 10,
          metadata: {
            source: "s3-worker-step-1",
            chunkLabel: "chunk-1",
            storageKey,
            contentType: s3File.contentType,
            contentLength: s3File.contentLength,
          },
        },
        {
          content: "Second mock chunk after successful S3 download.",
          embedding: createMockEmbedding(),
          pageNumber: 1,
          tokenCount: 10,
          metadata: {
            source: "s3-worker-step-1",
            chunkLabel: "chunk-2",
          },
        },
      ],
    });
  }
}