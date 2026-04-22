export default function ChatComposer() {
  return (
    <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5">
      <textarea
        rows={4}
        placeholder="Ask something about this document..."
        className="w-full resize-none border-0 bg-transparent text-[16px] text-slate-800 outline-none placeholder:text-slate-400"
      />

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-[13px] text-slate-500">
          Enter to send · Shift + Enter for new line
        </p>

        <button
          type="button"
          className="rounded-[18px] bg-emerald-700 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-emerald-800"
        >
          Ask AYD
        </button>
      </div>
    </div>
  );
}