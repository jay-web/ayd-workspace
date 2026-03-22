import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const codeVerifier = request.cookies.get("pkce_code_verifier")?.value;

  const cognitoDomain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const redirectUri = process.env.COGNITO_REDIRECT_URI;

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  if (!codeVerifier) {
    return NextResponse.json(
      { error: "Missing PKCE code verifier" },
      { status: 400 }
    );
  }

  if (!cognitoDomain || !clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing Cognito environment variables" },
      { status: 500 }
    );
  }

  const tokenUrl = `${cognitoDomain}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const tokenData = await tokenResponse.json();
 if (!tokenResponse.ok) {
    return NextResponse.json(tokenData, {
      status: tokenResponse.status,
    });
  }

   const idToken = tokenData.id_token;
    const response = NextResponse.redirect("http://localhost:3000/dashboard");

      // 🍪 Store session (ID token)
  response.cookies.set("session", idToken, {
    httpOnly: true,
    secure: true,
    path: "/",
     sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
  });

    if (tokenData.refresh_token) {
    response.cookies.set("refresh_token", tokenData.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }

    response.cookies.delete("pkce_code_verifier");

    return response;
}