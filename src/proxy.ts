import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";

export async function proxy(req: NextRequest) {
  const session = await getSession(req);

  if (!session) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("session");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*"],
};