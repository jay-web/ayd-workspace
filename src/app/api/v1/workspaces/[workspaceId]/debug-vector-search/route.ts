import { NextRequest, NextResponse } from "next/server";
import { createEmbedding } from "@/lib/ai/embeddings";
import { searchVectors } from "@/lib/vector/searchVectors";
import { getChunksByVectorKeys } from "@/lib/documents/getChunksByVectorKeys";

type RouteContext = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { workspaceId } = await params;
    const body = await req.json();

    const { question, documentId } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }

    const embedding = await createEmbedding(question);

    const vectorResults = await searchVectors({
      embedding,
      workspaceId,
      documentId,
      topK: 5,
    });

    const chunks = await getChunksByVectorKeys(vectorResults);

    return NextResponse.json({
      question,
      matches: chunks,
    });
  } catch (error) {
    console.error("debug-vector-search.failed", error);

    return NextResponse.json(
      {
        error: "Vector search failed",
      },
      { status: 500 }
    );
  }
}