"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentIdFromUrl = searchParams.get("documentId");

  const availableDocuments: ChatDocumentView[] = useMemo(() => {
    function getSubtitle(status: ChatDocument["status"]) {
      switch (status) {
        case "READY":
          return "Ready for Q&A";
        case "PROCESSING":
          return "Processing now";
        case "UPLOADED":
          return "Queued for processing";
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
    const routedDocument = availableDocuments.find(
      (doc) => doc.id === documentIdFromUrl && doc.status === "READY"
    );

    return (
      routedDocument?.id ??
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
    const routedDocument = availableDocuments.find(
      (doc) => doc.id === documentIdFromUrl && doc.status === "READY"
    );

    if (routedDocument && selectedDocumentId !== routedDocument.id) {
      setSelectedDocumentId(routedDocument.id);
      return;
    }

    if (!selectedDocumentId && availableDocuments[0]?.id) {
      setSelectedDocumentId(availableDocuments[0].id);
    }
  }, [availableDocuments, documentIdFromUrl, selectedDocumentId]);

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

  const mobileSources = (
    <ChatCitationsPanel
      citations={latestAssistantCitations}
      selectedCitation={selectedCitation}
      collapsed={citationsCollapsed}
      onCollapsedChange={setCitationsCollapsed}
      scrollToTopToken={scrollToTopToken}
      workspaceId={workspaceId}
      selectedDocumentId={selectedDocumentId}
      mobileFullWidth
    />
  );

  return (
    <section className="min-h-full overflow-visible bg-[#f6f8f7] text-slate-900 lg:h-full lg:min-h-0 lg:overflow-hidden">
      <DocumentsAutoRefresh documents={availableDocuments} />
      <div className="flex min-h-full max-w-none flex-col gap-3 lg:h-full lg:min-h-0 lg:flex-row lg:gap-1.5">
        {/* Desktop documents sidebar */}
        <div className="hidden lg:block">
          <ChatDocumentsPanel
            workspaceId={workspaceId}
            documents={availableDocuments}
            selectedDocumentId={selectedDocumentId}
            onSelectDocument={(id) => setSelectedDocumentId(id)}
            onDocumentsChanged={handleDocumentsChanged}
          />
        </div>

        {/* Main column: on mobile show selected document card and optionally expanded documents list */}
        <div className="flex min-w-0 flex-1 flex-col lg:min-h-0">
          <div className="lg:hidden">
              <div className="mb-4 w-full">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600 mb-1">
                  Selected document
                </p>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 shrink-0 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <span className="text-[13px]">📄</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {selectedDocument?.name ?? "No document selected"}
                        </p>
                        <span className="flex-shrink-0 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {selectedDocument?.status ?? "NONE"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {selectedDocument ? (selectedDocument.status === "READY" ? "Ready for grounded Q&A" : "This document is not ready for chat yet") : "Choose a document first"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setMobileDocsOpen((v) => !v)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-white/70 text-emerald-600"
                      aria-label="Toggle documents"
                    >
                      {mobileDocsOpen ? <span className="">▴</span> : <span className="">▾</span>}
                    </button>
                  </div>
                </div>
              </div>

            {mobileDocsOpen ? (
              <div className="mb-3">
                <ChatDocumentsPanel
                  workspaceId={workspaceId}
                  documents={availableDocuments}
                  selectedDocumentId={selectedDocumentId}
                  onSelectDocument={(id) => {
                    setSelectedDocumentId(id);
                    setMobileDocsOpen(false);
                  }}
                  onDocumentsChanged={handleDocumentsChanged}
                  mobileFullWidth
                />
              </div>
            ) : null}
          </div>

          <ChatMainPanel
            selectedDocument={selectedDocument}
            messages={messages}
            loading={loading}
            question={question}
            onQuestionChange={setQuestion}
            onAsk={handleAsk}
            onSelectCitation={handleSelectCitation}
            bottomRef={bottomRef}
            mobileSources={mobileSources}
          />
        </div>

        {/* Desktop sources panel */}
        <div className="hidden lg:block">
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
      </div>
    </section>
  );
}
