import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/postgres";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { documentId } = await params;
  const body = await req.json();

  const { status } = body;

  const allowedStatuses = ["UPLOADING", "UPLOADED", "PROCESSING", "READY", "FAILED"];

  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  const result = await db.query(
    `
      UPDATE documents
      SET status = $1,
          updated_at = NOW()
      WHERE document_id = $2
      RETURNING document_id
    `,
    [status, documentId]
  );

  if (result.rowCount === 0) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}