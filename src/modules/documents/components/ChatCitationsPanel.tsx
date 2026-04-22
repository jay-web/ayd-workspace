"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatCitation } from "./chat.types";

type ChatCitationsPanelProps = {
  citations: ChatCitation[];
  selectedCitation: ChatCitation | null;
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  scrollToTopToken?: string;
};

function getCitationLabel(citation: ChatCitation) {
  if (citation.pageStart && citation.pageEnd) {
    if (citation.pageStart === citation.pageEnd) {
      return `Page ${citation.pageStart}`;
    }
    return `Pages ${citation.pageStart}-${citation.pageEnd}`;
  }

  return "Source";
}

function getCitationRelevance(index: number) {
  return [98, 92, 87][index] ?? 85;
}

function getCitationKey(citation: ChatCitation, index?: number) {
  return `${citation.chunkIndex}-${citation.pageStart}-${citation.pageEnd}-${citation.content}-${index ?? ""}`;
}

export default function ChatCitationsPanel({
  citations,
  selectedCitation,
  collapsed,
  onCollapsedChange,
  scrollToTopToken
}: ChatCitationsPanelProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!selectedCitation) {
      setExpandedKey(null);
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
    setExpandedKey(key);

   if (!collapsed) {
  requestAnimationFrame(() => {
    itemRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}
 }, [selectedCitation, citations, collapsed, scrollToTopToken]);

  if (collapsed) {
    return (
      <aside className="flex w-[56px] shrink-0 flex-col items-center rounded-[20px] border border-slate-200/80 bg-white py-3 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
        <button
          type="button"
          onClick={() => onCollapsedChange(false)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          aria-label="Expand citations"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="mt-4 flex flex-1 items-center">
          <div className="rotate-180 text-[12px] font-semibold tracking-[0.18em] text-slate-500 [writing-mode:vertical-rl]">
            SOURCES
          </div>
        </div>

        <div className="mt-4 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-emerald-100 px-2 text-[11px] font-semibold text-emerald-700">
          {citations.length}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[272px] shrink-0 flex-col rounded-[20px] border border-slate-200/80 bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900">
          Sources
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCollapsedChange(true)}
            className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
            aria-label="Collapse citations"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
            aria-label="Open citation externally"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="mt-2.5 shrink-0 text-[12px] text-slate-500">
        {citations.length} source{citations.length === 1 ? "" : "s"} found in this answer
      </p>

      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {citations.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50/60 p-4">
            <p className="text-[13px] font-medium text-slate-700">No citations yet</p>
            <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
              Ask a question and citation sources will appear here.
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

            return (
              <div
                key={key}
                ref={(el) => {
                  itemRefs.current[key] = el;
                }}
                className={`rounded-[16px] border p-3 shadow-[0_8px_18px_rgba(15,23,42,0.03)] transition ${
                  isSelected
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedKey((prev) => (prev === key ? null : key))}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400 text-[11px] font-semibold text-emerald-700">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-900">
                          {getCitationLabel(citation)}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400">
                      Relevance{" "}
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-emerald-700">
                        {getCitationRelevance(index)}%
                      </span>
                    </p>
                  </div>

                  <p className="mt-3 text-[13px] leading-6 text-slate-700">
                    {citation.content.slice(0, 120)}
                    {citation.content.length > 120 ? "..." : ""}
                  </p>
                </button>

                {isExpanded ? (
                  <>
                    <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[13px] leading-5.5 text-slate-800">
                      {citation.content}
                    </div>

                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Open page in PDF
                      <ExternalLink className="h-3.5 w-3.5" />
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
        className="mt-3 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-medium text-blue-600 transition hover:bg-slate-100"
      >
        Show less
      </button>
    </aside>
  );
}