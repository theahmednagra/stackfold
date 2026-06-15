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
        // 1. Get the current real-world date and normalize it to the 1st of the month at midnight
        const realCurrentDate = new Date();
        const currentYearMonth = new Date(
            realCurrentDate.getFullYear(),
            realCurrentDate.getMonth(),
            1
        );

        // 2. Normalize the user's input dates to the 1st of their respective months at midnight
        const [startYear, startMonth] = data.startDate.split("-").map(Number);
        const start = new Date(startYear, startMonth - 1, 1); // JS months are 0-indexed

        // Future Check for Start Date
        if (start > currentYearMonth) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Start date cannot be set in the future.",
                path: ["startDate"],
            });
        }

        // If it's a current job, stop evaluating the end date completely
        if (data.currentJob) {
            return;
        }

        // Presence Check for End Date
        if (!data.endDate || data.endDate.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please specify an end date or mark as 'Current Job'.",
                path: ["endDate"],
            });
            return;
        }

        const [endYear, endMonth] = data.endDate.split("-").map(Number);
        const end = new Date(endYear, endMonth - 1, 1);

        // Future Check for End Date
        if (end > currentYearMonth) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End date cannot be set in the future.",
                path: ["endDate"],
            });
        }

        // Sequence Check: Compare timestamps reliably
        if (end < start) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End date cannot be chronologically earlier than your start date.",
                path: ["endDate"],
            });
        }
    });