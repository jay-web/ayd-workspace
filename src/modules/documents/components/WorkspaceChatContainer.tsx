"use client";

import { useEffect, useRef, useState } from "react";
type ChatDocument = {
    documentId: string;
    name: string;
    status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
};

export default function WorkspaceChatContainer({
    workspaceId,
    documents,
}: {
    workspaceId: string;
    documents: ChatDocument[];
}) {
    const [documentId, setDocumentId] = useState("");
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<
        {
            role: "user" | "assistant";
            content: string;
            citations?: {
                chunkIndex: number;
                pageStart: number | null;
                pageEnd: number | null;
                content: string;
            }[];
        }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [selectedSource, setSelectedSource] = useState<{
  label: string;
  content: string;
} | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function handleAsk() {
        if (!documentId.trim() || !question.trim()) return;

        try {
            setLoading(true);
            setMessages((prev) => [
                ...prev,
                { role: "user", content: question.trim() },
            ]);

            const res = await fetch(`/api/v1/documents/${documentId}/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question }),
            });

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.answer ?? data.error ?? "No response",
                    citations: data.citations ?? [],
                },
            ]);
            setQuestion("");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-5xl">Chat</h2>
                <p className="mt-4 text-base text-slate-600 sm:text-lg">
                    Ask questions from documents in workspace: {workspaceId}
                </p>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                        Document
                    </label>
                    <select
                        value={documentId}
                        onChange={(e) => setDocumentId(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 text-slate-900 bg-white"
                    >
                        <option value="">Select a document</option>
                        {documents.map((doc) => (
                            <option key={doc.documentId} value={doc.documentId}>
                                {doc.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                        Question
                    </label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask something about the document"
                        rows={4}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 text-slate-900 bg-white placeholder:text-slate-400"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAsk();
                            }
                        }}
                    />
                </div>

                <button
                    type="button"
                    disabled={loading || !documentId || !question.trim()}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    onClick={handleAsk}

                >
                    {loading ? "Asking..." : "Ask"}
                </button>

                <div className="h-96 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-3">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl px-4 py-3 text-sm ${message.role === "user"
                                ? "ml-auto max-w-[80%] bg-slate-900 text-white"
                                : "mr-auto max-w-[80%] bg-slate-100 text-slate-900"
                                }`}
                        >
                            <div>{message.content}</div>

                            {message.role === "assistant" && message.citations?.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {message.citations.map((citation, i) => (
                                        <button
                                            type="button"
                                            key={i}
                                            onClick={() =>
  setSelectedSource({
    label:
      citation.pageStart && citation.pageEnd
        ? citation.pageStart === citation.pageEnd
          ? `Page ${citation.pageStart}`
          : `Pages ${citation.pageStart}-${citation.pageEnd}`
        : "Source",
    content: citation.content,
  })
}
                                            className="rounded-full bg-white px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-200"
                                        >
                                            {citation.pageStart && citation.pageEnd
                                                ? citation.pageStart === citation.pageEnd
                                                    ? `Page ${citation.pageStart}`
                                                    : `Pages ${citation.pageStart}-${citation.pageEnd}`
                                                : "Source"}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ))}
                    {loading ? (
                        <div className="mr-auto max-w-[80%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                            Thinking...
                        </div>
                    ) : null}
                </div>
                {selectedSource ? (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      {selectedSource.label}
    </p>
    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
      {selectedSource.content}
    </p>
  </div>
) : null}
                <div ref={bottomRef} />
            </div>
        </section>
    );
}