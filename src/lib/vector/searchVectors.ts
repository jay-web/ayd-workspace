import {
  S3VectorsClient,
  QueryVectorsCommand,
  type QueryVectorsCommandInput,
  type QueryOutputVector,
  DeleteVectorsCommand,
} from "@aws-sdk/client-s3vectors";

const s3Vectors = new S3VectorsClient({
  region: process.env.AWS_REGION,
});

type SearchVectorsInput = {
  embedding: number[];
  workspaceId: string;
  documentId?: string;
  topK?: number;
};

function buildVectorFilter({
  workspaceId,
  documentId,
}: {
  workspaceId: string;
  documentId?: string;
}): QueryVectorsCommandInput["filter"] {
  if (documentId) {
    return {
      $and: [
        {
          workspaceId: {
            $eq: workspaceId,
          },
        },
        {
          documentId: {
            $eq: documentId,
          },
        },
      ],
    };
  }

  return {
    workspaceId: {
      $eq: workspaceId,
    },
  };
}

export async function searchVectors({
  embedding,
  workspaceId,
  documentId,
  topK = 5,
}: SearchVectorsInput): Promise<QueryOutputVector[]> {
  const filter = buildVectorFilter({
    workspaceId,
    documentId,
  });

  const command = new QueryVectorsCommand({
    vectorBucketName: process.env.S3_VECTOR_BUCKET_NAME!,
    indexName: process.env.S3_VECTOR_INDEX_NAME!,
    queryVector: {
      float32: embedding,
    },
    topK,
    filter,
    returnDistance: true,
    returnMetadata: true,
  });

  const response = await s3Vectors.send(command);

  return response.vectors ?? [];
}

export async function deleteVectorsByKeys(vectorKeys: string[]) {
  const uniqueVectorKeys = Array.from(new Set(vectorKeys)).filter(Boolean);

  if (uniqueVectorKeys.length === 0) {
    return {
      deletedCount: 0,
    };
  }

  const chunks: string[][] = [];

  for (let i = 0; i < uniqueVectorKeys.length; i += 500) {
    chunks.push(uniqueVectorKeys.slice(i, i + 500));
  }

  let deletedCount = 0;

  for (const chunk of chunks) {
    await s3Vectors.send(
      new DeleteVectorsCommand({
        vectorBucketName: process.env.S3_VECTOR_BUCKET_NAME!,
        indexName: process.env.S3_VECTOR_INDEX_NAME!,
        keys: chunk,
      })
    );

    deletedCount += chunk.length;
  }

  return {
    deletedCount,
  };
}

