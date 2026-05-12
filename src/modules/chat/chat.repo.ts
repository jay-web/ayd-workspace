import { PutCommand, QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

import { dynamo } from "@/lib/aws/dynamodb";
import { dynamoTables } from "@/lib/aws/dynamodb.tables";
import {
  ChatMessage,
  ChatMessageItem,
  CreateChatMessageInput,
} from "./chat.types";

function chatMessagePk(workspaceId: string, documentId: string) {
  return `WORKSPACE#${workspaceId}#DOCUMENT#${documentId}`;
}

function chatMessageSk(createdAt: string, messageId: string) {
  return `MESSAGE#${createdAt}#${messageId}`;
}

function toChatMessage(item: ChatMessageItem): ChatMessage {
  return {
    workspaceId: item.workspaceId,
    documentId: item.documentId,
    messageId: item.messageId,
    role: item.role,
    content: item.content,
    citations: item.citations ?? [],
    createdAt: item.createdAt,
  };
}

export async function listChatMessages(
  workspaceId: string,
  documentId: string
): Promise<ChatMessage[]> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: dynamoTables.chatMessages,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": chatMessagePk(workspaceId, documentId),
      },
      ScanIndexForward: true,
    })
  );

  return ((result.Items ?? []) as ChatMessageItem[]).map(toChatMessage);
}

export async function createChatMessage(
  input: CreateChatMessageInput
): Promise<ChatMessage> {
  const now = new Date().toISOString();
  const messageId = randomUUID();

  const item: ChatMessageItem = {
    pk: chatMessagePk(input.workspaceId, input.documentId),
    sk: chatMessageSk(now, messageId),
    workspaceId: input.workspaceId,
    documentId: input.documentId,
    messageId,
    role: input.role,
    content: input.content,
    citations: input.citations ?? [],
    createdAt: now,
  };

  await dynamo.send(
    new PutCommand({
      TableName: dynamoTables.chatMessages,
      Item: item,
      ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)",
    })
  );

  return toChatMessage(item);
}

export async function deleteChatMessagesByDocument(
  workspaceId: string,
  documentId: string
): Promise<void> {
  const pk = chatMessagePk(workspaceId, documentId);

  const result = await dynamo.send(
    new QueryCommand({
      TableName: dynamoTables.chatMessages,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": pk,
      },
      ProjectionExpression: "pk, sk",
    })
  );

  const items = result.Items ?? [];

  if (items.length === 0) {
    return;
  }

  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);

    await dynamo.send(
      new BatchWriteCommand({
        RequestItems: {
          [dynamoTables.chatMessages]: batch.map((item) => ({
            DeleteRequest: {
              Key: {
                pk: item.pk,
                sk: item.sk,
              },
            },
          })),
        },
      })
    );
  }
}