import { DeleteVectorsCommand } from "@aws-sdk/client-s3vectors";
import { s3VectorsClient } from "@/lib/aws/s3vectors";

function batchVectorKeys(keys: string[], batchSize = 100) {
  const batches: string[][] = [];

  for (let i = 0; i < keys.length; i += batchSize) {
    batches.push(keys.slice(i, i + batchSize));
  }

  return batches;
}

export async function deleteDocumentVectorsByKeys(vectorKeys: string[]) {
  if (vectorKeys.length === 0) {
    return {
      deletedCount: 0,
    };
  }

  const vectorBucketName =
  process.env.VECTOR_BUCKET_NAME ?? process.env.S3_VECTOR_BUCKET_NAME;

const indexName =
  process.env.VECTOR_INDEX_NAME ?? process.env.S3_VECTOR_INDEX_NAME;

  if (!vectorBucketName) {
    throw new Error("VECTOR_BUCKET_NAME environment variable is missing");
  }

  if (!indexName) {
    throw new Error("VECTOR_INDEX_NAME environment variable is missing");
  }

  let deletedCount = 0;

  for (const batch of batchVectorKeys(vectorKeys)) {
    await s3VectorsClient.send(
      new DeleteVectorsCommand({
        vectorBucketName,
        indexName,
        keys: batch,
      })
    );

    deletedCount += batch.length;
  }

  return {
    deletedCount,
  };
}