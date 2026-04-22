import { getServerSession } from "@/lib/auth/getServerSession";
import { getDocumentById } from "@/modules/documents/document.repo";
import { isUserMemberOfWorkspace } from "@/modules/workspace/workspace.repo";
import { generateEmbedding } from "@/modules/documents/document.embedding";
import { NextRequest, NextResponse } from "next/server";
import { searchSimilarChunks } from "@/modules/documents/documentChunks.repo";
import { generateAnswer } from "@/modules/documents/document.answer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const session = await getServerSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId } = await params;
  const body = await req.json();

  const doc = await getDocumentById(documentId);

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (doc.status !== "READY") {
    return NextResponse.json({ error: "Document not ready" }, { status: 400 });
  }

  const isMember = await isUserMemberOfWorkspace(
    session.userId,
    doc.workspaceId,
  );

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const question =
    typeof body.question === "string" ? body.question.trim() : "";

  if (!question) {
    return NextResponse.json(
      { error: "Question is required" },
      { status: 400 },
    );
  }

  const queryEmbedding = await generateEmbedding(question);

  const chunks = await searchSimilarChunks({
  workspaceId: doc.workspaceId,
  documentId,
  queryEmbedding,
  limit: 5,
});

const answer = await generateAnswer(question, chunks);

 return NextResponse.json({
  ok: true,
  documentId,
  question,
  answer,
 citations: chunks.map((chunk) => ({
  chunkIndex: chunk.chunkIndex,
  pageStart: chunk.pageStart,
  pageEnd: chunk.pageEnd,
  content: chunk.content,
})),
});
}
