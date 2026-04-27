export function WorkspaceStatSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-4 w-16 animate-pulse rounded-md bg-slate-100" />
      </div>

      <div className="mt-3 h-3.5 w-28 animate-pulse rounded-md bg-slate-100" />
      <div className="mt-2 h-7 w-8 animate-pulse rounded-md bg-slate-200" />
    </div>
  );
}