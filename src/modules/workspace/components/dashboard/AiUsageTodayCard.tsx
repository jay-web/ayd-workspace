const usageBars = [28, 42, 55, 50, 65, 78, 70, 74, 86];

export function AiUsageTodayCard() {
  const totalQueries = 24;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-950">
            AI Usage Today
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Query volume and model activity
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {totalQueries} queries
        </span>
      </div>

    <div className="mt-5 flex h-28 items-end gap-2 rounded-2xl bg-gray-50/70 px-3 pb-3 pt-3">
        {usageBars.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-lg bg-[#0E5B48] transition-all duration-300 hover:bg-emerald-700"
            style={{ height: `${height}%` }}
            title={`${height}% usage`}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <UsageInfoBox label="Top Intent" value="Concept Explanation" />
        <UsageInfoBox label="Top Model" value="Bedrock Nova" />
      </div>
    </div>
  );
}

function UsageInfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-gray-950">
        {value}
      </p>
    </div>
  );
}