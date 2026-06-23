import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Visit } from "@/models/visit.model";
import { verifySession } from "@/lib/auth-guard";

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        // 1. Authenticate via our reusable helper
        const session = await verifySession();
        const userId = session.userId;
        
        const ownerObjectId = new mongoose.Types.ObjectId(userId);

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const [analyticsData] = await Visit.aggregate([
            // Pre-filter database instantly using our index
            { $match: { portfolioOwnerId: ownerObjectId } },
            {
                $facet: {
                    weeklyViews: [
                        { $match: { timestamp: { $gte: sevenDaysAgo } } },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                                views: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    monthlyViews: [
                        { $match: { timestamp: { $gte: thirtyDaysAgo } } },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                                views: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    topCountries: [
                        { $group: { _id: "$country", count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ],
                    summary: [
                        { $count: "totalViews" }
                    ]
                }
            }
        ]);

        return NextResponse.json({
            weekly: analyticsData?.weeklyViews || [],
            monthly: analyticsData?.monthlyViews || [],
            topCountries: analyticsData?.topCountries || [],
            totalViews: analyticsData?.summary[0]?.totalViews || 0
        });
    } catch (error) {
        return NextResponse.json({ error: "Aggregation failed" }, { status: 500 });
    }
}