export const dynamoTables = {
  workspaces:
    process.env.DYNAMODB_WORKSPACES_TABLE_NAME ?? "ayd_workspaces",

  workspaceMembers:
    process.env.DYNAMODB_WORKSPACE_MEMBERS_TABLE_NAME ??
    "ayd_workspace_members",

  documents:
    process.env.DYNAMODB_DOCUMENTS_TABLE_NAME ?? "ayd_documents",
} as const;



export const dynamoIndexes = {
  userWorkspaces: "UserWorkspacesIndex",
  documentStorageKey: "DocumentStorageKeyIndex",
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

