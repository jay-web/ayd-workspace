import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const userPoolId = process.env.COGNITO_USER_POOL_ID!;
const region = process.env.COGNITO_REGION!;
const clientId = process.env.COGNITO_CLIENT_ID!;

const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

export type VerifiedToken = JWTPayload & {
  token_use?: "id" | "access";
};

export async function verifyToken(token: string): Promise<VerifiedToken | null> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: clientId,
    });

    const typed = payload as VerifiedToken;

    if (typed.token_use !== "id") return null;

    return typed;
  } catch {
    return null;
  }
}