import { WorkspaceRole } from "@/contracts/workspace";

export type WorkspaceRow = {
  workspaceId: string;
  name: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMembershipRow = {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
};

export type WorkspaceListItem = {
  workspaceId: string;
  name: string;
  role: WorkspaceRole;
  joinedAt: string;
};

export type WorkspaceDetails = {
  workspaceId: string;
  name: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
  role: WorkspaceRole;
  joinedAt: string;
};