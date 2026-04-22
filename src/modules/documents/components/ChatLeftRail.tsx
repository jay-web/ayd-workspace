type ChatLeftRailProps = {
  activeTab?: "dashboard" | "documents" | "chat";
};

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "⊞" },
  { key: "documents", label: "Documents", icon: "▤" },
  { key: "chat", label: "Chat", icon: "◱" },
] as const;

export default function ChatLeftRail({
  activeTab = "chat",
}: ChatLeftRailProps) {
  return (
    <aside className="flex h-[calc(100vh-118px)] w-[320px] flex-col rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 px-8 pt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
          Workspace
        </p>
      </div>

      <nav className="shrink-0 px-5 pt-8">
        <div className="space-y-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeTab;

            return (
              <button
                key={item.key}
                type="button"
                className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto px-5 pb-5">
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white px-5 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-lg font-semibold text-white">
            J
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              Jay
            </p>
            <p className="truncate text-sm text-slate-500">
              Workspace owner
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}