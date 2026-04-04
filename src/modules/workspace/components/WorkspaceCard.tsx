import Link from "next/link";

type WorkspaceCardProps = {
  workspaceId: string;
  name: string;
  role: string;
  joinedAt: string;
};

export function WorkspaceCard({
  workspaceId,
  name,
  role,
  joinedAt,
}: WorkspaceCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="mt-1 text-sm text-gray-500">Role: {role}</p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          {role}
        </span>
      </div>

      <div className="mt-4 text-sm text-gray-500">Joined: {joinedAt}</div>

      <Link
        href={`/workspaces/${workspaceId}`}
        className="mt-5 inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        Open Workspace
      </Link>
    </div>
  );
}