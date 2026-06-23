import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Info } from "@/models/info.model";
import { Visit } from "@/models/visit.model";
import { verifySession } from "@/lib/auth-guard";
import { connectToDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await verifySession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: "Authentication required." }, { status: 401 });
        }

        // 1. Establish database context connection
        await connectToDatabase();

        // 2. Resolve target User Context safely
        const targetUserId = new mongoose.Types.ObjectId(session.userId);

        // 3. Kick off execution of parallel metrics operations
        const [profilePipelineResult, trafficAggregates] = await Promise.all([

            // PIPELINE A: Aggregates Profile data alongside populated counts for Projects and Experiences
            Info.aggregate([
                { $match: { userId: targetUserId } },
                {
                    $lookup: {
                        from: "projects", // MongoDB collection name
                        localField: "_id",
                        foreignField: "infoId",
                        as: "projectItems",
                    },
                },
                {
                    $lookup: {
                        from: "experiences",
                        localField: "_id",
                        foreignField: "infoId",
                        as: "experienceItems",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        fullname: 1,
                        bio: 1,
                        theme: 1,
                        isActive: 1, // ⚡ CRITICAL: Projected safely straight out of the Info collection
                        socialLinksCount: { $size: { $ifNull: ["$socialLinks", []] } },
                        totalProjects: { $size: "$projectItems" },
                        totalExperiences: { $size: "$experienceItems" },
                        recentProjects: {
                            $map: {
                                input: { $slice: ["$projectItems", 3] }, // Limit to top 3
                                as: "p",
                                in: { title: "$$p.title", techStack: "$$p.techStack", slug: "$$p.slug", projectUrl: "$$p.projectUrl" }
                            }
                        }
                    },
                },
            ]),

            // PIPELINE B: Aggregates total views and localized traffic velocity inside a rolling 7-day window
            Visit.aggregate([
                { $match: { portfolioOwnerId: targetUserId } },
                {
                    $facet: {
                        totalViewsCount: [{ $count: "count" }],
                        lastSevenDaysViews: [
                            {
                                $match: {
                                    timestamp: {
                                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                                    },
                                },
                            },
                            { $count: "count" },
                        ],
                        topGeographies: [
                            { $group: { _id: "$country", count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 2 }
                        ]
                    },
                },
            ]),
        ]);

        // 4. Fallback default configurations if the User Info document has not been generated yet
        const profileData = profilePipelineResult[0] || {
            fullname: "Anonymous Developer",
            bio: "Set up your public profile configuration.",
            theme: "default-dark",
            isActive: false, // Default to hidden/uninitialized state safety
            socialLinksCount: 0,
            totalProjects: 0,
            totalExperiences: 0,
            recentProjects: []
        };

        // 5. Structure clean, aggregated response payload
        const totalViews = trafficAggregates[0]?.totalViewsCount[0]?.count || 0;
        const recentWeeklyViews = trafficAggregates[0]?.lastSevenDaysViews[0]?.count || 0;
        const primaryRegions = trafficAggregates[0]?.topGeographies || [];

        const overviewPayload = {
            profile: {
                id: profileData._id || null,
                fullname: profileData.fullname,
                bio: profileData.bio,
                activeTheme: profileData.theme,
                isActive: profileData.isActive, // ⚡ EXPORTED: Accessible for dashboard dynamic layout logic
            },
            counters: {
                projects: profileData.totalProjects,
                experiences: profileData.totalExperiences,
                socials: profileData.socialLinksCount,
            },
            metrics: {
                allTimeViews: totalViews,
                weeklyVelocity: recentWeeklyViews,
                topDistribution: primaryRegions,
            },
            previewList: profileData.recentProjects
        };

        return NextResponse.json(overviewPayload, { status: 200 });

    } catch (error: any) {
        console.error("Overview Aggregation Failure:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
