import { NextRequest } from "next/server";
import { Session } from "./auth.types";
import { resolveSessionFromCookieHeader } from "./resolveSessionFromCookieHeader";

export async function getSession(req: NextRequest): Promise<Session | null> {
  const cookieHeader = req.headers.get("cookie") || "";
  return resolveSessionFromCookieHeader(cookieHeader);
}