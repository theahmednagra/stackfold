import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Info } from "@/models/info.model";
import { Experience } from "@/models/experience.model";
import { experienceFormSchema } from "@/schemas/experienceSchema";
import { verifySession } from "@/lib/auth-guard";

/**
 * GET: Retrieves all experiences tied to the logged-in profile context
 */
export async function GET(req: NextRequest) {
    try {
        const session = await verifySession();
        await connectToDatabase();

        const userProfile = await Info.findOne({ userId: session.userId });
        if (!userProfile) {
            return NextResponse.json({ experiences: [] }, { status: 200 });
        }

        // Return occupational elements sorted chronologically from newest down to oldest
        const experiences = await Experience.find({ infoId: userProfile._id }).sort({ startDate: -1 });

        return NextResponse.json({ experiences }, { status: 200 });
    } catch (error: any) {
        if (error.status === 401) return NextResponse.json({ message: error.message }, { status: 401 });
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST: Saves a fresh historical timeline block and syncs reference keys
 */
export async function POST(req: NextRequest) {
    try {
        const session = await verifySession();
        await connectToDatabase();

        const userProfile = await Info.findOne({ userId: session.userId });
        if (!userProfile) {
            return NextResponse.json({ message: "Please complete your core profile setup first." }, { status: 400 });
        }

        const body = await req.json();

        // Validate using your custom schema
        const validation = experienceFormSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        // Force consistent formatting for schemas
        const cleanEndDate = body.currentJob ? "" : body.endDate || "";

        // 1. Write the document record inside the experiences collection
        const newExperience = await Experience.create({
            infoId: userProfile._id,
            company: body.company,
            role: body.role,
            startDate: body.startDate,
            endDate: cleanEndDate,
            currentJob: body.currentJob,
            description: body.description,
        });

        // 2. Push reference string directly to master profile
        await Info.findByIdAndUpdate(userProfile._id, {
            $push: { experiences: newExperience._id },
        });

        return NextResponse.json({ message: "Milestone written successfully.", experience: newExperience }, { status: 201 });
    } catch (error: any) {
        if (error.status === 401) return NextResponse.json({ message: error.message }, { status: 401 });
        console.error("EXPERIENCE POST EXCEPTION:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * PUT: Modifies historical timeline parameters
 */
export async function PUT(req: NextRequest) {
    try {
        const session = await verifySession();
        await connectToDatabase();

        const userProfile = await Info.findOne({ userId: session.userId });
        if (!userProfile) return NextResponse.json({ message: "Profile context not found." }, { status: 404 });

        const body = await req.json();
        const { _id, ...updatePayload } = body;

        if (!_id) {
            return NextResponse.json({ message: "Target document locator key missing." }, { status: 400 });
        }

        const validation = experienceFormSchema.safeParse(updatePayload);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const cleanEndDate = updatePayload.currentJob ? "" : updatePayload.endDate || "";

        const updatedExperience = await Experience.findOneAndUpdate(
            { _id, infoId: userProfile._id },
            {
                company: updatePayload.company,
                role: updatePayload.role,
                startDate: updatePayload.startDate,
                endDate: cleanEndDate,
                currentJob: updatePayload.currentJob,
                description: updatePayload.description,
            },
            { new: true }
        );

        if (!updatedExperience) {
            return NextResponse.json({ message: "Document missing or operation unauthorized." }, { status: 404 });
        }

        return NextResponse.json({ message: "Occupational history block updated.", experience: updatedExperience }, { status: 200 });
    } catch (error: any) {
        if (error.status === 401) return NextResponse.json({ message: error.message }, { status: 401 });
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * DELETE: Clears occupational history elements out of data layers safely
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await verifySession();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "Target parameters drop identifier missing." }, { status: 400 });

        await connectToDatabase();
        const userProfile = await Info.findOne({ userId: session.userId });
        if (!userProfile) return NextResponse.json({ message: "Profile context not found." }, { status: 404 });

        // 1. Erase from core collection
        const deletedDoc = await Experience.findOneAndDelete({ _id: id, infoId: userProfile._id });
        if (!deletedDoc) {
            return NextResponse.json({ message: "Document could not be located or deletion unauthorized." }, { status: 404 });
        }

        // 2. Extract reference out of array matrix mapping cleanly
        await Info.findByIdAndUpdate(userProfile._id, {
            $pull: { experiences: id },
        });

        return NextResponse.json({ message: "Experience context wiped successfully.", id }, { status: 200 });
    } catch (error: any) {
        if (error.status === 401) return NextResponse.json({ message: error.message }, { status: 401 });
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}