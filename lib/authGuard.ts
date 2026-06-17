import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface DecodedSession {
    userId: string;
    username: string;
}

/**
 * Reusable server-side authentication guard.
 * Extracts, verifies, and returns the active user session data.
 * * @returns {DecodedSession} The verified session payload data
 * @throws {Error} An error containing a specific HTTP status code if validation fails
 */
export async function verifySession(): Promise<DecodedSession> {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("accessToken");

    // Case 1: Missing Token Cookie
    if (!tokenCookie || !tokenCookie.value) {
        const error = new Error("Unauthorized: Missing session token.");
        (error as any).status = 401;
        throw error;
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error("System Configuration Error: JWT_SECRET environment variable is missing.");
    }

    // Case 2: Validate JWT Cryptographic Integrity
    try {
        const decoded = jwt.verify(tokenCookie.value, secretKey) as DecodedSession;
        return decoded;
    } catch (jwtError) {
        const error = new Error("Unauthorized: Session has expired or is corrupt.");
        (error as any).status = 401;
        throw error;
    }
}