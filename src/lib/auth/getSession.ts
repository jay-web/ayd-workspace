import { NextRequest } from "next/server";
import { verifyToken } from "./verifyToken";

export async function getSession(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      return {
        userId: payload.sub,
        email: payload.email,
        payload,
      };
    }
  }
  
  const refreshToken = req.cookies.get("refresh")?.value;
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });

    if (!res.ok) return null;

    return { refreshed: true }; 
  } catch {
    return null;
  }

}