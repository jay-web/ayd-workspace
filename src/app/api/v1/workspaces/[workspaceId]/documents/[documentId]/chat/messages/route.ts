import { NextRequest, NextResponse } from "next/server";

import {
  createChatMessage,
  listChatMessages,
} from "@/modules/chat/chat.repo";
import { getSession } from "@/lib/auth/getSession";
import { isWorkspaceMember } from "@/modules/workspace/workspace.dynamo.repo";

type RouteContext = {
  params: Promise<{
    workspaceId: string;
    documentId: string;
  }>;
};

const VALID_ROLES = new Set(["USER", "ASSISTANT"]);

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { workspaceId, documentId } = await params;

  const session = await getSession(req);

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isMember = await isWorkspaceMember({
    workspaceId,
    userId: session.userId,
  });

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await listChatMessages(workspaceId, documentId);

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { workspaceId, documentId } = await params;

  const session = await getSession(req);

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isMember = await isWorkspaceMember({
    workspaceId,
    userId: session.userId,
  });

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const { role, content, citations } = body;

  if (!VALID_ROLES.has(role)) {
    return NextResponse.json(
      { error: "Invalid message role" },
      { status: 400 }
    );
  }

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { error: "Message content is required" },
      { status: 400 }
    );
  }

  const message = await createChatMessage({
    workspaceId,
    documentId,
    role,
    content: content.trim(),
    citations: Array.isArray(citations) ? citations : [],
  });

  return NextResponse.json({ message });
}