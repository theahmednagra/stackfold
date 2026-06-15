import { NextResponse } from "next/server";
import { loginUserSchema } from "@/schemas/loginUserSchema";
import { User } from "@/models/User.models";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import dbConnect from "@/lib/dbConnect";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const body = await req.json();
        const validatedData = loginUserSchema.parse(body);

        const { email, password } = validatedData;
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials" },
                { status: 401 }
            )
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials" },
                { status: 401 }
            )
        }

        if (!user.isVerified) {
            return NextResponse.json(
                { success: false, message: "Please verify you account before logging in", isVerified: false },
                { status: 403 }
            )
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                username: user.username,
                isVerified: user.isVerified,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "2hr" }
        );

        const response = NextResponse.json(
            {
                success: true,
                message: "Logged in successfully",
                user: {    // Optional
                    id: user._id,
                    username: user.username,
                    email: user.email,
                }
            },
            { status: 200 }
        );

        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            maxAge: 60 * 60 * 2,
            path: "/",
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        })

        return response;

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid login data" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}