import type { SQSEvent, SQSRecord } from "aws-lambda";
import { readS3ObjectBuffer } from "@/lib/aws/s3";
import { ingestDocumentChunks } from "./document.ingestion";
import {
  chunkTextByWords,
  extractTextFromDocument,
} from "./document.parser";

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
  const bucketName = getRequiredEnv("DOCUMENTS_BUCKET_NAME");

  for (const record of event.Records) {
    const storageKey = getStorageKeyFromSqsRecord(record);

    const s3File = await readS3ObjectBuffer(bucketName, storageKey);

    console.log("S3 file downloaded successfully", {
      storageKey,
      contentType: s3File.contentType,
      contentLength: s3File.contentLength,
      eTag: s3File.eTag,
    });

    const extractedText = await extractTextFromDocument({
      buffer: s3File.buffer,
      contentType: s3File.contentType,
      storageKey,
    });

    const contentChunks = chunkTextByWords(extractedText, {
      chunkWordCount: 220,
      overlapWordCount: 40,
    });

    if (!contentChunks.length) {
      throw new Error("No chunks generated from extracted document text");
    }

    console.log("Document text extracted successfully", {
      storageKey,
      extractedTextLength: extractedText.length,
      chunkCount: contentChunks.length,
    });

    await ingestDocumentChunks({
      storageKey,
      chunks: contentChunks.map((content, index) => ({
        content,
        embedding: createMockEmbedding(),
        pageNumber: null,
        tokenCount: content.split(/\s+/).filter(Boolean).length,
        metadata: {
          source: "pdf-text-worker-step-2",
          chunkIndex: index,
          storageKey,
          contentType: s3File.contentType,
          contentLength: s3File.contentLength,
        },
      })),
    });
  }
}