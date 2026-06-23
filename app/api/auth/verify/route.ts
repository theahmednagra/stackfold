import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user.model";
import { authFormSchema } from "@/schemas/authSchema";
import { Info } from "@/models/info.model";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const body = await req.json();

        // 1. Validate payload structure using our shared Zod schema
        const validation = authFormSchema.safeParse({ ...body });

        if (!validation.success) {
            return NextResponse.json(
                { message: "Invalid payload parameters.", errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, code } = validation.data;
        const normalizedEmail = email!.toLowerCase();

        // 2. Locate User document in MongoDB
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return NextResponse.json(
                { message: "User account not found." },
                { status: 404 }
            );
        }

        // 3. Prevent multi-verification attempts
        if (user.isVerified) {
            return NextResponse.json(
                { message: "Account already verified. Please sign in." },
                { status: 400 }
            );
        }

        // 4. Verification Token Match Check
        if (user.verificationCode !== code) {
            return NextResponse.json(
                { message: "Invalid verification code." },
                { status: 400 }
            );
        }

        // 5. Code Expiration Window Check
        if (!user.verificationCodeExpiry || user.verificationCodeExpiry.getTime() < Date.now()) {
            return NextResponse.json(
                { message: "Verification code has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // 6. Persist Activation State & Clear OTP Tokens in Database
        user.isVerified = true;
        user.verificationCode = "";
        user.verificationCodeExpiry = undefined;

        await user.save();

        await Info.create();

        // 7. AUTO-LOGIN: Provision Secure Session JWT
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("Missing structural configuration: JWT_SECRET environment variable is undefined.");
        }

        const sessionPayload = {
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
        };

        const token = jwt.sign(sessionPayload, secretKey, { expiresIn: "7d" });

        // 8. Inject Server-Side HTTP-Only Session Cookie
        const cookieStore = await cookies();
        cookieStore.set("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: "/",
        });

        // 9. Unified Success Payload Response
        return NextResponse.json(
            {
                message: "Account verified and authenticated successfully.",
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
        console.error("CRITICAL VERIFICATION ROUTE EXCEPTION:", error);
        return NextResponse.json(
            { message: "Internal server error encountered while executing activation procedures." },
            { status: 500 }
        );
    }
}