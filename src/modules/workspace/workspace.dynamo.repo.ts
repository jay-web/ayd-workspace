import { GetCommand, QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

import { randomUUID } from "crypto";

import { dynamo } from "@/lib/aws/dynamodb";

import {
    dynamoIndexes,
  dynamoTables,
  workspaceKey,
  workspaceMemberKey,
} from "@/lib/aws/dynamodb.tables";

export type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";

export type WorkspaceItem = {
  workspaceId: string;
  name: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMemberItem = {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
};

export async function createWorkspace(input: {
  name: string;
  ownerUserId: string;
}) {
  const workspaceId = randomUUID();
  const now = new Date().toISOString();

  const workspace: WorkspaceItem = {
    workspaceId,
    name: input.name,
    ownerUserId: input.ownerUserId,
    createdAt: now,
    updatedAt: now,
  };

  const ownerMembership: WorkspaceMemberItem = {
    workspaceId,
    userId: input.ownerUserId,
    role: "OWNER",
    joinedAt: now,
  };

  await dynamo.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: dynamoTables.workspaces,
            Item: workspace,
            ConditionExpression: "attribute_not_exists(workspaceId)",
          },
        },
        {
          Put: {
            TableName: dynamoTables.workspaceMembers,
            Item: ownerMembership,
            ConditionExpression:
              "attribute_not_exists(workspaceId) AND attribute_not_exists(userId)",
          },
        },
      ],
    })
  );

  return workspace;
}

export async function getWorkspaceById(workspaceId: string) {
  const result = await dynamo.send(
    new GetCommand({
      TableName: dynamoTables.workspaces,
      Key: workspaceKey(workspaceId),
    })
  );

  return (result.Item as WorkspaceItem | undefined) ?? null;
}

export async function isWorkspaceMember(input: {
  workspaceId: string;
  userId: string;
}) {
  const result = await dynamo.send(
    new GetCommand({
      TableName: dynamoTables.workspaceMembers,
      Key: workspaceMemberKey(input.workspaceId, input.userId),
    })
  );

  return Boolean(result.Item);
}

export async function listWorkspacesForUser(userId: string) {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: dynamoTables.workspaceMembers,
      IndexName: dynamoIndexes.userWorkspaces,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ScanIndexForward: false,
    })
  );

  const memberships = (result.Items ?? []) as WorkspaceMemberItem[];

  if (memberships.length === 0) {
    return [];
  }

  const workspaces = await Promise.all(
    memberships.map((membership) =>
      getWorkspaceById(membership.workspaceId)
    )
  );

  return workspaces.filter((workspace): workspace is WorkspaceItem =>
    Boolean(workspace)
  );
}