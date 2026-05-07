import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/getSession";
import {
  addWorkspaceMember,
  isWorkspaceMember,
  isWorkspaceOwner,
  listWorkspaceMembers,
} from "@/modules/workspace/workspace.dynamo.repo";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

type RouteContext = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getSession(req);

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  const currentUserIsOwner = await isWorkspaceOwner({
    workspaceId,
    userId: session.userId,
  });
  if (!currentUserIsOwner) {
    return NextResponse.json(
      { error: "Only workspace owner can add members" },
      { status: 403 },
    );
  }

  const body = await req.json();

  const userId = body.userId;
  const role = body.role;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (role !== "EDITOR" && role !== "VIEWER") {
    return NextResponse.json(
      { error: "role must be EDITOR or VIEWER" },
      { status: 400 },
    );
  }

  try {
    const member = await addWorkspaceMember({
      workspaceId,
      userId,
      role,
    });

    return NextResponse.json(
      {
        message: "member added",
        member,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return NextResponse.json(
        { error: "User is already a member of this workspace" },
        { status: 409 },
      );
    }

    console.error("workspace.member.add.failed", error);

    return NextResponse.json(
      { error: "Failed to add workspace member" },
      { status: 500 },
    );
  }
}


export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = await getSession(req);

  if (!session?.userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { workspaceId } = await params;

  const currentUserIsMember = await isWorkspaceMember({
    workspaceId,
    userId: session.userId,
  });

  if (!currentUserIsMember) {
    return NextResponse.json(
      { error: "You are not a member of this workspace" },
      { status: 403 }
    );
  }

  const members = await listWorkspaceMembers(workspaceId);

  return NextResponse.json({
    members,
  });
}