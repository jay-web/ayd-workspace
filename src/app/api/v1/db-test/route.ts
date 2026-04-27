import { NextResponse } from "next/server";
import {
  createWorkspace,
  listWorkspacesForUser,
} from "@/modules/workspace/workspace.dynamo.repo";

export async function GET() {
  const userId = "test-user-1";

  const workspace = await createWorkspace({
    name: "DynamoDB Test Workspace",
    ownerUserId: userId,
  });

  const workspaces = await listWorkspacesForUser(userId);

  return NextResponse.json({
    ok: true,
    message: "DynamoDB connection working",
    createdWorkspace: workspace,
    workspaces,
  });
}