import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { dynamo } from "@/lib/aws/dynamodb";
import {
  documentKey,
  dynamoIndexes,
  dynamoTables,
} from "@/lib/aws/dynamodb.tables";
import { DocumentStatus } from "@/contracts/document";
import { CreateDocumentInput, DocumentItem,DocumentStats } from "./document.types";

export async function createDocument(input: CreateDocumentInput) {
  const now = new Date().toISOString();

  const document: DocumentItem = {
    documentId: input.documentId,
    workspaceId: input.workspaceId,
    name: input.name,
    originalFileName: input.originalFileName,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    storageKey: input.storageKey,
    uploadedBy: input.uploadedBy,
    status: input.status ?? "UPLOADING",
    errorMessage: null,
    ingestedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await dynamo.send(
    new PutCommand({
      TableName: dynamoTables.documents,
      Item: document,
      ConditionExpression:
        "attribute_not_exists(workspaceId) AND attribute_not_exists(documentId)",
    })
  );

  return document;
}

export async function getDocumentById(input: {
  workspaceId: string;
  documentId: string;
}) {
  const result = await dynamo.send(
    new GetCommand({
      TableName: dynamoTables.documents,
      Key: documentKey(input.workspaceId, input.documentId),
    })
  );

  return (result.Item as DocumentItem | undefined) ?? null;
}

export async function listDocumentsByWorkspace(workspaceId: string) {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: dynamoTables.documents,
      KeyConditionExpression: "workspaceId = :workspaceId",
      ExpressionAttributeValues: {
        ":workspaceId": workspaceId,
      },
      ScanIndexForward: false,
    })
  );

  return (result.Items ?? []) as DocumentItem[];
}

export async function updateDocumentStatus(input: {
  workspaceId: string;
  documentId: string;
  status: DocumentStatus;
  errorMessage?: string | null;
}) {
  const now = new Date().toISOString();
  const ingestedAt = input.status === "READY" ? now : null;

  const result = await dynamo.send(
    new UpdateCommand({
      TableName: dynamoTables.documents,
      Key: documentKey(input.workspaceId, input.documentId),
      UpdateExpression:
        "SET #status = :status, errorMessage = :errorMessage, ingestedAt = :ingestedAt, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": input.status,
        ":errorMessage": input.errorMessage ?? null,
        ":ingestedAt": ingestedAt,
        ":updatedAt": now,
      },
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as DocumentItem;
}


export async function getDocumentByStorageKey(storageKey: string) {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: dynamoTables.documents,
      IndexName: dynamoIndexes.documentStorageKey,
      KeyConditionExpression: "storageKey = :storageKey",
      ExpressionAttributeValues: {
        ":storageKey": storageKey,
      },
      Limit: 1,
    })
  );

  const [document] = (result.Items ?? []) as DocumentItem[];

  return document ?? null;
}
export async function getDocumentStatsByWorkspace(
  workspaceId: string
): Promise<DocumentStats> {
  const documents = await listDocumentsByWorkspace(workspaceId);

  return documents.reduce(
    (stats, document) => {
      stats.totalDocuments += 1;

      if (document.status === "UPLOADING") {
        stats.uploadingDocuments += 1;
      }

      if (document.status === "PROCESSING") {
        stats.processingDocuments += 1;
      }

      if (document.status === "READY") {
        stats.readyDocuments += 1;
      }

      if (document.status === "FAILED") {
        stats.failedDocuments += 1;
      }

      return stats;
    },
    {
      totalDocuments: 0,
      uploadingDocuments: 0,
      processingDocuments: 0,
      readyDocuments: 0,
      failedDocuments: 0,
    }
  );
}