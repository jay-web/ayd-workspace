import Link from "next/link";
import { Trash2 } from "lucide-react";

type WorkspaceCardProps = {
  workspaceId: string;
  name: string;
  role: string;
  joinedAt: string;
  onDelete?: (workspaceId: string) => void;
};

function formatDate(value: string) {
  if (!value) return "Recently";

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

function formatRole(value: string) {
  if (!value) return "Member";

  const normalizedRole = value.toUpperCase();

  if (normalizedRole === "OWNER") return "Owner";
  if (normalizedRole === "EDITOR") return "Editor";
  if (normalizedRole === "VIEWER") return "Viewer";

  return value;
}

function formatWorkspaceName(value: string) {
  if (!value) return "Workspace";

  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getWorkspaceTone(name: string) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("law") || normalizedName.includes("legal")) {
    return {
      icon: "⚖",
      category: "Legal",
      iconBox: "bg-amber-50 text-amber-700 ring-amber-100",
      badge: "bg-amber-50 text-amber-700 ring-amber-100",
    };
  }

  if (normalizedName.includes("finance") || normalizedName.includes("account")) {
    return {
      icon: "₹",
      category: "Business",
      iconBox: "bg-blue-50 text-blue-700 ring-blue-100",
      badge: "bg-blue-50 text-blue-700 ring-blue-100",
    };
  }

  if (normalizedName.includes("science") || normalizedName.includes("research")) {
    return {
      icon: "⌬",
      category: "Research",
      iconBox: "bg-violet-50 text-violet-700 ring-violet-100",
      badge: "bg-violet-50 text-violet-700 ring-violet-100",
    };
  }

  return {
    icon: "▣",
    category: "Workspace",
    iconBox: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };
}

export function WorkspaceCard({
  workspaceId,
  name,
  role,
  joinedAt,
  onDelete,
}: WorkspaceCardProps) {
  const tone = getWorkspaceTone(name);
  const displayName = formatWorkspaceName(name);
  const displayRole = formatRole(role);
  const canDeleteWorkspace = displayRole === "Owner";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-1.5 w-full bg-emerald-500" />

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
                {displayName}
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
            className="inline-flex h-[40px] flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-100 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            Open Workspace
            <span className="ml-2 transition group-hover:translate-x-0.5">
              →
            </span>
          </Link>

          {canDeleteWorkspace && (
            <button
              type="button"
              aria-label="Delete workspace"
              onClick={() => onDelete?.(workspaceId)}
              className="flex h-[40px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-4 focus:ring-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}