type Props = {
  selectedFileName?: string;
};

export default function ChatTopBar({
  selectedFileName = "No document selected",
}: Props) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[28px] border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="h-12 w-12 shrink-0 rounded-2xl border border-slate-200 bg-slate-50" />

        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold text-slate-900">
            {selectedFileName}
          </p>

          <div className="mt-2 flex items-center gap-3">
            <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-500">
              NONE
            </span>

            <span className="text-[14px] text-slate-500">
              Choose a file to begin
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4 text-right">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500">
          WORKSPACE
        </p>

        <p className="mt-2 text-[14px] font-semibold text-slate-900">
          Current workspace
        </p>
      </div>
    </div>
  );
}