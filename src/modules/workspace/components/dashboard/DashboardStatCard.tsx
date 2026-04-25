type DashboardStatCardProps = {
  icon: string;
  label: string;
  value: string | number;
  sub: string;
};

export function DashboardStatCard({
  icon,
  label,
  value,
  sub,
}: DashboardStatCardProps) {
  const isPositive = sub.trim().startsWith("↑");
  const isNegative = sub.trim().startsWith("↓");

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl shadow-sm transition group-hover:bg-[#0E5B48] group-hover:text-white">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-gray-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
            {value}
          </p>

          <p
            className={`mt-1 truncate text-xs font-medium ${
              isPositive
                ? "text-emerald-600"
                : isNegative
                  ? "text-slate-500"
                  : "text-gray-500"
            }`}
          >
            {sub}
          </p>
        </div>
      </div>
    </div>
  );
}