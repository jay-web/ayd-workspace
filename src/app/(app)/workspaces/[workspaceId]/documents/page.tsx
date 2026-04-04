type WorkspaceDocumentsPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceDocumentsPage({
  params,
}: WorkspaceDocumentsPageProps) {
  const { workspaceId } = await params;

  return (
    <section>
      <h2 className="text-5xl font-bold text-slate-900">Documents</h2>
      <p className="mt-6 text-2xl text-slate-600">
        Documents for workspace: {workspaceId}
      </p>
    </section>
  );
}