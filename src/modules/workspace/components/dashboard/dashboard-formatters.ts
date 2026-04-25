export function formatDocumentName(name: string) {
  const cleaned = name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return cleaned.replace(/\.Pdf$/i, ".PDF");
}