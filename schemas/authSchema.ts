import { z } from "zod";

export const authFormSchema = z
    .object({
        mode: z.enum(["signin", "signup", "verify"]),
        email: z
            .string()
            .min(1, "Email is required.")
            .email("Please enter a valid email address.")
            .lowercase()
            .trim(),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters long."),
        username: z
            .string()
            .min(3, "Username must be at least 3 characters.")
            .max(20, "Username cannot exceed 20 characters.")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.")
            .trim()
            .optional()
            .or(z.literal("")),
        confirmPassword: z
            .string()
            .optional()
            .or(z.literal("")),
        // Alphanumeric or numeric string validation for OTP code
        code: z
            .string()
            .length(6, "Verification code must be exactly 6 characters.")
            .optional()
            .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        // Escape check paths contextually based on active screen states
        if (data.mode === "signin") return;

        if (data.mode === "verify") {
            if (!data.code || data.code.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Please enter your 6-digit verification code.",
                    path: ["code"],
                });
            }
            return;
        }

        // Signup validations
        if (!data.username || data.username.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Username is required to create an account.",
                path: ["username"],
            });
        }

        if (!data.confirmPassword || data.confirmPassword.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please confirm your password.",
                path: ["confirmPassword"],
            });
            return;
        }

        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Passwords do not match.",
                path: ["confirmPassword"],
            });
        }
    });

export type AuthFormValues = z.infer<typeof authFormSchema>;