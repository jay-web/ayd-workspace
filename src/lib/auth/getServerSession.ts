import { cookies } from "next/headers";
import { Session } from "./auth.types";
import { resolveSessionFromCookieHeader } from "./resolveSessionFromCookieHeader";

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  return resolveSessionFromCookieHeader(cookieHeader);
}