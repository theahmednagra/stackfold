import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user.model";
import { Info } from "@/models/info.model";
import { verifySession } from "@/lib/authGuard";

/**
 * ==========================================
 * GET: Fetch Current Account Configurations
 * ==========================================
 */
export async function GET() {
    try {
        await connectToDatabase();

        // 1. Authenticate the platform session
        const session = await verifySession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        // 2. Fetch metadata (isActive correctly loaded from the Info model)
        const [user, info] = await Promise.all([
            User.findById(session.userId).select("username email"),
            Info.findOne({ userId: session.userId }).select("theme isActive"),
        ]);

        if (!user || !info) {
            return NextResponse.json({ error: "Account records not found" }, { status: 404 });
        }

        // 3. Return a clean unified payload to the client interface
        return NextResponse.json({
            username: user.username,
            email: user.email,
            theme: info.theme,
            isActive: info.isActive, // ⚡ FIXED: Loaded directly from Info model
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

/**
 * ==========================================
 * PATCH: Atomically Mutate Settings State
 * ==========================================
 */
export async function PATCH(req: Request) {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
        await connectToDatabase();

        const authSession = await verifySession();
        if (!authSession) {
            await dbSession.abortTransaction();
            dbSession.endSession();
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const { username, theme, isActive } = body;

        const userObjectId = new mongoose.Types.ObjectId(authSession.userId);

        // ------------------------------------------
        // ACTION 1: Handle Username Mutation
        // ------------------------------------------
        if (username !== undefined) {
            const trimmedUsername = username.trim();

            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (trimmedUsername.length < 3 || trimmedUsername.length > 20 || !usernameRegex.test(trimmedUsername)) {
                await dbSession.abortTransaction();
                dbSession.endSession();
                return NextResponse.json({ error: "Invalid username structure" }, { status: 400 });
            }

            const existingUser = await User.findOne({
                username: trimmedUsername,
                _id: { $ne: userObjectId }
            }).session(dbSession);

            if (existingUser) {
                await dbSession.abortTransaction();
                dbSession.endSession();
                return NextResponse.json({ error: "Username is already occupied" }, { status: 409 });
            }

            await User.findByIdAndUpdate(userObjectId, { username: trimmedUsername }).session(dbSession);
            await Info.findOneAndUpdate({ userId: userObjectId }, { username: trimmedUsername }).session(dbSession);
        }

        // ------------------------------------------
        // ACTION 2: Handle Theme Switching
        // ------------------------------------------
        if (theme !== undefined) {
            const validThemes = ["default-dark", "default-light"];
            if (!validThemes.includes(theme)) {
                await dbSession.abortTransaction();
                dbSession.endSession();
                return NextResponse.json({ error: "Unsupported theme configuration" }, { status: 400 });
            }

            await Info.findOneAndUpdate({ userId: userObjectId }, { theme }).session(dbSession);
        }

        // ------------------------------------------
        // ACTION 3: Handle Visibility Toggling (isActive) - Reverted to Info Model
        // ------------------------------------------
        if (isActive !== undefined) {
            if (typeof isActive !== "boolean") {
                await dbSession.abortTransaction();
                dbSession.endSession();
                return NextResponse.json({ error: "Visibility status must be a boolean" }, { status: 400 });
            }

            // ⚡ FIXED: Targets Info model instead of User to prevent cross-component visibility bugs
            await Info.findOneAndUpdate({ userId: userObjectId }, { isActive }).session(dbSession);
        }

        await dbSession.commitTransaction();
        dbSession.endSession();

        return NextResponse.json({ success: true, message: "Settings updated flawlessly" });

    } catch (error) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ error: "Failed to modify settings payload" }, { status: 500 });
    }
}
