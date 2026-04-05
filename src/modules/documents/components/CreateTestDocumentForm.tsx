"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  workspaceId: string;
};

export default function CreateTestDocumentForm({ workspaceId }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [originalFileName, setOriginalFileName] = useState("");
  const [mimeType, setMimeType] = useState("application/pdf");
  const [sizeBytes, setSizeBytes] = useState("1024");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch(`/api/v1/workspaces/${workspaceId}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        originalFileName,
        mimeType,
        sizeBytes: Number(sizeBytes),
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create document");
    }

    setName("");
    setOriginalFileName("");
    setMimeType("application/pdf");
    setSizeBytes("1024");

    toast.success("Document created successfully");
    router.refresh();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong";

    setError(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Create Test Document
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          This creates document metadata only. File upload comes later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project Proposal"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Original File Name
          </label>
          <input
            value={originalFileName}
            onChange={(e) => setOriginalFileName(e.target.value)}
            placeholder="proposal.pdf"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            MIME Type
          </label>
          <input
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Size (bytes)
          </label>
          <input
            type="number"
            min="1"
            value={sizeBytes}
            onChange={(e) => setSizeBytes(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            required
          />
        </div>

        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Document"}
        </button>
      </form>
    </div>
  );
}