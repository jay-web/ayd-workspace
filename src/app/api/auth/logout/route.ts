import { NextResponse } from "next/server";

export async function GET() {
  const cognitoDomain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const logoutRedirectUri = process.env.COGNITO_LOGOUT_REDIRECT_URI;

  if (!cognitoDomain || !clientId || !logoutRedirectUri) {
    return NextResponse.json(
      { error: "Missing logout environment variables" },
      { status: 500 }
    );
  }

  const logoutUrl =
    `${cognitoDomain}/logout` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&logout_uri=${encodeURIComponent(logoutRedirectUri)}`;

  const response = NextResponse.redirect(logoutUrl);

  response.cookies.set("session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set("refresh_token", "", {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  expires: new Date(0),
});

  return response;
}