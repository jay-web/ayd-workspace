import { S3Client,GetObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});



export async function readS3ObjectBuffer(bucket: string, key: string) {
  const result = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!result.Body) {
    throw new Error(`S3 object body missing for key: ${key}`);
  }

  const bytes = await result.Body.transformToByteArray();

  return {
    buffer: Buffer.from(bytes),
    contentType: result.ContentType ?? null,
    contentLength: result.ContentLength ?? bytes.length,
    eTag: result.ETag ?? null,
  };
}

export async function deleteS3Objects(bucket: string, keys: string[]) {
  const uniqueKeys = Array.from(new Set(keys)).filter(Boolean);

  if (uniqueKeys.length === 0) {
    return {
      deletedCount: 0,
    };
  }

  const chunks: string[][] = [];

  for (let i = 0; i < uniqueKeys.length; i += 1000) {
    chunks.push(uniqueKeys.slice(i, i + 1000));
  }

  let deletedCount = 0;

  for (const chunk of chunks) {
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: chunk.map((key) => ({ Key: key })),
          Quiet: true,
        },
      })
    );

    deletedCount += chunk.length;
  }

  return {
    deletedCount,
  };
}