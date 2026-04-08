import { Session, SessionPayload } from "./auth.types";
import { verifyToken } from "./verifyToken";

function getCookieValue(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [rawKey, ...rest] = cookie.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

function buildSession(payload: unknown): Session | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const p = payload as Record<string, unknown>;
  const sub = p.sub;
  const email = p.email;

  if (typeof sub !== "string") {
    return null;
  }

  return {
    userId: sub,
    email: typeof email === "string" ? email : undefined,
    payload: p as SessionPayload,
  };
}

export async function resolveSessionFromCookieHeader(
  cookieHeader: string
): Promise<Session | null> {
  const token = getCookieValue(cookieHeader, "session");

  if (token) {
    const payload = await verifyToken(token);
    const session = buildSession(payload);

    if (session) {
      return session;
    }
  }

  const refreshToken = getCookieValue(cookieHeader, "refresh");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: cookieHeader,
      },
    });

    if (!res.ok) return null;

    const setCookieHeader = res.headers.get("set-cookie");
    if (!setCookieHeader) return null;

    const newSessionToken = getCookieValue(setCookieHeader, "session");
    if (!newSessionToken) return null;

    const refreshedPayload = await verifyToken(newSessionToken);
    return buildSession(refreshedPayload);
  } catch {
    return null;
  }
}