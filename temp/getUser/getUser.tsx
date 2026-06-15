// lib/getAuthenticatedUser.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { User } from "@/models/User.models";
import dbConnect from "@/lib/dbConnect";

// Helper to get authenticated user from JWT token
export async function getAuthenticatedUser() {
  await dbConnect();

  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      username: string;
      isVerified: boolean;
    };

    // Fetch user from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isVerified) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}