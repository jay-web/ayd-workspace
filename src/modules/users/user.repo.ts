import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { dynamo } from "@/lib/aws/dynamodb";
import { dynamoIndexes, dynamoTables } from "@/lib/aws/dynamodb.tables";

export type UserItem = {
  userId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export async function upsertUser(input: {
  userId: string;
  email: string;
}) {
  const now = new Date().toISOString();
  const email = input.email.trim().toLowerCase();

  const user: UserItem = {
    userId: input.userId,
    email,
    createdAt: now,
    updatedAt: now,
  };

  await dynamo.send(
    new PutCommand({
      TableName: dynamoTables.users,
      Item: user,
    })
  );

  return user;
}

export async function getUserByEmail(emailInput: string) {
  const email = emailInput.trim().toLowerCase();

  const result = await dynamo.send(
    new QueryCommand({
      TableName: dynamoTables.users,
      IndexName: dynamoIndexes.userEmail,
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
      Limit: 1,
    })
  );

  return (result.Items?.[0] as UserItem | undefined) ?? null;
}