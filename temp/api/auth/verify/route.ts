import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User.models";
import { verifyUserApiSchema } from "@/schemas/verifyUserApiSchema";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const body = await req.json();
        const validatedData = verifyUserApiSchema.parse(body);
        const { email, verificationCode } = validatedData;

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        const isCodeCorrect = user.verificationCode === verificationCode;
        const expiryDate = new Date(user.verificationCodeExpiry);
        const isCodeNotExpired = expiryDate > new Date();

        if (!isCodeCorrect) {
            return NextResponse.json(
                { success: false, message: "Invalid verification code" },
                { status: 400 }
            )
        }

        if (!isCodeNotExpired) {
            return NextResponse.json(
                { success: false, message: "Verification code expired. Signup again" },
                { status: 400 }
            )
        }

        user.isVerified = true;
        await user.save();

        return NextResponse.json(
            { success: true, message: "Account verified successfully" },
            { status: 200 }
        )

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid verification data" },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}