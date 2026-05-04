import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "@/lib/auth/getSession";
import { isWorkspaceMember } from "@/modules/workspace/workspace.dynamo.repo";
import { getDocumentById } from "@/modules/documents/document.dynamo.repo";
import { s3Client } from "@/lib/aws/s3";

type RouteContext = {
  params: Promise<{ workspaceId: string; documentId: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { workspaceId, documentId } = await params;

  const session = await getSession(_req);

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isMember = await isWorkspaceMember({
    workspaceId,
    userId: session.userId,
  });

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const document = await getDocumentById({
    workspaceId,
    documentId,
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (document.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: document.storageKey,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 60, // 1 hour
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Failed to generate presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate document URL" },
      { status: 500 }
    );
  }
}
