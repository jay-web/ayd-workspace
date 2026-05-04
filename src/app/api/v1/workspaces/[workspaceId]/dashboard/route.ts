import { NextRequest, NextResponse } from "next/server";
import { listDocumentsByWorkspace } from "@/modules/documents/document.dynamo.repo";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

function buildDocumentStats(
  documents: Awaited<ReturnType<typeof listDocumentsByWorkspace>>
) {
  const totalDocuments = documents.length;

  const readyDocuments = documents.filter(
    (document) => document.status === "READY"
  ).length;

  const processingDocuments = documents.filter(
    (document) => document.status === "PROCESSING"
  ).length;

  const failedDocuments = documents.filter(
    (document) => document.status === "FAILED"
  ).length;

  const uploadedDocuments = documents.filter(
    (document) => document.status === "UPLOADED"
  ).length;

  return {
    totalDocuments,
    readyDocuments,
    processingDocuments,
    failedDocuments,
    uploadedDocuments,
  };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { workspaceId } = await params;

  const documents = await listDocumentsByWorkspace(workspaceId);

  const documentStats = buildDocumentStats(documents);

  return NextResponse.json({
    documents: documentStats,
    recentDocuments: documents.slice(0, 5),
  });
}