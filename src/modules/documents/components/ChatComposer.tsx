export default function ChatComposer() {
  return (
    <div className="mt-6 w-full rounded-[18px] border border-slate-200 bg-white p-3 lg:p-5">
      <div className="flex items-center gap-2">
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100">
          📎
        </button>

        <textarea
          rows={1}
          placeholder="Ask something about this document..."
          className="max-h-24 min-h-[36px] flex-1 resize-none border-0 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-2xl bg-emerald-700 px-3 py-2 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(5,150,105,0.18)] hover:bg-emerald-800"
        >
          Ask
        </button>
      </div>
    </div>
  );
}