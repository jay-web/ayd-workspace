export default function ChatSourcesPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      {children}
    </div>
  );
}