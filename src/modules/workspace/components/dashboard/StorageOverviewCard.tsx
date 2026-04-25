export function StorageOverviewCard() {
  const usedMb = 24.8;
  const limitMb = 1024;
  const usedPercent = Math.round((usedMb / limitMb) * 100);
  const circumference = 2 * Math.PI * 42;
  const progressOffset =
    circumference - (usedPercent / 100) * circumference;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-950">
            Storage Overview
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Current workspace usage
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {usedPercent}%
        </span>
      </div>

      <div className="mt-5 flex items-center justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="11"
            />

            <circle
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke="#0E5B48"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
            />
          </svg>

          <div className="absolute text-center">
            <p className="text-lg font-semibold text-gray-950">{usedMb} MB</p>
            <p className="text-xs text-gray-500">of 1 GB</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-emerald-700">Storage used</span>
          <span className="font-semibold text-emerald-800">
            {usedPercent}% of total
          </span>
        </div>

        <div className="mt-2 h-2 rounded-full bg-white">
          <div
            className="h-2 rounded-full bg-[#0E5B48]"
            style={{ width: `${Math.max(usedPercent, 6)}%` }}
          />
        </div>
      </div>
    </div>
  );
}