import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

type RetrievedChunk = {
  chunkIndex: number;
  content: string;
  pageStart: number | null;
  pageEnd: number | null;
};

export async function generateAnswer(
  question: string,
  chunks: RetrievedChunk[]
): Promise<string> {
  const context = chunks
    .map((chunk) => {
      const pageLabel =
        chunk.pageStart && chunk.pageEnd
          ? chunk.pageStart === chunk.pageEnd
            ? `Page ${chunk.pageStart}`
            : `Pages ${chunk.pageStart}-${chunk.pageEnd}`
          : "Page unknown";

      return `[Chunk ${chunk.chunkIndex} | ${pageLabel}]\n${chunk.content}`;
    })
    .join("\n\n---\n\n");

  const prompt = `
You are a grounded document question-answering assistant.

Answer the user's question using only the provided context.
If the question is broad, unclear, or loosely phrased, answer using the closest relevant information from the context.
Only say "I could not find the answer in the provided document context." when the context is clearly unrelated to the question.

Be concise and clear.

Question:
${question}

Context:
${context}
`.trim();

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_CHAT_MODEL_ID!,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        maxTokens: 500,
        temperature: 0.2,
      },
    }),
  });

  const response = await bedrock.send(command);
  const payload = JSON.parse(new TextDecoder().decode(response.body));

  return payload.output?.message?.content?.[0]?.text ?? "";
}