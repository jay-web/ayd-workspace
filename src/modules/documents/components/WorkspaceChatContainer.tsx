"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ChatDocumentsPanel from "./ChatDocumentsPanel";
import ChatCitationsPanel from "./ChatCitationsPanel";
import {
  ChatCitation,
  ChatDocument,
  ChatDocumentView,
  ChatMessage,
} from "./chat.types";
import ChatMainPanel from "./chatMainPanel";

type WorkspaceChatContainerProps = {
  workspaceId: string;
  documents: ChatDocument[];
};

export default function WorkspaceChatContainer({
  workspaceId,
  documents,
}: WorkspaceChatContainerProps) {
  void workspaceId;

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
  const [selectedCitation, setSelectedCitation] = useState<ChatCitation | null>(null);
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
        .find((message) => message.role === "assistant" && message.citations?.length)
        ?.citations ?? [],
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
    `${citation.chunkIndex}-${citation.pageStart}-${citation.pageEnd}-${Date.now()}`
  );
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

      const res = await fetch(`/api/v1/documents/${selectedDocumentId}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: finalQuestion }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer ?? data.error ?? "No response",
        citations: data.citations ?? [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="-ml-4 -mt-4 h-[calc(100vh-72px)] min-h-0 overflow-hidden bg-[#f6f8f7] px-1.5 py-1.5 text-slate-900 sm:-ml-6 sm:-mt-6 sm:px-2 sm:py-2 md:-ml-8 md:-mt-8 md:px-2.5 md:py-2.5">
      <div className="mx-auto flex h-full min-h-0 max-w-none gap-1.5">
        <ChatDocumentsPanel
          documents={availableDocuments}
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={setSelectedDocumentId}
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
/>
      </div>
    </section>
  );
}
