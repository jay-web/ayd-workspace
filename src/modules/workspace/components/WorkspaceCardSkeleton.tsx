export function WorkspaceCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1.5 w-full animate-pulse bg-slate-200" />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-200" />

            <div className="min-w-0 flex-1">
              <div className="h-5 w-28 animate-pulse rounded-md bg-slate-200" />
              <div className="mt-2 h-4 w-56 max-w-full animate-pulse rounded-md bg-slate-100" />
              <div className="mt-2 h-4 w-44 max-w-full animate-pulse rounded-md bg-slate-100" />
            </div>
          </div>

          <div className="h-7 w-20 shrink-0 animate-pulse rounded-full bg-slate-100" />
        </div>

        <div className="my-4 h-px bg-slate-100" />

        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <div className="h-3 w-10 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-16 animate-pulse rounded bg-slate-200" />
          </div>

          <div>
            <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-14 animate-pulse rounded bg-slate-200" />
          </div>

          <div>
            <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-16 animate-pulse rounded bg-slate-200" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <div className="h-[40px] flex-1 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-[40px] w-[40px] animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </article>
  );
}