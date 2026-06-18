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

        // 2. Fetch the metadata from both models concurrently
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
            isActive: info.isActive,
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
    // Start a Mongoose session to handle transactions (Ensures all updates succeed or all fail together)
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

            // Enforce your exact model regex match rules
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (trimmedUsername.length < 3 || trimmedUsername.length > 20 || !usernameRegex.test(trimmedUsername)) {
                await dbSession.abortTransaction();
                dbSession.endSession();
                return NextResponse.json({ error: "Invalid username structure" }, { status: 400 });
            }

            // Check for global structural duplicate conflicts
            const existingUser = await User.findOne({
                username: trimmedUsername,
                _id: { $ne: userObjectId }
            }).session(dbSession);

            if (existingUser) {
                await dbSession.abortTransaction();
                dbSession.endSession();
                return NextResponse.json({ error: "Username is already occupied" }, { status: 409 });
            }

            // Synchronize across BOTH collections safely inside the database transaction
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
        // ACTION 3: Handle Visibility Toggling (isActive)
        // ------------------------------------------
        if (isActive !== undefined) {
            if (typeof isActive !== "boolean") {
                await dbSession.abortTransaction();
                dbSession.endSession();
                return NextResponse.json({ error: "Visibility status must be a boolean" }, { status: 400 });
            }

            await Info.findOneAndUpdate({ userId: userObjectId }, { isActive }).session(dbSession);
        }

        // Commit all changes to the database cleanly
        await dbSession.commitTransaction();
        dbSession.endSession();

        return NextResponse.json({ success: true, message: "Settings updated flawlessly" });

    } catch (error) {
        // If anything fails during the process, undo all alterations completely
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ error: "Failed to modify settings payload" }, { status: 500 });
    }
}