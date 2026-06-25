import { z } from "zod";

// Helper to validate file types and sizes safely on the client side
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

const fileValidation = z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 2MB.`)
    .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only .jpg, .png, .webp and .svg formats are supported."
    )
    .optional();

export const projectFormSchema = z.object({
    title: z
        .string()
        .min(3, "Project title must be at least 3 characters.")
        .max(100, "Title is too long."),

    tagline: z
        .string()
        .min(5, "Give your project a punchy tagline.")
        .max(150, "Tagline cannot exceed 150 characters."),

    description: z
        .string()
        .min(20, "Please write a descriptive overview of what you built."),

    // Accept either a new File upload or a previously saved secure string URL
    imageFile: fileValidation.or(z.string().url()).or(z.literal("")).optional(),
    iconFile: fileValidation.or(z.string().url()).or(z.literal("")).optional(),

    projectUrl: z
        .string()
        .url("Please enter a valid website URL.")
        .optional()
        .or(z.literal("")),

    githubUrl: z
        .string()
        .url("Please enter a valid GitHub repository URL.")
        .optional()
        .or(z.literal("")),

    // Tech stack managed via dynamic badge inputs
    techStack: z
        .array(z.string())
        .min(1, "Please add at least one technology tag (e.g., React)."),

    // Features structured as an object array to keep useFieldArray happy
    features: z
        .array(
            z.object({
                text: z.string().min(3, "Feature description must be at least 3 characters."),
            })
        )
        .min(1, "Add at least one key feature or milestone of this project."),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;