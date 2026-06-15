import { z } from "zod";

export const profileFormSchema = z.object({
    fullname: z
        .string()
        .min(2, "Name must be at least 2 characters.")
        .max(50, "Name cannot exceed 50 characters.")
        .trim(),

    bio: z
        .string()
        .min(10, "Bio should be a punchy one-liner (at least 10 characters).")
        .max(160, "Keep your bio under 160 characters (like a Twitter bio).")
        .trim(),

    description: z
        .string()
        .min(20, "Tell us a bit more about yourself (at least 20 characters).")
        .trim(),

    contact: z
        .string()
        .email("Please enter a valid professional email address.")
        .trim(),

    endNote: z
        .string()
        .max(200, "Keep your footer endnote under 200 characters.")
        .optional()
        .or(z.literal("")), // Allows empty string instead of failing on optional

    // Structured fields for the UI layer
    socials: z.object({
        github: z
            .string()
            .url("Please enter a valid GitHub URL.")
            .regex(/github\.com/, "Must be a valid github.com link.")
            .optional()
            .or(z.literal("")),
        linkedin: z
            .string()
            .url("Please enter a valid LinkedIn URL.")
            .regex(/linkedin\.com/, "Must be a valid linkedin.com link.")
            .optional()
            .or(z.literal("")),
        twitter: z
            .string()
            .url("Please enter a valid X/Twitter URL.")
            .regex(/(twitter\.com|x\.com)/, "Must be a valid twitter.com or x.com link.")
            .optional()
            .or(z.literal("")),
    }),
});

// Extract the TypeScript type directly from our Zod schema
export type ProfileFormValues = z.infer<typeof profileFormSchema>;