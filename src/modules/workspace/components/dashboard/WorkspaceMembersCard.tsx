type WorkspaceMember = {
  id: string;
  name: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  initials: string;
};

const members: WorkspaceMember[] = [
  {
    id: "1",
    name: "You",
    role: "OWNER",
    initials: "J",
  },
  {
    id: "2",
    name: "Nadine",
    role: "EDITOR",
    initials: "N",
  },
  {
    id: "3",
    name: "Alex",
    role: "VIEWER",
    initials: "A",
  },
];

export function WorkspaceMembersCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-950">
            Workspace Members
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            People with access to this workspace
          </p>
        </div>

        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-500">
          {members.length}
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5 transition hover:border-emerald-100 hover:bg-emerald-50/50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#0E5B48] shadow-sm">
                {member.initials}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-950">
                  {member.name}
                </p>
                <p className="text-xs text-gray-500">Workspace member</p>
              </div>
            </div>

            <RoleBadge role={member.role} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: WorkspaceMember["role"] }) {
  const styles =
    role === "OWNER"
      ? "bg-emerald-50 text-emerald-700"
      : role === "EDITOR"
        ? "bg-blue-50 text-blue-700"
        : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {role}
    </span>
  );
}