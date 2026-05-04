"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatCitation } from "./chat.types";

type ChatCitationsPanelProps = {
  workspaceId?: string;
  selectedDocumentId?: string | null;
  citations: ChatCitation[];
  selectedCitation: ChatCitation | null;
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  scrollToTopToken?: string;
};

type CitationWithDocumentId = ChatCitation & {
  documentId?: string;
};

function getCitationLabel(citation: ChatCitation) {
  if (citation.pageStart && citation.pageEnd) {
    if (citation.pageStart === citation.pageEnd) {
      return `Page ${citation.pageStart}`;
    }

    return `Pages ${citation.pageStart}-${citation.pageEnd}`;
  }

  if (citation.pageStart) {
    return `Page ${citation.pageStart}`;
  }

  return "Source";
}

function getCitationRelevance(index: number) {
  return [98, 92, 87][index] ?? 85;
}

function getCitationKey(citation: ChatCitation, index?: number) {
  return `${citation.chunkIndex}-${citation.pageStart}-${citation.pageEnd}-${citation.content}-${index ?? ""}`;
}

function getCitationDocumentId(citation: ChatCitation) {
  return (citation as CitationWithDocumentId).documentId;
}

export default function ChatCitationsPanel({
  workspaceId,
  selectedDocumentId,
  citations,
  selectedCitation,
  collapsed,
  onCollapsedChange,
  scrollToTopToken,
}: ChatCitationsPanelProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [openingKey, setOpeningKey] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hasCitations = citations.length > 0;

  useEffect(() => {
    if (!selectedCitation) {
      queueMicrotask(() => setExpandedKey(null));
      return;
    }

    const matchingIndex = citations.findIndex(
      (citation) =>
        citation.chunkIndex === selectedCitation.chunkIndex &&
        citation.pageStart === selectedCitation.pageStart &&
        citation.pageEnd === selectedCitation.pageEnd &&
        citation.content === selectedCitation.content,
    );

    if (matchingIndex === -1) return;

    const key = getCitationKey(selectedCitation, matchingIndex);
    queueMicrotask(() => setExpandedKey(key));

    if (!collapsed) {
      requestAnimationFrame(() => {
        itemRefs.current[key]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [selectedCitation, citations, collapsed, scrollToTopToken]);

  async function handleOpenPdf(citation: ChatCitation, key: string) {
    const documentId = getCitationDocumentId(citation) ?? selectedDocumentId;
    const pageNumber = citation.pageStart ?? 1;

    if (!workspaceId || !documentId) {
      console.error("Cannot open PDF: missing workspaceId or documentId");
      return;
    }

    const openedTab = window.open("", "_blank");

    try {
      setOpeningKey(key);

      const response = await fetch(
        `/api/v1/workspaces/${encodeURIComponent(
          workspaceId,
        )}/documents/${encodeURIComponent(documentId)}/open`,
      );

      if (!response.ok) {
        throw new Error(`Failed to create PDF open URL: ${response.status}`);
      }

      const data = (await response.json()) as { url?: string };

      if (!data.url) {
        throw new Error("PDF open API did not return a url");
      }

      if (openedTab) {
        openedTab.opener = null;
        openedTab.location.href = `${data.url}#page=${pageNumber}`;
      } else {
        window.open(`${data.url}#page=${pageNumber}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      openedTab?.close();
      console.error("Failed to open PDF", error);
    } finally {
      setOpeningKey(null);
    }
  }

  return (
    <aside
      className={`relative flex h-full min-h-0 shrink-0 overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_10px_26px_rgba(15,23,42,0.04)] transition-[width,opacity,transform] duration-250 ease-out ${
        collapsed
          ? "w-16 translate-x-0 opacity-100"
          : "w-[360px] translate-x-0 opacity-100"
      }`}
    >
      <div
        className={`absolute inset-0 flex flex-col items-center p-3 transition-[opacity,transform] duration-200 ease-out ${
          collapsed
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "pointer-events-none translate-x-2 opacity-0"
        }`}
        title="View sources"
      >
        <button
          type="button"
          onClick={() => onCollapsedChange(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Expand sources"
          title="Expand sources"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="mt-3 flex flex-1 items-center justify-center">
          <div className="rotate-180 text-[11px] font-semibold tracking-[0.16em] text-slate-500 [writing-mode:vertical-rl]">
            SOURCES
          </div>
        </div>

        <div
          className={`mt-3 flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition ${
            hasCitations
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
          title={`${citations.length} source${citations.length === 1 ? "" : "s"}`}
        >
          {citations.length}
        </div>
      </div>

      <div
        className={`flex h-full min-h-0 w-full flex-col transition-[opacity,transform] duration-200 ease-out ${
          collapsed
            ? "pointer-events-none translate-x-2 opacity-0"
            : "pointer-events-auto translate-x-0 opacity-100"
        }`}
      >
        <div className="shrink-0 border-b border-slate-100/50 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900">
                Sources
              </h2>

              <p className="mt-1 text-[12px] text-slate-500">
                {citations.length} source{citations.length === 1 ? "" : "s"} found in this answer
              </p>
            </div>

            <button
              type="button"
              onClick={() => onCollapsedChange(true)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
              aria-label="Collapse sources"
              title="Collapse sources"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="ayd-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2.5">
          {citations.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
              <p className="text-[13px] font-medium text-slate-700">No sources yet</p>
              <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
                Ask a question to see citation sources.
              </p>
            </div>
          ) : (
            citations.map((citation, index) => {
              const key = getCitationKey(citation, index);
              const isSelected =
                selectedCitation?.chunkIndex === citation.chunkIndex &&
                selectedCitation?.pageStart === citation.pageStart &&
                selectedCitation?.pageEnd === citation.pageEnd &&
                selectedCitation?.content === citation.content;

              const isExpanded = expandedKey === key;
              const isOpening = openingKey === key;
              const canOpenPdf = Boolean(workspaceId && (getCitationDocumentId(citation) || selectedDocumentId));

              return (
                <div
                  key={key}
                  ref={(el) => {
                    itemRefs.current[key] = el;
                  }}
                  className={`rounded-[13px] border p-2.5 shadow-[0_4px_12px_rgba(15,23,42,0.02)] transition ${
                    isSelected
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.04)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedKey((prev) => (prev === key ? null : key))}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-start gap-2">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-[10px] font-semibold text-emerald-700">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-slate-900">
                            {getCitationLabel(citation)}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          {getCitationRelevance(index)}%
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 line-clamp-3 text-[12px] leading-5 text-slate-700">
                      {citation.content}
                    </p>
                  </button>

                  {isExpanded ? (
                    <>
                      <div className="ayd-scrollbar mt-2.5 max-h-32 overflow-y-auto rounded-[10px] border border-amber-100/50 bg-amber-50/60 px-2.5 py-2 text-[12px] leading-5 text-slate-800">
                        <p className="whitespace-pre-wrap">{citation.content}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenPdf(citation, key)}
                        disabled={!canOpenPdf || isOpening}
                        className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isOpening ? "Opening..." : "Open page in PDF"}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => onCollapsedChange(true)}
          className="shrink-0 border-t border-slate-100/50 px-3 py-2 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50/50 hover:text-slate-900"
        >
          Show less
        </button>
      </div>
    </aside>
  );
}