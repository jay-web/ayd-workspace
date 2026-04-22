type Props = {
  name: string;
  active?: boolean;
};

export default function ChatDocumentCard({
  name,
  active = false,
}: Props) {
  return (
    <button
      className={`w-full rounded-[26px] border px-5 py-5 text-left transition ${
        active
          ? "border-slate-900 bg-white shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 h-12 w-12 shrink-0 rounded-2xl border border-slate-200 bg-slate-50" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[18px] font-semibold text-slate-900">
            {name}
          </p>

          <p className="mt-2 text-[15px] leading-6 text-slate-500">
            Ready for grounded Q&amp;A
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-emerald-200 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-emerald-600">
          READY
        </span>
      </div>
    </button>
  );
}