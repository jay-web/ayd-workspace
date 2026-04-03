import { NextResponse } from "next/server";
import { db } from "@/lib/db/postgres";

export async function GET() {
  const result = await db.query(`
    SELECT id, name, owner_user_id, created_at
    FROM workspaces
    ORDER BY created_at DESC
  `);

  return NextResponse.json({
    ok: true,
    workspaces: result.rows,
  });
}