type KnowledgeHealthCardProps = {
  total: number;
  ready: number;
  processing: number;
  failed: number;
};

export function KnowledgeHealthCard({
  total,
  ready,
  processing,
  failed,
}: KnowledgeHealthCardProps) {
  const readyPercent = total > 0 ? Math.round((ready / total) * 100) : 0;
  const circumference = 2 * Math.PI * 46;
  const progressOffset =
    circumference - (readyPercent / 100) * circumference;

  const isHealthy = failed === 0 && processing === 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-950">
            Knowledge Health
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Document ingestion status
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isHealthy
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {isHealthy ? "Healthy" : "Needs attention"}
        </span>
      </div>

    <div className="mt-6 grid grid-cols-[144px_minmax(0,1fr)] items-center gap-2.5">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="10"
            />

            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="#0E5B48"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
            />
          </svg>

          <div className="absolute text-center">
            <p className="text-2xl font-semibold text-gray-950">{total}</p>
            <p className="text-xs font-medium text-gray-500">Total Docs</p>
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <HealthRow
            color="bg-emerald-500"
            label="Ready"
            value={ready}
            sub={`${readyPercent}% indexed`}
          />

          <HealthRow
            color="bg-amber-500"
            label="Processing"
            value={processing}
            sub="In progress"
          />

          <HealthRow
            color="bg-red-500"
            label="Failed"
            value={failed}
            sub="Needs retry"
          />
        </div>
      </div>
    </div>
  );
}

function HealthRow({
  color,
  label,
  value,
  sub,
}: {
  color: string;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />

     <div className="min-w-fit">
          <p className="text-sm font-semibold leading-5 text-gray-900">
            {label}
          </p>
        <p className="whitespace-nowrap text-xs text-gray-500">{sub}</p>
        </div>
      </div>

      <span className="shrink-0 text-sm font-bold text-gray-950">{value}</span>
    </div>
  );
}