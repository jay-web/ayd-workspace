type WorkspaceChatPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceChatPage({
  params,
}: WorkspaceChatPageProps) {
  const { workspaceId } = await params;

  return (
    <section>
      <h2 className="text-5xl font-bold text-slate-900">Chat</h2>
      <p className="mt-6 text-2xl text-slate-600">
        Chat for workspace: {workspaceId}
      </p>
    </section>
  );
}