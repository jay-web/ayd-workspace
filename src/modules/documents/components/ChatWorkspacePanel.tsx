import ChatTopBar from "./ChatTopBar";
import ChatPromptGrid from "./ChatPromptGrid";
import ChatComposer from "./ChatComposer";

export default function ChatWorkspacePanel() {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6">
      <ChatTopBar />

      <div className="rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="px-10 py-10">
          <p className="text-[11px] font-semibold tracking-[0.32em] text-slate-500">
            AI DOCUMENT CHAT
          </p>

          <h1 className="mt-5 text-[44px] font-semibold leading-[1.02] tracking-tight text-slate-950">
            Ask your document
          </h1>

          <p className="mt-5 max-w-[720px] text-[18px] leading-8 text-slate-500">
            Ask grounded questions, review citations, and explore answers from
            your selected file.
          </p>

          <ChatPromptGrid />

          <ChatComposer />
        </div>
      </div>
    </section>
  );
}