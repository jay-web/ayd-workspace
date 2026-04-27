import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import {
  getDocumentById,
  updateDocumentStatus,
} from "@/modules/documents/document.dynamo.repo";
import { isWorkspaceMember } from "@/modules/workspace/workspace.dynamo.repo";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { documentId } = await params;

  const session = await getSession(req);

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { workspaceId?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid or missing JSON body" },
      { status: 400 }
    );
  }

  const workspaceId = body.workspaceId;

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId is required" },
      { status: 400 }
    );
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
    status: "PROCESSING",
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Failed to update document status" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: updated.status,
    document: updated,
  });
}