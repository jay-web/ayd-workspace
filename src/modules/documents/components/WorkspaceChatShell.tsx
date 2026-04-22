type WorkspaceChatShellProps = {
  sidebar: React.ReactNode;
  conversation: React.ReactNode;
  sources: React.ReactNode;
};

export default function WorkspaceChatShell({
  sidebar,
  conversation,
  sources,
}: WorkspaceChatShellProps) {
  return (
    <section className="grid h-[calc(100vh-118px)] grid-cols-[320px_minmax(720px,1fr)_340px] gap-6">
      <aside className="min-h-0">{sidebar}</aside>
      <main className="min-h-0">{conversation}</main>
      <aside className="min-h-0">{sources}</aside>
    </section>
  );
}