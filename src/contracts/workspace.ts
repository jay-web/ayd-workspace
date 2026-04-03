export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Workspace {
  workspaceId: string;
  name: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceListItem {
  workspaceId: string;
  name: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
}

export interface CreateWorkspaceResponse {
  workspace: Workspace;
  membership: {
    role: WorkspaceRole;
    joinedAt: string;
  };
}

export interface GetWorkspaceResponse {
  workspace: Workspace & {
    role: WorkspaceRole;
    joinedAt: string;
  };
}

export interface ListWorkspacesResponse {
  workspaces: WorkspaceListItem[];
}