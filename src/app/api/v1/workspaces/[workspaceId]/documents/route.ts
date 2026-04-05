import { NextRequest, NextResponse } from "next/server";
import {
  createDocument,
  listDocumentsByWorkspace,
} from "@/modules/documents/document.repo";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

// GET → list documents for workspace
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { workspaceId } = await params;

  const items = await listDocumentsByWorkspace(workspaceId);

  return NextResponse.json({ items });
}

// POST → create document metadata
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

  // ⚠️ TEMP ( replace with real auth later)
  const uploadedBy = "user_temp";

  const storageKey = `workspaces/${workspaceId}/${Date.now()}_${originalFileName}`;

  const document = await createDocument({
    workspaceId,
    name,
    originalFileName,
    mimeType,
    sizeBytes,
    uploadedBy,
    storageKey,
  });

  return NextResponse.json({ document });
}