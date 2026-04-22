import WorkspaceChatContainer from "@/modules/documents/components/WorkspaceChatContainer";
import { listDocumentsByWorkspace } from "@/modules/documents/document.repo";

type WorkspaceChatPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceChatPage({
  params,
}: WorkspaceChatPageProps) {
  const { workspaceId } = await params;
  const documents = await listDocumentsByWorkspace(workspaceId);

  return (
    <WorkspaceChatContainer
      workspaceId={workspaceId}
      documents={documents.filter((doc) => doc.status === "READY")}
    />
  );
}