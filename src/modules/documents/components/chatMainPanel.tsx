"use client";

import {
  ChevronDown,
  FileText,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react";
import { RefObject } from "react";
import { ChatCitation, ChatDocumentView, ChatMessage } from "./chat.types";

const SUGGESTED_QUESTIONS = [
  "Summarize this document",
  "What are the key risks?",
  "Give me the main action items",
  "Explain this in simple language",
];

type ChatMainPanelProps = {
  selectedDocument?: ChatDocumentView;
  messages: ChatMessage[];
  loading: boolean;
  question: string;
  onQuestionChange: (value: string) => void;
  onAsk: (customQuestion?: string) => void;
  onSelectCitation: (citation: ChatCitation) => void;
  bottomRef: RefObject<HTMLDivElement | null>;
};

function getStatusClasses(status?: ChatDocumentView["status"]) {
  switch (status) {
    case "READY":
      return "bg-emerald-100 text-emerald-700";
    case "PROCESSING":
      return "bg-amber-100 text-amber-700";
    case "UPLOADING":
      return "bg-sky-100 text-sky-700";
    case "FAILED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getCitationLabel(citation: ChatCitation) {
  if (citation.pageStart && citation.pageEnd) {
    if (citation.pageStart === citation.pageEnd) {
      return `Page ${citation.pageStart}`;
    }
    return `Pages ${citation.pageStart}-${citation.pageEnd}`;
  }

  return "Source";
}

export default function ChatMainPanel({
  selectedDocument,
  messages,
  loading,
  question,
  onQuestionChange,
  onAsk,
  onSelectCitation,
  bottomRef,
}: ChatMainPanelProps) {
  return (
    <main className="flex min-w-0 flex-1 flex-col rounded-[22px] border border-slate-200/80 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-600">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-slate-900">
                {selectedDocument?.name ?? "No document selected"}
              </p>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.05em] ${getStatusClasses(
                  selectedDocument?.status,
                )}`}
              >
                {selectedDocument?.status ?? "NONE"}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {selectedDocument ? "Ready for grounded Q&A" : "Choose a document first"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Change document
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-0.5 pb-3 pt-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">
          AI Document Chat
        </p>
        <h1 className="mt-1.5 text-[24px] font-semibold tracking-[-0.04em] text-slate-950">
          Ask your document
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-5.5 text-slate-500">
          Ask focused questions and get grounded answers with page-level citations from the
          selected document.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-0.5 pb-2.5">
          {messages.length === 0 ? (
            <div className="space-y-3">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50/60 px-4 py-4">
                <p className="text-[14px] font-semibold text-slate-900">
                  Start with a focused question
                </p>
                <p className="mt-1.5 text-[13px] leading-6 text-slate-500">
                  Choose a document from the left, then ask for summaries, risks, action items,
                  or simplified explanations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {SUGGESTED_QUESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={!selectedDocument || loading}
                    onClick={() => onAsk(item)}
                    className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-left text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index}>
                  {message.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[78%] rounded-[16px] rounded-tr-md border border-emerald-100 bg-emerald-50 px-4 py-2.5 shadow-[0_8px_22px_rgba(16,185,129,0.06)]">
                        <p className="text-[14px] leading-6 text-slate-900">{message.content}</p>
                        <p className="mt-1.5 text-right text-[11px] text-slate-400">You</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-600">
                        <Sparkles className="h-4 w-4" />
                      </div>

                      <div className="max-w-[84%] rounded-[20px] rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                        <p className="text-[14px] leading-6 text-slate-700 whitespace-pre-wrap">
                          {message.content}
                        </p>

                        {message.citations && message.citations.length > 0 ? (
                          <div className="mt-3.5 flex flex-wrap gap-2">
                            {message.citations.map((citation) => (
                              <button
                                key={`${citation.chunkIndex}-${citation.pageStart}-${citation.pageEnd}`}
                                type="button"
                                onClick={() => onSelectCitation(citation)}
                                className="rounded-[14px] border border-slate-200 px-3 py-2 text-left transition hover:border-slate-300 hover:bg-slate-50"
                              >
                                <p className="text-[11px] font-semibold text-slate-500">
                                  {getCitationLabel(citation)}
                                </p>
                                <p className="mt-1 max-w-[156px] truncate text-[12px] text-slate-700">
                                  {selectedDocument?.name ?? "Selected document"}
                                </p>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading ? (
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="rounded-[20px] rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-[14px] leading-6 text-slate-500">Thinking...</p>
                  </div>
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 bg-white pt-2">
        <div className="rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="min-h-[98px] rounded-[16px] border border-slate-200 bg-slate-50/60 px-3 py-2.5">
            <textarea
              rows={4}
              value={question}
              onChange={(e) => onQuestionChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onAsk();
                }
              }}
              placeholder={
                selectedDocument
                  ? "Ask something about this document..."
                  : "Select a document first..."
              }
              className="h-full min-h-[74px] w-full resize-none bg-transparent text-[14px] leading-6 text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3.5">
              <p className="text-[12px] text-slate-500">
                Enter to send • Shift + Enter for new line
              </p>
              <button
                type="button"
                onClick={() => onAsk()}
                disabled={loading || !selectedDocument || !question.trim()}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_12px_22px_rgba(5,150,105,0.2)] transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ask AYD
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}