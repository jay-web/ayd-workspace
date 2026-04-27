import Link from "next/link";

type WorkspaceCardProps = {
  workspaceId: string;
  name: string;
  role: string;
  joinedAt: string;
};

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function getWorkspaceTone(name: string) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("law") || normalizedName.includes("legal")) {
    return {
      icon: "⚖",
      category: "Legal",
      accent: "bg-emerald-500",
      iconBox: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      button: "bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-600/20",
    };
  }

  if (normalizedName.includes("finance") || normalizedName.includes("account")) {
    return {
      icon: "₹",
      category: "Business",
      accent: "bg-blue-500",
      iconBox: "bg-blue-50 text-blue-700 ring-blue-100",
      badge: "bg-blue-50 text-blue-700 ring-blue-100",
      button: "bg-slate-900 hover:bg-slate-800 focus:ring-slate-700/20",
    };
  }

  if (normalizedName.includes("science") || normalizedName.includes("research")) {
    return {
      icon: "⌬",
      category: "Research",
      accent: "bg-violet-500",
      iconBox: "bg-violet-50 text-violet-700 ring-violet-100",
      badge: "bg-violet-50 text-violet-700 ring-violet-100",
      button: "bg-slate-900 hover:bg-slate-800 focus:ring-slate-700/20",
    };
  }

  return {
    icon: "▣",
    category: "Workspace",
    accent: "bg-emerald-500",
    iconBox: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    button: "bg-slate-900 hover:bg-slate-800 focus:ring-slate-700/20",
  };
}

export function WorkspaceCard({
  workspaceId,
  name,
  role,
  joinedAt,
}: WorkspaceCardProps) {
  const tone = getWorkspaceTone(name);
  const displayRole = role || "Member";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className={`h-1.5 w-full ${tone.accent}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold shadow-sm ring-1 ${tone.iconBox}`}
            >
              {tone.icon}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-[17px] font-bold tracking-tight text-[#061226]">
                {name}
              </h3>

              <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-slate-500">
                Intelligent document space for organizing, searching, and
                managing files.
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tone.badge}`}
          >
            {tone.category}
          </span>
        </div>

        <div className="my-4 h-px bg-slate-100" />

        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Role</p>
            <p className="mt-1 truncate text-[13px] font-semibold text-slate-700">
              {displayRole}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium text-slate-400">Joined</p>
            <p className="mt-1 truncate text-[13px] font-semibold text-slate-700">
              {formatDate(joinedAt)}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium text-slate-400">Status</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-[13px] font-semibold text-slate-700">
                Active
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <Link
            href={`/workspaces/${workspaceId}`}
            className={`inline-flex h-[40px] flex-1 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 ${tone.button}`}
          >
            Open Workspace
            <span className="ml-2 transition group-hover:translate-x-0.5">
              →
            </span>
          </Link>

          <button
            type="button"
            aria-label="Workspace actions"
            className="flex h-[40px] w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600"
          >
            ⋮
          </button>
        </div>
      </div>
    </article>
  );
}