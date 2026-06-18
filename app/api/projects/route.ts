import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/models/project.model";
import { projectFormSchema } from "@/schemas/projectSchema";
import { verifySession } from "@/lib/authGuard";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Info } from "@/models/info.model";

const generateSlug = (text: string) =>
    text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");

/**
 * GET: Fetch all projects with consistent frontend field mappings
 */
export async function GET(req: NextRequest) {
    try {
        const session = await verifySession();
        await connectToDatabase();
        
        // If the profile doesn't exist yet, they can't have projects. Return an empty array cleanly.
        const userProfile = await Info.findOne({ userId: session.userId });
        if (!userProfile) {
            return NextResponse.json({ projects: [] }, { status: 200 });
        }

        const projects = await Project.find({ infoId: userProfile._id }).sort({ createdAt: -1 });

        // Map the projects to ensure consistent field names and formats for the frontend
        const formattedProjects = projects.map((project) => ({
            _id: project._id,
            title: project.title,
            tagline: project.tagline,
            slug: project.slug,
            description: project.description,
            projectUrl: project.projectUrl || "",
            githubUrl: project.githubUrl || "",
            techStack: project.techStack,
            features: project.features.map((f: string) => ({ text: f })),
            // CRITICAL FIX: Ensure frontend reads these cleanly as strings if already uploaded
            iconFile: project.iconUrl || "",
            imageFile: project.imageUrl || ""
        }));

        return NextResponse.json({ projects: formattedProjects }, { status: 200 });
    } catch (error: any) {
        if (error.status === 401) return NextResponse.json({ message: error.message }, { status: 401 });
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST: Handles multi-part FormData, saves project, and pushes ID to user profile
 */
export async function POST(req: NextRequest) {
    try {
        const session = await verifySession();
        await connectToDatabase();

        const userProfile = await Info.findOne({ userId: session.userId });
        if (!userProfile) {
            return NextResponse.json({ message: "Please complete your core profile setup first." }, { status: 400 });
        }

        const formData = await req.formData();

        const title = formData.get("title")?.toString() || "";
        const tagline = formData.get("tagline")?.toString() || "";
        const description = formData.get("description")?.toString() || "";
        const projectUrl = formData.get("projectUrl")?.toString() || "";
        const githubUrl = formData.get("githubUrl")?.toString() || "";

        let rawTechStack: string[] = [];
        let rawFeatures: string[] = [];
        try {
            rawTechStack = JSON.parse(formData.get("techStack")?.toString() || "[]");
            rawFeatures = JSON.parse(formData.get("features")?.toString() || "[]");
        } catch {
            return NextResponse.json({ message: "Malformed stack parameters provided." }, { status: 400 });
        }

        const iconFile = formData.get("iconFile");
        const imageFile = formData.get("imageFile");

        const payloadToValidate = {
            title,
            tagline,
            description,
            projectUrl,
            githubUrl,
            techStack: rawTechStack,
            features: rawFeatures.map((f) => ({ text: f })),
            iconFile: iconFile instanceof File ? iconFile : iconFile || undefined,
            imageFile: imageFile instanceof File ? imageFile : imageFile || undefined,
        };

        const validation = projectFormSchema.safeParse(payloadToValidate);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        // Process media assets into persistent Cloudinary URLs
        let iconUrl = "";
        let imageUrl = "";

        if (iconFile instanceof File) {
            iconUrl = await uploadToCloudinary(iconFile, "icons");
        }
        if (imageFile instanceof File) {
            imageUrl = await uploadToCloudinary(imageFile, "covers");
        }

        let projectSlug = generateSlug(title);
        const existingSlugCount = await Project.countDocuments({ slug: projectSlug });
        if (existingSlugCount > 0) {
            projectSlug = `${projectSlug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        // 1. Create the project document record
        const newProject = await Project.create({
            infoId: userProfile._id,
            title,
            tagline,
            slug: projectSlug,
            description,
            projectUrl,
            githubUrl,
            techStack: rawTechStack,
            features: rawFeatures,
            iconUrl,
            imageUrl,
        });

        // 2. CRITICAL FIX: Push the newly generated Project ID directly into the main profile doc array matrix
        await Info.findByIdAndUpdate(userProfile._id, {
            $push: { projects: newProject._id }
        });

        return NextResponse.json({ message: "Project built successfully.", project: newProject }, { status: 201 });
    } catch (error: any) {
        if (error.status === 401) return NextResponse.json({ message: error.message }, { status: 401 });
        console.error("PROJECTS POST EXCEPTION:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * PUT: Safely patches variations without breaking unmodified pre-existing icon/cover states
 */
export async function PUT(req: NextRequest) {
    try {
        const session = await verifySession();
        await connectToDatabase();

        const userProfile = await Info.findOne({ userId: session.userId });
        if (!userProfile) return NextResponse.json({ message: "Profile context not found." }, { status: 404 });

        const formData = await req.formData();
        const projectId = formData.get("_id")?.toString();

        if (!projectId) {
            return NextResponse.json({ message: "Missing explicit targeted Project ID parameter." }, { status: 400 });
        }

        const targetProject = await Project.findOne({ _id: projectId, infoId: userProfile._id });
        if (!targetProject) {
            return NextResponse.json({ message: "Target document not found or authorization missing." }, { status: 404 });
        }

        const title = formData.get("title")?.toString() || "";
        const tagline = formData.get("tagline")?.toString() || "";
        const description = formData.get("description")?.toString() || "";
        const projectUrl = formData.get("projectUrl")?.toString() || "";
        const githubUrl = formData.get("githubUrl")?.toString() || "";

        const rawTechStack = JSON.parse(formData.get("techStack")?.toString() || "[]");
        const rawFeatures = JSON.parse(formData.get("features")?.toString() || "[]");

        const iconFile = formData.get("iconFile");
        const imageFile = formData.get("imageFile");

        // Process file validation checks
        const payloadToValidate = {
            title,
            tagline,
            description,
            projectUrl,
            githubUrl,
            techStack: rawTechStack,
            features: rawFeatures.map((f: string) => ({ text: f })),
            iconFile: iconFile instanceof File ? iconFile : iconFile || undefined,
            imageFile: imageFile instanceof File ? imageFile : imageFile || undefined,
        };

        const validation = projectFormSchema.safeParse(payloadToValidate);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        // ICON & COVER TRACKING LOGIC FIX:
        let iconUrl = targetProject.iconUrl;
        let imageUrl = targetProject.imageUrl;

        // Check if a brand-new raw file is passed over multipart streams
        if (iconFile instanceof File) {
            iconUrl = await uploadToCloudinary(iconFile, "icons");
        } else if (iconFile === "null" || iconFile === "") {
            iconUrl = ""; // Explicit frontend extraction reset
        } // If it's a standard URL string, we retain the original tracking pointer completely untouched!

        if (imageFile instanceof File) {
            imageUrl = await uploadToCloudinary(imageFile, "covers");
        } else if (imageFile === "null" || imageFile === "") {
            imageUrl = "";
        }

        if (targetProject.title !== title) {
            let updatedSlug = generateSlug(title);
            const exists = await Project.countDocuments({ slug: updatedSlug, _id: { $ne: projectId } });
            targetProject.slug = exists > 0 ? `${updatedSlug}-${Math.random().toString(36).substring(2, 6)}` : updatedSlug;
        }

        targetProject.title = title;
        targetProject.tagline = tagline;
        targetProject.description = description;
        targetProject.projectUrl = projectUrl;
        targetProject.githubUrl = githubUrl;
        targetProject.techStack = rawTechStack;
        targetProject.features = rawFeatures;
        targetProject.iconUrl = iconUrl;
        targetProject.imageUrl = imageUrl;

        await targetProject.save();

        return NextResponse.json({ message: "Project entry updated successfully.", project: targetProject }, { status: 200 });
    } catch (error: any) {
        if (error.status === 401) return NextResponse.json({ message: error.message }, { status: 401 });
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * DELETE: Safely cleanses project records and pulls the reference ID from user profile
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await verifySession();
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("id");

        if (!projectId) {
            return NextResponse.json({ message: "Targeting parameters missing." }, { status: 400 });
        }

        await connectToDatabase();
        const userProfile = await Info.findOne({ userId: session.userId });
        if (!userProfile) return NextResponse.json({ message: "Profile context not found." }, { status: 404 });

        // 1. Remove the project document record completely
        const deletedDocument = await Project.findOneAndDelete({ _id: projectId, infoId: userProfile._id });
        if (!deletedDocument) {
            return NextResponse.json({ message: "Document could not be located or deletion unauthorized." }, { status: 404 });
        }

        // 2. CRITICAL FIX: Atomically extract the reference link out of the master user info document array matrix
        await Info.findByIdAndUpdate(userProfile._id, {
            $pull: { projects: projectId }
        });

        return NextResponse.json({ message: "Project safely removed from database layers.", id: projectId }, { status: 200 });
    } catch (error: any) {
        if (error.status === 401) return NextResponse.json({ message: error.message }, { status: 401 });
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}