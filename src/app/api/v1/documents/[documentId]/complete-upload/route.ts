import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import {
  getDocumentById,
  updateDocumentStatus,
} from "@/modules/documents/document.repo";
import { isUserMemberOfWorkspace } from "@/modules/workspace/workspace.repo";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function POST(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { documentId } = await params;

  const session = await getSession(_req);

  if (!session?.userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const document = await getDocumentById(documentId);

  if (!document) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  const isMember = await isUserMemberOfWorkspace(
    session.userId,
    document.workspaceId
  );

  if (!isMember) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

 const updated = await updateDocumentStatus(documentId, "PROCESSING");

if (!updated) {
  return NextResponse.json(
    { error: "Failed to update document status" },
    { status: 500 }
  );
}

  setTimeout(async () => {
    try {
      await updateDocumentStatus(documentId, "READY");
    } catch (error) {
      console.error("Failed to mark document READY", error);
    }
  }, 3000);

  return NextResponse.json({
    ok: true,
    status: "PROCESSING",
  });
}