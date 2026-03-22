import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const cognitoDomain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;

  if (!refreshToken || !cognitoDomain || !clientId) {
    return NextResponse.json({ error: "Missing refresh setup" }, { status: 401 });
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const tokenRes = await fetch(`${cognitoDomain}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!tokenRes.ok) {
    const response = NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    response.cookies.delete("session");
    response.cookies.delete("refresh_token");
    return response;
  }

  const tokenData = await tokenRes.json();

  const response = NextResponse.json({ ok: true });

  if (tokenData.id_token) {
    response.cookies.set("session", tokenData.id_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }

  if (tokenData.refresh_token) {
    response.cookies.set("refresh_token", tokenData.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}