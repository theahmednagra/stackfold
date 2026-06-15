import { NextResponse } from "next/server";

export async function POST() {
  // Clear the token cookie
  const response = NextResponse.json({ success: true, message: "Signed out successfully" });

  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    maxAge: 0, // expire immediately
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
