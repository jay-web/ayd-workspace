import { NextRequest, NextResponse } from "next/server";
import {
  getDocumentStatsByWorkspace,
  listDocumentsByWorkspace,
} from "@/modules/documents/document.repo";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { workspaceId } = await params;

  const [documentStats, recentDocuments] = await Promise.all([
    getDocumentStatsByWorkspace(workspaceId),
    listDocumentsByWorkspace(workspaceId),
  ]);

  return NextResponse.json({
    documents: documentStats,
    recentDocuments: recentDocuments.slice(0, 5),
  });
}