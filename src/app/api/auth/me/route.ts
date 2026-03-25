import { getSession } from "@/lib/auth/getSession";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    const session = await getSession(request);
    if(!session){
        return NextResponse.json({user: null}, { status: 401 });
    }

    return NextResponse.json({ user: {
        email: session.email,
        userId: session.userId
    }});
}