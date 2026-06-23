import { streamText, ModelMessage, tool, stepCountIs } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifySession } from "@/lib/auth-guard";
import { Info } from "@/models/info.model";
import { Project, IProject } from "@/models/project.model";
import { Experience, IExperience } from "@/models/experience.model";
import { Visit } from "@/models/visit.model";
import { aiModel } from "@/lib/ai-model"; // ← provider-agnostic import

// ---------------------------------------------------------------------------
// SHARED INPUT SCHEMAS
// Defined outside the handler so they are created once, not on every request.
// ---------------------------------------------------------------------------

const profileSchema = z.object({
    fullname: z.string().min(2).max(50).trim(),
    bio: z.string().min(10).max(160).trim(),
    description: z.string().min(20).trim(),
    contact: z.string().email().trim(),
    endNote: z.string().max(200).optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
});

const projectWriteSchema = z.object({
    title: z.string().min(1).max(80),
    tagline: z.string().min(1).max(120),
    description: z.string().min(10),
    techStack: z.array(z.string()).max(20),
    features: z.array(z.string()).max(15),
    projectUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
});

const experienceWriteSchema = z.object({
    company: z.string().min(1).max(100),
    role: z.string().min(1).max(100),
    startDate: z.string(),
    endDate: z.string().optional(),
    currentJob: z.boolean().default(false),
    description: z.string().min(10),
});

// ---------------------------------------------------------------------------
// ROUTE HANDLER
// ---------------------------------------------------------------------------

interface ChatMessage {
    role: "user" | "assistant" | "system" | "tool";
    content: string;
}

export async function POST(req: NextRequest) {
    try {
        // 1. AUTH — fail fast before any DB or AI work
        const session = await verifySession();
        const { userId, username, email } = session;

        const { messages }: { messages: ChatMessage[] } = await req.json();

        // 2. SINGLE DB CONNECTION — not repeated inside each tool
        await connectToDatabase();

        // 3. RESOLVE infoDoc ONCE — most tools need it
        // We fetch it here so tools don't each re-query for the same document.
        const infoDoc = await Info.findOne({ userId });

        // ---------------------------------------------------------------------------
        // STREAM
        // ---------------------------------------------------------------------------

        const result = streamText({
            model: aiModel,
            messages: messages as ModelMessage[],
            stopWhen: stepCountIs(10),

            system: `You are Stackfold Copilot — a precise, technically-minded AI portfolio engineer.
You manage the user's public developer portfolio: their profile, projects, experience timeline, theme, and analytics.

USER CONTEXT (READ-ONLY — never modify these):
- Username: "${username}"
- Email: "${email}"
- Profile initialized: ${infoDoc ? "yes" : "no — user must set up their profile first"}

═══════════════════════════════════════
HARD BOUNDARIES — NEVER VIOLATE THESE
═══════════════════════════════════════
1. Never touch the User model. Authentication credentials are completely out of scope.
2. Never change the username. Direct user to: Dashboard → Settings → Account.
3. Never change the email. Emails are permanent unique identifiers. A new email requires a new account.
4. Never invent or assume tool capabilities. Only use explicitly declared tools.
5. Never execute a destructive operation without a prior confirmation step.

═══════════════════════════════════════
DELETION PROTOCOL — ALWAYS FOLLOW THIS
═══════════════════════════════════════
When a user wants to delete anything:
  STEP 1 → Call the flag tool (flagProjectForDeletion or flagExperienceForDeletion).
           This returns what will be deleted. Present it clearly to the user.
  STEP 2 → Ask: "Are you sure you want to permanently delete this? Reply 'yes, delete it' to confirm."
  STEP 3 → Only after explicit confirmation, call the confirm tool to execute.
Never skip step 2. Never assume confirmation from vague messages like "ok" or "sure".

═══════════════════════════════════════
RESPONSE STYLE
═══════════════════════════════════════
- Crisp and technically precise. No filler phrases.
- After a successful write operation, confirm exactly what changed.
- After a read operation, present data in a clean, readable format.
- If the profile is not initialized and the user requests a write, tell them to set up their profile first via updateProfile.
- Never say "Great!" or "Sure!" — just execute and confirm.`,

            tools: {

                // ─────────────────────────────────────────────
                // READ: FULL PORTFOLIO SNAPSHOT
                // ─────────────────────────────────────────────
                getPortfolioSnapshot: tool({
                    description:
                        "Fetches the user's complete portfolio data: profile info, all projects, and all experience entries. Call this when the user asks what their portfolio currently looks like, or before making updates to show the current state.",
                    inputSchema: z.object({}),
                    execute: async () => {
                        if (!infoDoc) return { error: "Portfolio not initialized. Use updateProfile to set it up first." };

                        const [projects, experiences] = await Promise.all([
                            Project.find({ infoId: infoDoc._id }).lean(),
                            Experience.find({ infoId: infoDoc._id }).lean(),
                        ]);

                        return {
                            profile: {
                                fullname: infoDoc.fullname,
                                bio: infoDoc.bio,
                                description: infoDoc.description,
                                contact: infoDoc.contact,
                                endNote: infoDoc.endNote,
                                socialLinks: infoDoc.socialLinks,
                                theme: infoDoc.theme,
                                isActive: infoDoc.isActive,
                            },
                            projects,
                            experiences,
                        };
                    },
                }),

                // ─────────────────────────────────────────────
                // WRITE: UPDATE PROFILE
                // ─────────────────────────────────────────────
                updateProfile: tool({
                    description:
                        "Updates the user's public profile: full name, bio, description, contact email, end note, and social links (GitHub, LinkedIn, Twitter). Use this for any profile-level text changes.",
                    inputSchema: profileSchema,
                    execute: async ({ fullname, bio, description, contact, endNote, github, linkedin, twitter }) => {
                        const socialLinks = [github, linkedin, twitter]
                            .filter((link): link is string => typeof link === "string" && link.trim() !== "")
                            .map((link) => link.trim());

                        const updated = await Info.findOneAndUpdate(
                            { userId },
                            { fullname, bio, description, contact, endNote: endNote ?? "", socialLinks },
                            { upsert: true, new: true, runValidators: true }
                        );

                        return { success: true, updated: updated.fullname };
                    },
                }),

                // ─────────────────────────────────────────────
                // WRITE: UPDATE THEME
                // ─────────────────────────────────────────────
                updateTheme: tool({
                    description:
                        "Changes the portfolio's visual theme. Available themes: 'default-dark' or 'default-light'. Use only when the user explicitly asks to change their theme.",
                    inputSchema: z.object({
                        theme: z.enum(["default-dark", "default-light"]),
                    }),
                    execute: async ({ theme }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        await Info.updateOne({ userId }, { theme });
                        return { success: true, theme };
                    },
                }),

                // ─────────────────────────────────────────────
                // WRITE: ADD PROJECT
                // ─────────────────────────────────────────────
                addProject: tool({
                    description:
                        "Creates a new project entry in the portfolio showcase. Use when the user wants to add a project they haven't added before. Do not use for editing existing projects.",
                    inputSchema: projectWriteSchema,
                    execute: async ({ title, tagline, description, techStack, features, projectUrl, githubUrl }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-6)}`;

                        const newProject = await Project.create({
                            infoId: infoDoc._id,
                            title,
                            tagline,
                            slug,
                            description,
                            techStack,
                            features,
                            projectUrl: projectUrl ?? "",
                            githubUrl: githubUrl ?? "",
                        }) as IProject;

                        await Info.updateOne({ _id: infoDoc._id }, { $push: { projects: newProject._id } });

                        return { success: true, slug, title: newProject.title };
                    },
                }),

                // ─────────────────────────────────────────────
                // WRITE: UPDATE PROJECT
                // ─────────────────────────────────────────────
                updateProject: tool({
                    description:
                        "Updates an existing project's details. Requires the project's slug to identify it. Updates all fields at once. Call getPortfolioSnapshot first if you don't have the slug.",
                    inputSchema: projectWriteSchema.extend({
                        slug: z.string().describe("The unique slug of the project to update. Required for identification."),
                    }),
                    execute: async ({ slug, title, tagline, description, techStack, features, projectUrl, githubUrl }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const updated = await Project.findOneAndUpdate(
                            { slug, infoId: infoDoc._id }, // scoped to this user's projects only
                            { title, tagline, description, techStack, features, projectUrl, githubUrl },
                            { new: true, runValidators: true }
                        );

                        if (!updated) return { error: `No project found with slug "${slug}" in your portfolio.` };
                        return { success: true, slug: updated.slug, title: updated.title };
                    },
                }),

                // ─────────────────────────────────────────────
                // DELETE PHASE 1: FLAG PROJECT
                // ─────────────────────────────────────────────
                flagProjectForDeletion: tool({
                    description:
                        "Phase 1 of project deletion. Looks up the project by slug and returns its details so the user can review what will be deleted. Never deletes anything. Always call this before confirmProjectDeletion.",
                    inputSchema: z.object({
                        slug: z.string().describe("The slug of the project the user wants to delete."),
                    }),
                    execute: async ({ slug }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const project = await Project.findOne({ slug, infoId: infoDoc._id }).lean();
                        if (!project) return { error: `No project found with slug "${slug}".` };

                        return {
                            flagged: true,
                            slug: project.slug,
                            title: project.title,
                            tagline: project.tagline,
                            message: "Project found. Awaiting user confirmation before deletion.",
                        };
                    },
                }),

                // ─────────────────────────────────────────────
                // DELETE PHASE 2: CONFIRM PROJECT DELETION
                // ─────────────────────────────────────────────
                confirmProjectDeletion: tool({
                    description:
                        "Phase 2 of project deletion. Permanently deletes the project. Only call this after flagProjectForDeletion has been called AND the user has explicitly confirmed they want to delete.",
                    inputSchema: z.object({
                        slug: z.string().describe("The slug of the project confirmed for deletion."),
                    }),
                    execute: async ({ slug }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const deleted = await Project.findOneAndDelete({ slug, infoId: infoDoc._id });
                        if (!deleted) return { error: `Project with slug "${slug}" not found.` };

                        await Info.updateOne({ _id: infoDoc._id }, { $pull: { projects: deleted._id } });

                        return { success: true, deleted: deleted.title };
                    },
                }),

                // ─────────────────────────────────────────────
                // WRITE: ADD EXPERIENCE
                // ─────────────────────────────────────────────
                addExperience: tool({
                    description:
                        "Adds a new work experience entry to the portfolio timeline. Use for internships, jobs, or freelance roles the user wants to showcase.",
                    inputSchema: experienceWriteSchema,
                    execute: async ({ company, role, startDate, endDate, currentJob, description }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const newExp = await Experience.create({
                            infoId: infoDoc._id,
                            company,
                            role,
                            startDate,
                            endDate: currentJob ? "" : (endDate ?? ""),
                            currentJob,
                            description,
                        }) as IExperience;

                        await Info.updateOne({ _id: infoDoc._id }, { $push: { experiences: newExp._id } });

                        return { success: true, company: newExp.company, role: newExp.role };
                    },
                }),

                // ─────────────────────────────────────────────
                // WRITE: UPDATE EXPERIENCE
                // ─────────────────────────────────────────────
                updateExperience: tool({
                    description:
                        "Updates an existing experience entry. Requires the experience's MongoDB _id to identify it. Call getPortfolioSnapshot first if you don't have the _id.",
                    inputSchema: experienceWriteSchema.extend({
                        experienceId: z.string().describe("The MongoDB _id of the experience entry to update."),
                    }),
                    execute: async ({ experienceId, company, role, startDate, endDate, currentJob, description }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const updated = await Experience.findOneAndUpdate(
                            { _id: experienceId, infoId: infoDoc._id }, // scoped to this user only
                            { company, role, startDate, endDate: currentJob ? "" : (endDate ?? ""), currentJob, description },
                            { new: true, runValidators: true }
                        );

                        if (!updated) return { error: `No experience found with id "${experienceId}" in your portfolio.` };
                        return { success: true, company: updated.company, role: updated.role };
                    },
                }),

                // ─────────────────────────────────────────────
                // DELETE PHASE 1: FLAG EXPERIENCE
                // ─────────────────────────────────────────────
                flagExperienceForDeletion: tool({
                    description:
                        "Phase 1 of experience deletion. Looks up the experience by its _id and returns details for the user to review. Never deletes anything. Always call this before confirmExperienceDeletion.",
                    inputSchema: z.object({
                        experienceId: z.string().describe("The MongoDB _id of the experience entry to delete."),
                    }),
                    execute: async ({ experienceId }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const exp = await Experience.findOne({ _id: experienceId, infoId: infoDoc._id }).lean();
                        if (!exp) return { error: `No experience found with id "${experienceId}".` };

                        return {
                            flagged: true,
                            experienceId,
                            company: exp.company,
                            role: exp.role,
                            message: "Experience found. Awaiting user confirmation before deletion.",
                        };
                    },
                }),

                // ─────────────────────────────────────────────
                // DELETE PHASE 2: CONFIRM EXPERIENCE DELETION
                // ─────────────────────────────────────────────
                confirmExperienceDeletion: tool({
                    description:
                        "Phase 2 of experience deletion. Permanently deletes the experience entry. Only call this after flagExperienceForDeletion has been called AND the user has explicitly confirmed.",
                    inputSchema: z.object({
                        experienceId: z.string().describe("The MongoDB _id of the experience confirmed for deletion."),
                    }),
                    execute: async ({ experienceId }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const deleted = await Experience.findOneAndDelete({ _id: experienceId, infoId: infoDoc._id });
                        if (!deleted) return { error: `Experience with id "${experienceId}" not found.` };

                        await Info.updateOne({ _id: infoDoc._id }, { $pull: { experiences: deleted._id } });

                        return { success: true, deleted: `${deleted.role} at ${deleted.company}` };
                    },
                }),

                // ─────────────────────────────────────────────
                // READ: ANALYTICS SUMMARY
                // ─────────────────────────────────────────────
                getAnalyticsSummary: tool({
                    description:
                        "Fetches and summarizes portfolio visit analytics. Returns total visits, visits in the last 7 days, visits in the last 30 days, and a breakdown by country. Use when the user asks about their portfolio traffic or analytics.",
                    inputSchema: z.object({}),
                    execute: async () => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const now = new Date();
                        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

                        const [totalVisits, last7Count, last30Count, countryBreakdown] = await Promise.all([
                            Visit.countDocuments({ portfolioOwnerId: userId }),
                            Visit.countDocuments({ portfolioOwnerId: userId, timestamp: { $gte: last7Days } }),
                            Visit.countDocuments({ portfolioOwnerId: userId, timestamp: { $gte: last30Days } }),
                            Visit.aggregate([
                                { $match: { portfolioOwnerId: userId } },
                                { $group: { _id: "$country", count: { $sum: 1 } } },
                                { $sort: { count: -1 } },
                                { $limit: 5 },
                            ]),
                        ]);

                        return {
                            totalVisits,
                            last7Days: last7Count,
                            last30Days: last30Count,
                            topCountries: countryBreakdown.map((c) => ({ country: c._id, visits: c.count })),
                        };
                    },
                }),
            },
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        if (error?.status === 401) {
            return NextResponse.json({ message: "Unauthorized session access." }, { status: 401 });
        }
        console.error("AGENT_EXECUTION_FAILURE:", error);
        return NextResponse.json({ message: "Internal processing crash." }, { status: 500 });
    }
}