import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";

export async function proxy(req: NextRequest) {
  const session = await getSession(req);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set(
  "redirect",
  `${req.nextUrl.pathname}${req.nextUrl.search}`
);

    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("session");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*"],
};