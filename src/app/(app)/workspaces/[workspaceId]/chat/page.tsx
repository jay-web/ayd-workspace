type WorkspaceChatPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceChatPage({
  params,
}: WorkspaceChatPageProps) {
  const { workspaceId } = await params;

  return (
    <section>
      <h2 className="text-3xl font-bold text-slate-900 sm:text-5xl">Chat</h2>
      <p className="mt-4 text-base text-slate-600 sm:text-2xl">
        Chat for workspace: {workspaceId}
      </p>
    </section>
  );
}