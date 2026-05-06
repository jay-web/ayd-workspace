import { UploadDocumentAction } from "@/modules/documents/components/UploadDocumentAction";
import Link from "next/link";

type QuickActionsCardProps = {
  workspaceId: string;
};

const actions = [

  {
    label: "Open AI Chat",
    description: "Ask questions from docs",
    icon: "💬",
    hrefType: "chat",
  },
  {
    label: "View All Documents",
    description: "Manage uploaded files",
    icon: "📄",
    hrefType: "documents",
  },
] as const;

export function QuickActionsCard({ workspaceId }: QuickActionsCardProps) {
  return (
    <aside className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-950">
            Quick Actions
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Common workspace tasks
          </p>
        </div>

        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-500">
          3
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
         <UploadDocumentAction workspaceId={workspaceId} />
        {actions.map((action) => {
          const href =
            action.hrefType === "chat"
              ? `/workspaces/${workspaceId}/chat`
              : `/workspaces/${workspaceId}/documents`;

          return (
            <Link
              key={action.label}
              href={href}
              className="group w-full flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-white hover:shadow-md"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm text-[#0E5B48] shadow-sm transition group-hover:bg-[#0E5B48] group-hover:text-white">
                  {action.icon}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-950">
                    {action.label}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {action.description}
                  </p>
                </div>
              </div>

             <span className="shrink-0 text-sm font-semibold text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#0E5B48]">
  →
</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}