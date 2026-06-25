import { streamText, ModelMessage, tool, stepCountIs } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifySession } from "@/lib/auth-guard";
import { Info } from "@/models/info.model";
import { Project, IProject } from "@/models/project.model";
import { Experience, IExperience } from "@/models/experience.model";
import { Visit } from "@/models/visit.model";
import { aiModel, AI_MAX_RETRIES } from "@/lib/ai-model"; // ← provider-agnostic import

// ---------------------------------------------------------------------------
// SHARED INPUT SCHEMAS
// Defined outside the handler so they are created once, not on every request.
// ---------------------------------------------------------------------------

// optionalUrl: accepts any string or undefined at the schema level.
// We skip .url() here because some providers reject z.literal("") unions (empty enum).
// URL sanitization happens inside each tool's execute function instead.
const optionalUrl = z.string().optional();

// safeUrl: strips empty strings and invalid URLs before saving to the database.
// Returns empty string for anything that is not a real URL so Mongoose stays clean.
function safeUrl(value: string | undefined): string {
    if (!value || value.trim() === "") return "";
    try { new URL(value.trim()); return value.trim(); }
    catch { return ""; }
}

// safeEmail: basic email sanity check at the execute layer.
// We avoid z.string().email() because its compiled regex uses lookaheads
// which some providers reject in JSON Schema draft-07.
function safeEmail(value: string): string {
    const trimmed = value.trim();
    return trimmed.includes("@") && trimmed.includes(".") ? trimmed : "";
}

const profileSchema = z.object({
    fullname: z.string().min(2).max(50).trim(),
    bio: z.string().min(10).max(160).trim(),
    description: z.string().min(20).trim(),
    contact: z.string().trim(), // .email() omitted - some providers reject lookahead regex in JSON Schema draft-07
    endNote: z.string().max(200).optional(),
    github: optionalUrl,
    linkedin: optionalUrl,
    twitter: optionalUrl,
});

// Note: no .min() constraints here - some providers may pass empty strings for fields
// it does not intend to change. The updateProject execute merges with DB values instead.
const projectWriteSchema = z.object({
    title: z.string().max(80),
    tagline: z.string().max(120),
    description: z.string(),
    techStack: z.array(z.string()).max(20),
    features: z.array(z.string()).max(15),
    projectUrl: optionalUrl,
    githubUrl: optionalUrl,
});

const experienceWriteSchema = z.object({
    company: z.string().max(100),
    role: z.string().max(100),
    startDate: z.string().describe("Format: YYYY-MM, e.g. 2024-06"),
    endDate: z.string().optional().describe("Format: YYYY-MM, e.g. 2025-01. Leave empty if currentJob is true."),
    currentJob: z.boolean().default(false),
    description: z.string(),
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
        // 1. AUTH - fail fast before any DB or AI work
        const session = await verifySession();
        const { userId, username, email } = session;

        const { messages }: { messages: ChatMessage[] } = await req.json();

        // 2. SINGLE DB CONNECTION - not repeated inside each tool
        await connectToDatabase();

        // 3. RESOLVE infoDoc ONCE - most tools need it
        // We fetch it here so tools don't each re-query for the same document.
        const infoDoc = await Info.findOne({ userId });

        // ---------------------------------------------------------------------------
        // STREAM
        // ---------------------------------------------------------------------------

        const result = streamText({
            model: aiModel,
            // Keep only last 6 messages to minimize token overhead per call.
            // The system prompt + tool schemas already cost ~2500 tokens on every call.
            messages: messages.slice(-6) as ModelMessage[],
            stopWhen: stepCountIs(10),
            maxRetries: AI_MAX_RETRIES,

            system: `You are Stackfold Copilot, a portfolio AI agent for user "${username}" with the email "${email}".
Profile ready: ${infoDoc ? "yes" : "no  run updateProfile first"}.

RULES:
- Never modify username, email, or auth data. Username changes → Dashboard > Settings > Account.
- Only use declared tools. Never invent capabilities.
- "remove X from techStack" or "add X to project" = updateProject (never deletion).
- "delete project/experience" = flag tool first, then confirm tool after explicit user yes.
- Deletion needs confirmToken from flag tool - never call confirm without it.
- For updateProject: always call getPortfolioSnapshot first to get current field values, then merge changes.
- Confirm what changed after every write. Be brief and precise.`,

            tools: {

                // ─────────────────────────────────────────────
                // READ: FULL PORTFOLIO SNAPSHOT
                // ─────────────────────────────────────────────
                getPortfolioSnapshot: tool({
                    description:
                        "Fetch all portfolio data: profile, projects, and experiences. Call before any update to get current field values.",
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
                        "Update profile fields: name, bio, description, contact, endNote, social links.",
                    inputSchema: profileSchema,
                    execute: async ({ fullname, bio, description, contact, endNote, github, linkedin, twitter }) => {
                        const socialLinks = [github, linkedin, twitter]
                            .map(safeUrl)
                            .filter((link) => link !== "");

                        const updated = await Info.findOneAndUpdate(
                            { userId },
                            { fullname, bio, description, contact: safeEmail(contact), endNote: endNote ?? "", socialLinks },
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
                        "Change portfolio theme. Options: default-dark or default-light.",
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
                        "Add a new project to the portfolio. Do not use for editing existing projects.",
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
                            projectUrl: safeUrl(projectUrl),
                            githubUrl: safeUrl(githubUrl),
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
                        "Update an existing project by slug. ALWAYS call getPortfolioSnapshot first to get current values, then merge - only override the fields the user asked to change.",
                    inputSchema: projectWriteSchema.extend({
                        slug: z.string().describe("The unique slug of the project to update. Required for identification."),
                    }),
                    execute: async ({ slug, title, tagline, description, techStack, features, projectUrl, githubUrl }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        // Fetch current project first - model may pass empty strings for unchanged fields
                        const current = await Project.findOne({ slug, infoId: infoDoc._id }).lean();
                        if (!current) return { error: `No project found with slug "${slug}" in your portfolio.` };

                        // Merge: only replace a field if the model actually provided a non-empty value
                        const merged = {
                            title: title?.trim() || current.title,
                            tagline: tagline?.trim() || current.tagline,
                            description: description?.trim() || current.description,
                            techStack: techStack?.length ? techStack : current.techStack,
                            features: features?.length ? features : current.features,
                            projectUrl: safeUrl(projectUrl) || current.projectUrl || "",
                            githubUrl: safeUrl(githubUrl) || current.githubUrl || "",
                        };

                        const updated = await Project.findOneAndUpdate(
                            { slug, infoId: infoDoc._id },
                            merged,
                            { new: true, runValidators: true }
                        );

                        if (!updated) return { error: `Update failed for slug "${slug}".` };
                        return { success: true, slug: updated.slug, title: updated.title, techStack: updated.techStack };
                    },
                }),

                // ─────────────────────────────────────────────
                // DELETE PHASE 1: FLAG PROJECT
                // ─────────────────────────────────────────────
                flagProjectForDeletion: tool({
                    description:
                        "Phase 1 of deletion: look up project by slug, return details and a confirmToken. Never deletes. Must be called before confirmProjectDeletion.",
                    inputSchema: z.object({
                        slug: z.string().describe("The slug of the project the user wants to delete."),
                    }),
                    execute: async ({ slug }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const project = await Project.findOne({ slug, infoId: infoDoc._id }).lean();
                        if (!project) return { error: `No project found with slug "${slug}".` };

                        // Generate a one-time confirmation token the model must pass back.
                        // This makes it physically impossible to delete without the token.
                        const confirmToken = `delete-${slug}-${Date.now()}`;

                        return {
                            flagged: true,
                            slug: project.slug,
                            title: project.title,
                            tagline: project.tagline,
                            confirmToken,
                            instruction: `Present the project details to the user and ask for explicit confirmation. Once the user confirms, call confirmProjectDeletion with slug and confirmToken "${confirmToken}".`,
                        };
                    },
                }),

                // ─────────────────────────────────────────────
                // DELETE PHASE 2: CONFIRM PROJECT DELETION
                // ─────────────────────────────────────────────
                confirmProjectDeletion: tool({
                    description:
                        "Phase 2 of deletion: permanently delete project. Requires confirmToken from flagProjectForDeletion. Only call after explicit user confirmation.",
                    inputSchema: z.object({
                        slug: z.string().describe("The slug of the project to delete."),
                        confirmToken: z.string().describe("The confirmToken returned by flagProjectForDeletion. Required - do not call without it."),
                    }),
                    execute: async ({ slug, confirmToken }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        // Token must start with the correct prefix - basic integrity check
                        if (!confirmToken.startsWith(`delete-${slug}-`)) {
                            return { error: "Invalid confirmation token. Run flagProjectForDeletion again to get a valid token." };
                        }

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
                        "Add a new work experience entry (job, internship, freelance).",
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
                        "Update an existing experience by _id. Call getPortfolioSnapshot first if you need the _id.",
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
                        "Phase 1 of experience deletion: look up by _id, return details and confirmToken. Never deletes.",
                    inputSchema: z.object({
                        experienceId: z.string().describe("The MongoDB _id of the experience entry to delete."),
                    }),
                    execute: async ({ experienceId }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        const exp = await Experience.findOne({ _id: experienceId, infoId: infoDoc._id }).lean();
                        if (!exp) return { error: `No experience found with id "${experienceId}".` };

                        const confirmToken = `delete-exp-${experienceId}-${Date.now()}`;

                        return {
                            flagged: true,
                            experienceId,
                            company: exp.company,
                            role: exp.role,
                            confirmToken,
                            instruction: `Present the experience details to the user and ask for explicit confirmation. Once confirmed, call confirmExperienceDeletion with experienceId and confirmToken "${confirmToken}".`,
                        };
                    },
                }),

                // ─────────────────────────────────────────────
                // DELETE PHASE 2: CONFIRM EXPERIENCE DELETION
                // ─────────────────────────────────────────────
                confirmExperienceDeletion: tool({
                    description:
                        "Phase 2 of experience deletion: permanently delete. Requires confirmToken from flagExperienceForDeletion.",
                    inputSchema: z.object({
                        experienceId: z.string().describe("The MongoDB _id of the experience to delete."),
                        confirmToken: z.string().describe("The confirmToken returned by flagExperienceForDeletion. Required."),
                    }),
                    execute: async ({ experienceId, confirmToken }) => {
                        if (!infoDoc) return { error: "Profile not initialized." };

                        if (!confirmToken.startsWith(`delete-exp-${experienceId}-`)) {
                            return { error: "Invalid confirmation token. Run flagExperienceForDeletion again." };
                        }

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
                        "Fetch visit analytics: total visits, last 7 days, last 30 days, top countries.",
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