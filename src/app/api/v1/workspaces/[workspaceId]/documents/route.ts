import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  createDocument,
  listDocumentsByWorkspace,
} from "@/modules/documents/document.repo";
import { createDocumentUploadUrl } from "@/modules/documents/document.storage";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

// GET → list documents
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { workspaceId } = await params;

  const items = await listDocumentsByWorkspace(workspaceId);

  return NextResponse.json({ items });
}

// POST → create document + presigned URL
export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  const { workspaceId } = await params;

  const body = await req.json();

  const {
    name,
    originalFileName,
    mimeType,
    sizeBytes,
  } = body;

  const uploadedBy = "user_temp";

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