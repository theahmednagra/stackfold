import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // 1. Fetch the server-side cookie store instance
    const cookieStore = await cookies();

    // 2. Clear the token by setting its maxAge to 0 and wiping the payload
    cookieStore.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Tells the browser to expire and delete the cookie instantly
      path: "/", // Must match the exact path path used when it was set
    });

    // 3. Return unified success confirmation response
    return NextResponse.json(
      { message: "Signed out successfully." },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("CRITICAL SIGNOUT ROUTE EXCEPTION:", error);
    return NextResponse.json(
      { message: "Internal server error encountered during session termination procedures." },
      { status: 500 }
    );
  }
}