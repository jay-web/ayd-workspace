import { generateCodeChallenge, generateCodeVerifier } from "@/lib/pkce";
import { NextResponse } from "next/server";

export async function GET(){
    const cognitoDomain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const redirectUri = process.env.COGNITO_REDIRECT_URI;

   if (!cognitoDomain || !clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing Cognito environment variables" },
      { status: 500 }
    );
  }
  
 // 🔐 Step 1 — Generate PKCE
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // 🔐 Step 2 — Store verifier in cookie (temporary)
  const response = NextResponse.redirect(
    `${cognitoDomain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid+email+profile&code_challenge=${codeChallenge}&code_challenge_method=S256`
  );

  response.cookies.set("pkce_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 300, // 5 minutes
  });

  return response;
}