import { z } from "zod";

export const experienceFormSchema = z
    .object({
        company: z
            .string()
            .min(2, "Company name must be at least 2 characters.")
            .trim(),

        role: z
            .string()
            .min(2, "Role/Position title must be at least 2 characters.")
            .trim(),

        startDate: z
            .string()
            .min(1, "Please select a valid starting date."),

        currentJob: z
            .boolean()
            .default(false),

        endDate: z
            .string()
            .nullable()
            .optional()
            .or(z.literal("")),

        description: z
            .string()
            .min(10, "Please provide a brief summary of your duties or achievements.")
            .trim(),
    })
    .superRefine((data, ctx) => {
        // 1. Get current real world date in clean UTC configuration
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // 1-12 range

        // 2. Extract inputs
        const [startYear, startMonth] = data.startDate.split("-").map(Number);

        // 3. Start Date Future Check
        if (startYear > currentYear || (startYear === currentYear && startMonth > currentMonth)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Start date cannot be set in the future.",
                path: ["startDate"],
            });
        }

        // Escape validation loop if current job is checked
        if (data.currentJob) {
            return;
        }

        // 4. Presence check for End Date
        if (!data.endDate || data.endDate.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please specify an end date or mark as 'Current Job'.",
                path: ["endDate"],
            });
            return;
        }

        const [endYear, endMonth] = data.endDate.split("-").map(Number);

        // 5. End Date Future Check
        if (endYear > currentYear || (endYear === currentYear && endMonth > currentMonth)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End date cannot be set in the future.",
                path: ["endDate"],
            });
        }

        // 6. Chronological Order Sequence Check
        if (endYear < startYear || (endYear === startYear && endMonth < startMonth)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End date cannot be chronologically earlier than your start date.",
                path: ["endDate"],
            });
        }
    });

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;