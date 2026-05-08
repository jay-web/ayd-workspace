import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import {
  deleteWorkspace,
  getWorkspaceById,
  isWorkspaceMember,
  getWorkspaceMember
} from "@/modules/workspace/workspace.dynamo.repo";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(request as any);

  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  try {
   const isMember = await isWorkspaceMember({workspaceId, userId: session.userId});

if (!isMember) {
  return NextResponse.json(
    { error: "Workspace not found" },
    { status: 404 }
  );
}

const workspace = await getWorkspaceById(workspaceId);

if (!workspace) {
  return NextResponse.json(
    { error: "Workspace not found" },
    { status: 404 }
  );
}

return NextResponse.json({ workspace });
  } catch (error) {
    console.error("Failed to fetch workspace:", error);

    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(request as any);

  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  try {
    const membership = await getWorkspaceMember({
      workspaceId,
      userId: session.userId,
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only workspace owners can delete workspaces" },
        { status: 403 }
      );
    }

    await deleteWorkspace(workspaceId);

    return NextResponse.json(
      { message: "Workspace deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete workspace:", error);

    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}