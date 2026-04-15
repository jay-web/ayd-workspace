import pdf from "pdf-parse";

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function extractTextFromDocument(params: {
  buffer: Buffer;
  contentType: string | null;
  storageKey: string;
}) {
  const isPdf =
    params.contentType === "application/pdf" ||
    params.storageKey.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error(
      `Unsupported file type for Step 2 extraction: ${params.contentType ?? "unknown"}`
    );
  }

  const result = await pdf(params.buffer);
  const text = normalizeText(result.text ?? "");

  if (!text) {
    throw new Error("No text could be extracted from the uploaded PDF");
  }

  return text;
}

export function chunkTextByWords(
  text: string,
  options?: {
    chunkWordCount?: number;
    overlapWordCount?: number;
  }
) {
  const chunkWordCount = options?.chunkWordCount ?? 220;
  const overlapWordCount = options?.overlapWordCount ?? 40;

  if (overlapWordCount >= chunkWordCount) {
    throw new Error("overlapWordCount must be smaller than chunkWordCount");
  }

  const words = text.split(/\s+/).filter(Boolean);

  if (!words.length) {
    return [];
  }

  const chunks: string[] = [];
  const step = chunkWordCount - overlapWordCount;

  for (let start = 0; start < words.length; start += step) {
    const end = Math.min(start + chunkWordCount, words.length);
    const chunk = words.slice(start, end).join(" ").trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end === words.length) {
      break;
    }
  }

  return chunks;
}