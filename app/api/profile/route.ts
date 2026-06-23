import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifySession } from "@/lib/auth-guard";
import { Info } from "@/models/info.model";
import { profileFormSchema } from "@/schemas/profileSchema";

/**
 * GET: Retrieves the user's profile info and maps the database's flat 
 * string array back into a structured object for React Hook Form.
 */
export async function GET(req: NextRequest) {
    try {
        // 1. Authenticate via our reusable helper
        const session = await verifySession();
        const userId = session.userId;

        await connectToDatabase();

        // 2. Fetch the single profile linked to this user
        const profile = await Info.findOne({ userId });

        // If no profile exists, return a 200 status with default empty field parameters
        if (!profile) {
            return NextResponse.json(
                {
                    profile: {
                        fullname: "",
                        bio: "",
                        description: "",
                        contact: "",
                        endNote: "",
                        socialLinks: { github: "", linkedin: "", twitter: "" },
                    },
                },
                { status: 200 }
            );
        }

        // 3. Reconstruct flat database array strings back into the frontend's nested socials mapping
        const reconstructedSocials = {
            github: profile.socialLinks.find((link: string) => link.includes("github.com")) || "",
            linkedin: profile.socialLinks.find((link: string) => link.includes("linkedin.com")) || "",
            twitter: profile.socialLinks.find((link: string) => link.includes("twitter.com") || link.includes("x.com")) || "",
        };

        // 4. Return matching keys for client-side form hydration
        return NextResponse.json(
            {
                profile: {
                    fullname: profile.fullname,
                    bio: profile.bio,
                    description: profile.description,
                    contact: profile.contact,
                    endNote: profile.endNote || "",
                    socialLinks: reconstructedSocials,
                },
            },
            { status: 200 }
        );

    } catch (error: any) {
        // Gracefully catch our explicit unauthorized guard errors
        if (error.status === 401) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }

        console.error("CRITICAL PROFILE GET EXCEPTION:", error);
        return NextResponse.json(
            { message: "Internal server error encountered while fetching profile parameters." },
            { status: 500 }
        );
    }
}

/**
 * PUT: Handles both profile creation and continuous updates.
 * Compresses nested form inputs into flat arrays and runs an atomic upsert.
 */
export async function PUT(req: NextRequest) {
    try {
        // 1. Authenticate via our reusable helper
        const session = await verifySession();
        const userId = session.userId;

        // 2. Parse request payload and enforce your Zod schema
        const body = await req.json();
        const validation = profileFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { message: "Validation failed.", errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { fullname, bio, description, contact, endNote, socialLinks } = validation.data;

        // 3. Data Transformation: Filter out empty inputs and flatten the object map values
        const flatSocialLinks = Object.values(socialLinks || {})
            .map((link) => link?.trim())
            .filter((link): link is string => !!link);

        await connectToDatabase();

        // 4. Atomic Upsert: Update if existing, create if brand new
        const updatedProfile = await Info.findOneAndUpdate(
            { userId },
            {
                fullname,
                bio,
                description,
                contact,
                endNote: endNote || "",
                socialLinks: flatSocialLinks,
                // Enforce defaults only if this database write triggers a fresh creation entry
                $setOnInsert: { theme: "default-dark", projects: [], experience: [] }
            },
            {
                upsert: true,         // Perform the update or fallback insert automatically
                new: true,            // Return the updated document object state 
                runValidators: true,  // Enforce schema typing guards on updates
            }
        );

        return NextResponse.json(
            {
                message: "Profile information synchronized successfully.",
                profile: updatedProfile,
            },
            { status: 200 }
        );

    } catch (error: any) {
        if (error.status === 401) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }

        console.error("CRITICAL PROFILE PUT EXCEPTION:", error);
        return NextResponse.json(
            { message: "Internal server error encountered while writing profile parameters." },
            { status: 500 }
        );
    }
}