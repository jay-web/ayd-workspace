import { NextRequest, NextResponse } from "next/server";
import {
  getDocumentById,
  updateDocumentStatus,
} from "@/modules/documents/document.dynamo.repo";
import { getSession } from "@/lib/auth/getSession";
import { isWorkspaceMember } from "@/modules/workspace/workspace.dynamo.repo";
import { DocumentStatus } from "@/contracts/document";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

const allowedStatuses: DocumentStatus[] = [
  "UPLOADING",
  "PROCESSING",
  "READY",
  "FAILED",
];

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { documentId } = await params;

  const session = await getSession(req);

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    workspaceId?: string;
    status?: DocumentStatus;
    errorMessage?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid or missing JSON body" },
      { status: 400 }
    );
  }

  const { workspaceId, status, errorMessage } = body;

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId is required" },
      { status: 400 }
    );
  }

  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const document = await getDocumentById({
    workspaceId,
    documentId,
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const isMember = await isWorkspaceMember({
    workspaceId,
    userId: session.userId,
  });

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await updateDocumentStatus({
    workspaceId,
    documentId,
    status,
    errorMessage: errorMessage ?? null,
  });

  return NextResponse.json({
    success: true,
    document: updated,
  });
}