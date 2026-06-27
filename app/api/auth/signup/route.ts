import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateVerificationData } from "@/utils/generateVerificationData";
import { connectToDatabase } from "@/lib/db" // Path to your Mongoose connection utility
import { User } from "@/models/user.model"; // Path to your Mongoose User model
import { authFormSchema } from "@/schemas/auth.schema"; // Reusing our Zod schema
import { sendVerificationEmail } from "@/services/email.service";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // 1. Parse incoming body layers
        const body = await req.json();

        // 2. Validate data against our Zod schema
        // We override the mode parameter to enforce signup parsing validations explicitly
        const validation = authFormSchema.safeParse({ ...body });

        if (!validation.success) {
            return NextResponse.json(
                { message: "Validation error", errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password, username } = validation.data;
        const normalizedEmail = email.toLowerCase();

        // 3. Conflict Resolution Queries
        // Look for existing accounts occupying this email OR username
        const existingUserByEmail = await User.findOne({ email: normalizedEmail });
        const existingUserByUsername = await User.findOne({ username });

        // Scenario A: Email is taken by a fully verified/active account
        if (existingUserByEmail && existingUserByEmail.isVerified) {
            return NextResponse.json(
                { message: "An account with this email address already exists." },
                { status: 400 }
            );
        }

        // Scenario B: Username is taken by a different verified/active account
        if (existingUserByUsername && existingUserByUsername.isVerified) {
            return NextResponse.json(
                { message: "This username is already taken. Please choose another." },
                { status: 400 }
            );
        }

        // Scenario C: Username is taken by an unverified account, but a different email is trying to use it
        if (
            existingUserByUsername &&
            !existingUserByUsername.isVerified &&
            existingUserByUsername.email !== normalizedEmail
        ) {
            return NextResponse.json(
                { message: "This username is reserved for a pending registration." },
                { status: 400 }
            );
        }

        // 4. Encrypt credential parameters securely
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password!, saltRounds);

        // 5. Generate validation credentials
        const { code, expiry } = generateVerificationData();

        let user;

        // Scenario D: Unverified account recycling loop
        if (existingUserByEmail && !existingUserByEmail.isVerified) {
            existingUserByEmail.username = username;
            existingUserByEmail.passwordHash = passwordHash;
            existingUserByEmail.verificationCode = code;
            existingUserByEmail.verificationCodeExpiry = expiry;

            user = await existingUserByEmail.save();
        }
        // Scenario E: Brand new record instantiation
        else {
            user = await User.create({
                username,
                email: normalizedEmail,
                passwordHash,
                verificationCode: code,
                verificationCodeExpiry: expiry,
                isVerified: false,
            });
        }

        // 6. Asynchronous Background Task Execution
        // We run the email sender code in the background without using 'await',
        // preventing slow email APIs from delaying our server's response to the user.
        await sendVerificationEmail(user.email, code).catch((err) =>
            console.error("Critical: Verification email dispatch failure:", err)
        );

        // 7. Safe Unified JSON API Response Structure
        return NextResponse.json(
            {
                message: "Registration successful. Verification code dispatched.",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isVerified: user.isVerified,
                },
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("CRITICAL SIGNUP ROUTE EXCEPTION:", error);
        return NextResponse.json(
            { message: "Internal server error occurred while writing profile registration data." },
            { status: 500 }
        );
    }
}