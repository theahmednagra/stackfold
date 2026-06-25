import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user.model";
import { authFormSchema } from "@/schemas/auth.schema";

// A fallback placeholder hash used to mitigate timing analysis attacks
const DUMMY_HASH = "$2b$10$K9R6FmH1Kq9tXbZ7hR5eOuG4vK3n2m1l0o9p8q7r6s5t4u3v2w1x2";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const body = await req.json();

        // 1. Server-Side Zod Check (Forcing signin rule matrix execution)
        const validation = authFormSchema.safeParse({ ...body });

        if (!validation.success) {
            return NextResponse.json(
                { message: "Invalid payload parameters.", errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;
        const normalizedEmail = email.toLowerCase();

        // 2. Query User Entity Record from MongoDB
        const user = await User.findOne({ email: normalizedEmail });

        // 3. TIMING-ATTACK SAFEGUARD & EXISTENCE MATRIX
        if (!user) {
            // Execute a fake password comparison to consume identical server processing cycles
            await bcrypt.compare(password!, DUMMY_HASH);

            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // 4. SCALABILITY CHECK: Social Account Account Guard
        if (!user.passwordHash) {
            return NextResponse.json(
                { message: "This account registered using an alternate login method. Please authenticate via social provider link." },
                { status: 400 }
            );
        }

        // 5. CREDENTIAL EVALUATION
        const isPasswordValid = await bcrypt.compare(password!, user.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // 6. UNVERIFIED ACCOUNT INTERCEPTOR
        if (!user.isVerified) {
            return NextResponse.json(
                {
                    code: "NOT_VERIFIED",
                    message: "Please complete account registration verification before signing in."
                },
                { status: 403 }
            );
        }

        // 7. JWT PROVISIONING
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("Missing structural configuration: JWT_SECRET variable environment assignment is undefined.");
        }

        const sessionPayload = {
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
        };

        const token = jwt.sign(sessionPayload, secretKey, { expiresIn: "7d" });

        // 8. NEXT.JS NATIVE COOKIE INJECTION LAYER
        const cookieStore = await cookies();
        cookieStore.set("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: "/",
        });

        // 9. RETURN UNIFIED SUCCESS SPECIFICATION
        return NextResponse.json(
            {
                message: "Signin successful",
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
        console.error("CRITICAL SIGNIN ROUTE EXCEPTION:", error);
        return NextResponse.json(
            { message: "Internal server error encountered while verifying identification attributes." },
            { status: 500 }
        );
    }
}