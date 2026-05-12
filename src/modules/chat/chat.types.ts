export type ChatMessageRole = "USER" | "ASSISTANT";

export type ChatCitation = {
  documentId?: string;
  pageNumber?: number;
  chunkId?: string;
  text?: string;
  source?: string;
};

export type ChatMessageItem = {
  pk: string;
  sk: string;
  workspaceId: string;
  documentId: string;
  messageId: string;
  role: ChatMessageRole;
  content: string;
  citations?: ChatCitation[];
  createdAt: string;
};

export type ChatMessage = {
  workspaceId: string;
  documentId: string;
  messageId: string;
  role: ChatMessageRole;
  content: string;
  citations?: ChatCitation[];
  createdAt: string;
};

export type CreateChatMessageInput = {
  workspaceId: string;
  documentId: string;
  role: ChatMessageRole;
  content: string;
  citations?: ChatCitation[];
};