import { NextRequest } from "next/server";
import { verifyToken } from "./verifyToken";

export async function getSession(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);

  if (!payload) return null;

  return {
    userId: payload.sub,
    email: payload.email,
    payload,
  };
}