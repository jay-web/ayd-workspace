import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  createDocument,
  listDocumentsByWorkspace,
} from "@/modules/documents/document.repo";
import { createDocumentUploadUrl } from "@/modules/documents/document.storage";
import { getSession } from "@/lib/auth/getSession";
import { isUserMemberOfWorkspace } from "@/modules/workspace/workspace.repo";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

// GET → list documents
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { workspaceId } = await params;

  const session = await getSession(_req);

  if (!session?.userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const isMember = await isUserMemberOfWorkspace(
    session.userId,
    workspaceId
  );

  if (!isMember) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }


  const items = await listDocumentsByWorkspace(workspaceId);

  return NextResponse.json({ items });
}

// POST → create document + presigned URL
export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  const { workspaceId } = await params;
  const session = await getSession(req);

if (!session?.userId) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}
const isMember = await isUserMemberOfWorkspace(
  session.userId,
  workspaceId
);

if (!isMember) {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

  const body = await req.json();

  const {
    name,
    originalFileName,
    mimeType,
    sizeBytes,
  } = body;

 const uploadedBy = session.userId;

  // ✅ Step 1: generate documentId
  const documentId = randomUUID();

  // ✅ Step 2: build final storage key
  const fileExtension = originalFileName.split(".").pop() ?? "bin";

  const storageKey = [
    "workspaces",
    workspaceId,
    "documents",
    `${documentId}.${fileExtension}`,
  ].join("/");

  // ✅ Step 3: create DB row
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

  // ✅ Step 4: generate presigned URL
  const uploadUrl = await createDocumentUploadUrl({
    key: storageKey,
    contentType: mimeType,
  });

  // ✅ Step 5: return both
  return NextResponse.json({
    document,
    uploadUrl,
  });
}