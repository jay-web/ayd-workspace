import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSession } from "@/lib/auth/getSession";
import { isWorkspaceMember } from "@/modules/workspace/workspace.dynamo.repo";
import {
  deleteDocumentById,
  deleteDocumentChunksByDocumentId,
  getDocumentById,
} from "@/modules/documents/document.dynamo.repo";
import { deleteDocumentVectorsByKeys } from "@/modules/documents/document.vector.repo";
import { s3Client } from "@/lib/aws/s3";

type RouteContext = {
  params: Promise<{ workspaceId: string; documentId: string }>;
};

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { workspaceId, documentId } = await params;

  const session = await getSession(req);

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

  const fallbackVectorKeys =
    typeof document.chunkCount === "number" && document.chunkCount > 0
      ? Array.from(
          { length: document.chunkCount },
          (_, index) =>
            `${workspaceId}/${documentId}/chunk-${String(index).padStart(
              4,
              "0",
            )}`,
        )
      : [];

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: document.storageKey,
      }),
    );

    const chunksResult = await deleteDocumentChunksByDocumentId(documentId);

    const vectorKeys =
      chunksResult.vectorKeys.length > 0
        ? chunksResult.vectorKeys
        : fallbackVectorKeys;

    const vectorsResult = await deleteDocumentVectorsByKeys(vectorKeys);

    const deletedDocument = await deleteDocumentById({
      workspaceId,
      documentId,
    });

    return NextResponse.json({
      success: true,
      deletedDocumentId: deletedDocument?.documentId ?? documentId,
      deletedChunksCount: chunksResult.deletedCount,
      deletedVectorsCount: vectorsResult.deletedCount,
    });
  } catch (error) {
    console.error("Failed to delete document:", error);

    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 },
    );
  }
}