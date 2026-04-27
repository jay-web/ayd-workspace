import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  createDocument,
  listDocumentsByWorkspace,
} from "@/modules/documents/document.dynamo.repo";
import { createDocumentUploadUrl } from "@/modules/documents/document.storage";
import { getSession } from "@/lib/auth/getSession";
import { isWorkspaceMember } from "@/modules/workspace/workspace.dynamo.repo";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

// GET → list documents
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { workspaceId } = await params;

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

  const items = await listDocumentsByWorkspace(workspaceId);

  return NextResponse.json({ items });
}

// POST → create document + presigned URL
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { workspaceId } = await params;

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

  const body = await req.json();

  const { name, originalFileName, mimeType, sizeBytes } = body;

  if (!name || !originalFileName || !mimeType || !sizeBytes) {
    return NextResponse.json(
      { error: "Missing required document fields" },
      { status: 400 }
    );
  }

  const uploadedBy = session.userId;
  const documentId = randomUUID();

  const fileExtension = originalFileName.split(".").pop() ?? "bin";

  const storageKey = [
    "workspaces",
    workspaceId,
    "documents",
    `${documentId}.${fileExtension}`,
  ].join("/");

  const document = await createDocument({
    documentId,
    workspaceId,
    name,
    originalFileName,
    mimeType,
    sizeBytes,
    uploadedBy,
    storageKey,
    status: "UPLOADING",
  });

  const uploadUrl = await createDocumentUploadUrl({
    key: storageKey,
    contentType: mimeType,
  });

  return NextResponse.json({
    document,
    uploadUrl,
  });
}