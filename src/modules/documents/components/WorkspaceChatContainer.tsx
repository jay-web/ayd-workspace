"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChatDocumentsPanel from "./ChatDocumentsPanel";
import ChatCitationsPanel from "./ChatCitationsPanel";
import {
  ChatCitation,
  ChatDocument,
  ChatDocumentView,
  ChatMessage,
} from "./chat.types";
import ChatMainPanel from "./chatMainPanel";
import DocumentsAutoRefresh from "./DocumentsAutoRefresh";

type WorkspaceChatContainerProps = {
  workspaceId: string;
  documents: ChatDocument[];
};

export default function WorkspaceChatContainer({
  workspaceId,
  documents,
}: WorkspaceChatContainerProps) {
  const router = useRouter();

  const availableDocuments: ChatDocumentView[] = useMemo(() => {
    function getSubtitle(status: ChatDocument["status"]) {
      switch (status) {
        case "READY":
          return "Ready for Q&A";
        case "PROCESSING":
          return "Processing now";
        case "FAILED":
          return "Processing failed";
        case "UPLOADING":
          return "Upload in progress";
        default:
          return "Unavailable";
      }
    }

    return documents.map((doc, index) => ({
      id: doc.documentId,
      name: doc.name,
      subtitle: getSubtitle(doc.status),
      status: doc.status,
      accent:
        index % 3 === 0
          ? "bg-emerald-50 text-emerald-600"
          : index % 3 === 1
            ? "bg-blue-50 text-blue-600"
            : "bg-violet-50 text-violet-600",
    }));
  }, [documents]);

  const [selectedDocumentId, setSelectedDocumentId] = useState(() => {
    return (
      availableDocuments.find((doc) => doc.status === "READY")?.id ??
      availableDocuments[0]?.id ??
      ""
    );
  });

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] =
    useState<ChatCitation | null>(null);
  const [citationsCollapsed, setCitationsCollapsed] = useState(true);
  const [scrollToTopToken, setScrollToTopToken] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedDocumentId && availableDocuments[0]?.id) {
      setSelectedDocumentId(availableDocuments[0].id);
    }
  }, [availableDocuments, selectedDocumentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const selectedDocument =
    availableDocuments.find((doc) => doc.id === selectedDocumentId) ??
    availableDocuments[0];

  const latestAssistantCitations = useMemo(
    () =>
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role === "assistant" && message.citations?.length,
        )?.citations ?? [],
    [messages],
  );

  useEffect(() => {
    if (latestAssistantCitations.length === 0) {
      setSelectedCitation(null);
      setCitationsCollapsed(true);
    }
  }, [latestAssistantCitations]);

  function handleSelectCitation(citation: ChatCitation) {
    setSelectedCitation(citation);
    setCitationsCollapsed(false);
    setScrollToTopToken(
      `${citation.chunkIndex}-${citation.pageStart}-${citation.pageEnd}-${Date.now()}`,
    );
  }

  async function handleDocumentsChanged() {
    router.refresh();
  }

  async function handleAsk(customQuestion?: string) {
    const finalQuestion = (customQuestion ?? question).trim();

    if (
      !selectedDocumentId.trim() ||
      !finalQuestion ||
      selectedDocument?.status !== "READY"
    ) {
      return;
    }

    try {
      setLoading(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: finalQuestion,
        },
      ]);

      if (!customQuestion) {
        setQuestion("");
      }

      const res = await fetch(`/api/v1/workspaces/${workspaceId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: finalQuestion,
          documentId: selectedDocumentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Ask request failed");
      }

      const citations: ChatCitation[] = (data.sources ?? []).map(
        (source: {
          sourceNumber?: number;
          vectorKey?: string;
          distance?: number;
          documentId?: string;
          chunkId?: string;
          pageNumber?: number | null;
          pageStart?: number | null;
          pageEnd?: number | null;
          sourcePreview?: string;
        }) => ({
          chunkIndex: source.sourceNumber ?? 0,
          pageStart: source.pageStart ?? source.pageNumber ?? null,
          pageEnd: source.pageEnd ?? source.pageStart ?? source.pageNumber ?? null,
          content: source.sourcePreview ?? source.chunkId ?? source.vectorKey ?? "Source",
          documentId: source.documentId ?? selectedDocumentId,
          chunkId: source.chunkId,
        }),
      );

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer ?? data.error ?? "No response",
        citations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="h-full min-h-0 overflow-hidden bg-[#f6f8f7] text-slate-900">
      <DocumentsAutoRefresh documents={availableDocuments} />
      <div className="flex h-full min-h-0 max-w-none gap-1.5">
        <ChatDocumentsPanel
          workspaceId={workspaceId}
          documents={availableDocuments}
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={setSelectedDocumentId}
          onDocumentsChanged={handleDocumentsChanged}
        />

        <ChatMainPanel
          selectedDocument={selectedDocument}
          messages={messages}
          loading={loading}
          question={question}
          onQuestionChange={setQuestion}
          onAsk={handleAsk}
          onSelectCitation={handleSelectCitation}
          bottomRef={bottomRef}
        />

        <ChatCitationsPanel
          citations={latestAssistantCitations}
          selectedCitation={selectedCitation}
          collapsed={citationsCollapsed}
          onCollapsedChange={setCitationsCollapsed}
          scrollToTopToken={scrollToTopToken}
          workspaceId={workspaceId}
          selectedDocumentId={selectedDocumentId}
        />
      </div>
    </section>
  );
}