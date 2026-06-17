import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user.model";
import { generateVerificationData } from "@/utils/generateVerificationData";
import { sendVerificationEmail } from "@/services/email.service";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const body = await req.json();
        const { email } = body;

        // 1. Basic validation presence check
        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json(
                { message: "A valid email address is required." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 2. Locate User record in MongoDB
        const user = await User.findOne({ email: normalizedEmail });

        // 3. SECURE USER PRIVACY INTERCEPTOR
        // If user doesn't exist, we return a fake success response. 
        // This stops attackers from harvesting registered email addresses.
        if (!user) {
            return NextResponse.json(
                { message: "Verification code sent. Check your email." },
                { status: 200 }
            );
        }

        // 4. Block verified users from generating extra overhead
        if (user.isVerified) {
            return NextResponse.json(
                { message: "This account has already been verified. Please sign in." },
                { status: 400 }
            );
        }

        // 5. Generate fresh validation keys
        const { code, expiry } = generateVerificationData();

        // 6. Overwrite old code blocks inside document parameters
        user.verificationCode = code;
        user.verificationCodeExpiry = expiry;
        await user.save();

        // 7. Non-blocking Asynchronous Background Email Execution
        sendVerificationEmail(user.email, code).catch((err) =>
            console.error("Critical: Resend email dispatch failure:", err)
        );

        // 8. Return explicit clean status
        return NextResponse.json(
            { message: "Verification code sent. Check your email." },
            { status: 200 }
        );

    } catch (error) {
        console.error("CRITICAL RESEND VERIFICATION EXCEPTION:", error);
        return NextResponse.json(
            { message: "Internal server error encountered while recycling verification tokens." },
            { status: 500 }
        );
    }
}

// Stub mock function for your mail delivery agent service (Nodemailer, Resend, etc.)
async function sendVerificationMail(email: string, code: string) {
    console.log(`[EMAIL DISPATCH SYSTEM] -> fresh Token [${code}] resent out to target inbox: ${email}`);
}