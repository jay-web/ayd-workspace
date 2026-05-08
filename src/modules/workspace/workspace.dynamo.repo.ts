import { GetCommand, PutCommand, QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

import { randomUUID } from "crypto";

import { dynamo } from "@/lib/aws/dynamodb";

import {
    dynamoIndexes,
  dynamoTables,
  workspaceKey,
  workspaceMemberKey,
} from "@/lib/aws/dynamodb.tables";
import { deleteDocumentsByWorkspace } from "../documents/document.dynamo.repo";
import { deleteS3Objects } from "@/lib/aws/s3";
import { deleteVectorsByKeys } from "@/lib/vector/searchVectors";

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
  email?: string;
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
    memberships.map(async (membership) => {
      const workspace = await getWorkspaceById(membership.workspaceId);

      if (!workspace) {
        return null;
      }

      return {
        ...workspace,
        role: membership.role,
        joinedAt: membership.joinedAt,
      };
    })
  );

  return workspaces.filter(Boolean);
}

export async function addWorkspaceMember(input: {
  workspaceId: string;
  userId: string;
  email?: string;
  role: Exclude<WorkspaceRole, "OWNER">;
}) {
  const now = new Date().toISOString();

const member: WorkspaceMemberItem = {
  workspaceId: input.workspaceId,
  userId: input.userId,
  ...(input.email ? { email: input.email } : {}),
  role: input.role,
  joinedAt: now,
};

  await dynamo.send(
    new PutCommand({
      TableName: dynamoTables.workspaceMembers,
      Item: member,
      ConditionExpression:
        "attribute_not_exists(workspaceId) AND attribute_not_exists(userId)",
    })
  );

  return member;
}

export async function getWorkspaceMember(input: {
  workspaceId: string;
  userId: string;
}) {
  const result = await dynamo.send(
    new GetCommand({
      TableName: dynamoTables.workspaceMembers,
      Key: workspaceMemberKey(input.workspaceId, input.userId),
    })
  );

  return (result.Item as WorkspaceMemberItem | undefined) ?? null;
}

export async function isWorkspaceOwner(input: {
  workspaceId: string;
  userId: string;
}) {
  const member = await getWorkspaceMember({
    workspaceId: input.workspaceId,
    userId: input.userId,
  });

  return member?.role === "OWNER";
}

export async function listWorkspaceMembers(workspaceId: string) {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: dynamoTables.workspaceMembers,
      KeyConditionExpression: "workspaceId = :workspaceId",
      ExpressionAttributeValues: {
        ":workspaceId": workspaceId,
      },
    })
  );

  return (result.Items ?? []) as WorkspaceMemberItem[];
}

export async function deleteWorkspace(workspaceId: string) {
  const deletedDocuments = await deleteDocumentsByWorkspace(workspaceId);

  await deleteVectorsByKeys(deletedDocuments.vectorKeys);

  await deleteS3Objects(
  process.env.S3_BUCKET_NAME!,
  deletedDocuments.storageKeys
);

  const members = await listWorkspaceMembers(workspaceId);

  await dynamo.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Delete: {
            TableName: dynamoTables.workspaces,
            Key: workspaceKey(workspaceId),
          },
        },
        ...members.map((member) => ({
          Delete: {
            TableName: dynamoTables.workspaceMembers,
            Key: workspaceMemberKey(member.workspaceId, member.userId),
          },
        })),
      ],
    })
  );

  return {
    deletedWorkspaceId: workspaceId,
    deletedDocumentsCount: deletedDocuments.deletedDocumentsCount,
    vectorKeys: deletedDocuments.vectorKeys,
    storageKeys: deletedDocuments.storageKeys,
  };
}