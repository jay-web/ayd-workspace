type WorkspaceDashboardPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceDashboardPage({
  params,
}: WorkspaceDashboardPageProps) {
  const { workspaceId } = await params;

  return (
    <section>
      <h2 className="text-5xl font-bold text-slate-900">Dashboard</h2>
      <p className="mt-6 text-2xl text-slate-600">
        Welcome to workspace dashboard: {workspaceId}
      </p>
    </section>
  );
}