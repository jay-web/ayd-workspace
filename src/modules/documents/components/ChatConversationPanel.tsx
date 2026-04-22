export default function ChatConversationPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full min-h-0 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      {children}
    </div>
  );
}