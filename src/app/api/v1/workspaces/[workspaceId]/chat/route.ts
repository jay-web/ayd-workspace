import { NextRequest, NextResponse } from "next/server";
import { createEmbedding } from "@/lib/ai/embeddings";
import { searchVectors } from "@/lib/vector/searchVectors";
import { getChunksByVectorKeys } from "@/lib/documents/getChunksByVectorKeys";
import { generateAnswer } from "@/modules/documents/document.answer";

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

    const retrievedChunks = await getChunksByVectorKeys(vectorResults);

    const usableChunks = retrievedChunks.filter((item) => item.chunk?.text);

    if (usableChunks.length === 0) {
      return NextResponse.json({
        question,
        answer: "I could not find the answer in the provided document context.",
        sources: [],
      });
    }

   const answerChunks = usableChunks.map((item, index) => {
  const rawText = item.chunk?.text;

  const content =
    typeof rawText === "string"
      ? rawText
      : typeof rawText === "object" &&
          rawText !== null &&
          "content" in rawText &&
          typeof rawText.content === "string"
        ? rawText.content
        : "";

  const pageNumber =
    typeof rawText === "object" &&
    rawText !== null &&
    "page_number" in rawText &&
    typeof rawText.page_number === "number"
      ? rawText.page_number
      : item.chunk?.pageNumber ?? null;

  return {
    chunkIndex: index,
    content,
    pageStart: pageNumber,
    pageEnd: pageNumber,
  };
});



const answer = await generateAnswer(question, answerChunks);

    return NextResponse.json({
      question,
      answer,
      sources: usableChunks.map((item, index) => {
        const chunk = item.chunk as Record<string, unknown> | undefined;
        const metadata = item.metadata as Record<string, unknown> | undefined;
        
        return {
          sourceNumber: index + 1,
          vectorKey: item.vectorKey,
          distance: item.distance,
          documentId: chunk?.documentId ?? metadata?.documentId,
          chunkId: chunk?.chunkId ?? metadata?.chunkId,
          pageNumber: chunk?.pageNumber ?? metadata?.pageNumber,
          pageStart: chunk?.pageStart ?? metadata?.pageStart ?? chunk?.pageNumber ?? metadata?.pageNumber,
          pageEnd: chunk?.pageEnd ?? metadata?.pageEnd ?? chunk?.pageNumber ?? metadata?.pageNumber,
          sourcePreview: chunk?.sourcePreview ?? metadata?.sourcePreview,
        };
      }),
    });
  } catch (error) {
    console.error("chat.failed", error);

    return NextResponse.json(
      {
        error: "Chat failed",
      },
      { status: 500 }
    );
  }
}