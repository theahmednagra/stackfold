import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user.model";

export async function GET(req: NextRequest) {
    try {
        // 1. Extract the cookie container state
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("accessToken");

        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json(
                { message: "Authentication session token required." },
                { status: 401 }
            );
        }

        // 2. Decode session values securely
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("Missing structural configuration: JWT_SECRET environment variable is undefined.");
        }

        let decodedPayload: any;
        try {
            decodedPayload = jwt.verify(tokenCookie.value, secretKey);
        } catch (jwtError) {
            return NextResponse.json(
                { message: "Session expired or invalid token authentication." },
                { status: 401 }
            );
        }

        // 3. Mount database session context
        await connectToDatabase();

        // 4. Retrieve matching identity profile (Explicitly drop sensitive system keys)
        const user = await User.findById(decodedPayload.userId).select(
            "-passwordHash -verificationCode -verificationCodeExpiry"
        );

        if (!user) {
            return NextResponse.json(
                { message: "User identity tracking reference could not be localized." },
                { status: 404 }
            );
        }

        // 5. Return standardized secure response profile attributes
        return NextResponse.json(
            {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isVerified: user.isVerified,
                },
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("CRITICAL GET_MY_INFO ROUTE EXCEPTION:", error);
        return NextResponse.json(
            { message: "Internal server error encountered while resolving session profiling variables." },
            { status: 500 }
        );
    }
}