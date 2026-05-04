import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

const EMBEDDING_MODEL_ID =
  process.env.BEDROCK_EMBEDDING_MODEL_ID ?? "amazon.titan-embed-text-v2:0";

export async function createEmbedding(inputText: string): Promise<number[]> {
  const command = new InvokeModelCommand({
    modelId: EMBEDDING_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      inputText,
    }),
  });

  const response = await bedrock.send(command);

  if (!response.body) {
    throw new Error("Bedrock embedding response body is empty");
  }

  const decoded = new TextDecoder().decode(response.body);
  const parsed = JSON.parse(decoded);

  if (!Array.isArray(parsed.embedding)) {
    throw new Error("Embedding not found in Bedrock response");
  }

  return parsed.embedding;
}