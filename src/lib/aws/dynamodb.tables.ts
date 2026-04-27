export const dynamoTables = {
  workspaces:
    process.env.DYNAMODB_WORKSPACES_TABLE_NAME ?? "ayd-workspaces-dev",

  workspaceMembers:
    process.env.DYNAMODB_WORKSPACE_MEMBERS_TABLE_NAME ??
    "ayd-workspace-members-dev",

  documents:
    process.env.DYNAMODB_DOCUMENTS_TABLE_NAME ?? "ayd-documents-dev",
} as const;

export const dynamoIndexes = {
  userWorkspaces:
    process.env.DYNAMODB_USER_WORKSPACES_INDEX_NAME ?? "UserWorkspacesIndex",

  documentStorageKey:
    process.env.DYNAMODB_DOCUMENT_STORAGE_KEY_INDEX_NAME ??
    "DocumentStorageKeyIndex",
} as const;

export function workspaceKey(workspaceId: string) {
  return {
    workspaceId,
  };
}

export function workspaceMemberKey(workspaceId: string, userId: string) {
  return {
    workspaceId,
    userId,
  };
}

export function documentKey(workspaceId: string, documentId: string) {
  return {
    workspaceId,
    documentId,
  };
}