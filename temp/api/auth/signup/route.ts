import { NextResponse } from "next/server";
import { registerUserSchema } from "@/schemas/registerUserSchema";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User.models";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendVerificationEmail from "@/helpers/sendVerificationEmail";
import { ZodError } from "zod";

export async function POST(req: Request) {
    await dbConnect();
    
    try {
        const body = await req.json();
        const validatedData = registerUserSchema.parse(body);
        const { username, email, password } = validatedData;

        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationCodeExpiry = new Date(Date.now() + 3600 * 1000)
        
        const existingUser = await User.findOne({email});
        if (existingUser) {
            if (existingUser.isVerified) {
                return NextResponse.json(
                { success: false, message: "User with this email already exists" },
                { status: 400 }
            )} 
            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUser.username = username;
                existingUser.password = hashedPassword;
                existingUser.verificationCode = verificationCode;
                existingUser.verificationCodeExpiry = verificationCodeExpiry;

                await existingUser.save()
            }
        } 
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                isVerified: false,
                verificationCode,
                verificationCodeExpiry,
            })
            await newUser.save();
        }

        const emailResponse = await sendVerificationEmail(username, email, verificationCode)
        if (!emailResponse.success) {
            return NextResponse.json(
                { success: false, message: "Failed to send verification code" },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { success: true, message: "User registered successfully. Check your email for verification code" },
            { status: 201 }
        );

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {success: false, message: "Invalid input data" },
                { status: 400 }
            );
        }
        return NextResponse.json(
                {success: false, message: "Internal server error" },
                { status: 500 }
        );
    }
}