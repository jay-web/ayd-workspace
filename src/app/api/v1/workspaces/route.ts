import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth/getSession";
import {
  createWorkspaceWithMembership,
  listWorkspacesForUser,
} from "@/modules/workspace/workspace.repo";

export async function POST(request: NextRequest) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid or missing JSON body" },
      { status: 400 }
    );
  }

  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json(
      { error: "Workspace name is required" },
      { status: 400 }
    );
  }

  const session = await getSession(request);

  if (!session || !session.userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const workspaceId = randomUUID();

  try {
    const result = await createWorkspaceWithMembership({
      id: workspaceId,
      name,
      ownerUserId: session.userId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "Workspace with this name already exists" },
        { status: 409 }
      );
    }

    console.error("Failed to create workspace:", error);

    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session || !session.userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const workspaces = await listWorkspacesForUser(session.userId);

    return NextResponse.json({ workspaces }, { status: 200 });
  } catch (error) {
    console.error("Failed to list workspaces:", error);

    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}