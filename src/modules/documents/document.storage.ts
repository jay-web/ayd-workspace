import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/aws/s3";

type CreateUploadUrlInput = {
  key: string;
  contentType: string;
};

export async function createDocumentUploadUrl({
  key,
  contentType,
}: CreateUploadUrlInput) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 5,
  });

  return uploadUrl;
}