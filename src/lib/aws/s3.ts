import { S3Client,GetObjectCommand } from "@aws-sdk/client-s3";

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