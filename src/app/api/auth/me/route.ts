import { getSession } from "@/lib/auth/getSession";
import { upsertUser } from "@/modules/users/user.repo";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  if (!session.email) {
    return NextResponse.json(
      { error: "Session email is missing" },
      { status: 400 },
    );
  }

  await upsertUser({
    userId: session.userId,
    email: session.email,
  });

  return NextResponse.json({
    user: {
      email: session.email,
      userId: session.userId,
    },
  });
}
