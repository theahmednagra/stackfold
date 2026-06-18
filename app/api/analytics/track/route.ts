import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Visit } from "@/models/visit.model";

// 🚀 Publicly accessible endpoint for the background client tracker
export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { ownerId } = await req.json();

        if (!ownerId) {
            return NextResponse.json({ error: "Owner ID required" }, { status: 400 });
        }

        // Capture location metadata from deployment headers if available
        const country = req.headers.get("x-vercel-ip-country") || "Unknown";

        const userAgent = req.headers.get("user-agent") || "";
        let browser = "Other";
        if (userAgent.includes("Chrome")) browser = "Chrome";
        else if (userAgent.includes("Safari")) browser = "Safari";
        else if (userAgent.includes("Firefox")) browser = "Firefox";

        // Fast database ingestion
        await Visit.create({
            portfolioOwnerId: ownerId,
            country,
            browser,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
    }
}