import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

export async function generateEmbedding(text: string): Promise<string> {
  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_EMBEDDING_MODEL_ID!,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      inputText: text,
    }),
  });

  const response = await bedrock.send(command);
  const payload = JSON.parse(new TextDecoder().decode(response.body));

  return JSON.stringify(payload.embedding);
}