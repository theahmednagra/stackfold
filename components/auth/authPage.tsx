"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authFormSchema, type AuthFormValues } from "@/schemas/authSchema";

export default function AuthPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        clearErrors,
        formState: { errors },
        reset,
    } = useForm<AuthFormValues>({
        resolver: zodResolver(authFormSchema),
        mode: "onChange",
        defaultValues: {
            mode: "signin",
            email: "",
            password: "",
            username: "",
            confirmPassword: "",
            code: "",
        },
    });

    const currentMode = watch("mode");
    const capturedEmail = watch("email"); // Keeps track of email for verification payload

    // Toggles cleanly between standard entry viewpoints
    const handleSwitchMode = (targetMode: "signin" | "signup") => {
        clearErrors();
        reset({
            mode: targetMode,
            email: "",
            password: "",
            username: "",
            confirmPassword: "",
            code: "",
        });
    };

    const onSubmit = async (data: AuthFormValues) => {
        setIsSubmitting(true);
        setApiError(null);

        // 1. Set up your endpoints based on the active mode
        let endpoint = "/api/auth/signin";
        if (data.mode === "signup") endpoint = "/api/auth/signup";
        if (data.mode === "verify") endpoint = "/api/auth/verify";

        // 2. Simply send everything cleanly!
        // We only patch the email field for the "verify" step since the UI input hides it.
        const payload = data.mode === "verify"
            ? { ...data, email: capturedEmail }
            : data;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Action execution failed.");

            if (data.mode === "signup") {
                // alert("Registration complete! Check your email for your verification code.");
                // FIX: Update mode explicitly to verify view. Preserve email state!
                setValue("mode", "verify");
                clearErrors();
            } else if (data.mode === "verify") {
                // alert("Account verified successfully! Logging you in...");
                // Handle router push to main layout dashboard here
            } else {
                // alert("Authenticated! Welcome to your dashboard.");
                // Handle login token / redirect here
            }
        } catch (err: any) {
            setApiError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {currentMode === "signin" && "Welcome Back"}
                    {currentMode === "signup" && "Create Account"}
                    {currentMode === "verify" && "Verify Email"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {currentMode === "signin" && "Sign in to manage your portfolio applications"}
                    {currentMode === "signup" && "Onboard your developer identity attributes"}
                    {currentMode === "verify" && `Enter the 6-digit code sent to ${capturedEmail}`}
                </p>
            </div>

            {apiError && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md mb-4">
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Verification Code Input State */}
                {currentMode === "verify" ? (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">6-Digit Verification Token</label>
                        <input
                            {...register("code")}
                            maxLength={6}
                            className="p-2.5 border rounded-md text-gray-700 border-gray-300 text-center tracking-widest font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="000000"
                        />
                        {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
                    </div>
                ) : (
                    /* Signin & Signup Common Fields */
                    <>
                        {currentMode === "signup" && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Username</label>
                                <input
                                    {...register("username")}
                                    className="p-2.5 border rounded-md text-gray-700 border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="alex_dev"
                                />
                                {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                {...register("email")}
                                type="email"
                                className="p-2.5 border rounded-md text-gray-700 border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder="you@domain.com"
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                {...register("password")}
                                type="password"
                                className="p-2.5 border rounded-md text-gray-700 border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        {currentMode === "signup" && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                                <input
                                    {...register("confirmPassword")}
                                    type="password"
                                    className="p-2.5 border rounded-md text-gray-700 border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                            </div>
                        )}
                    </>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2.5 rounded-md text-sm transition-colors mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Processing..." : ""}
                    {!isSubmitting && currentMode === "signin" && "Sign In"}
                    {!isSubmitting && currentMode === "signup" && "Register Account"}
                    {!isSubmitting && currentMode === "verify" && "Verify Account Tokens"}
                </button>
            </form>

            {/* Navigation Footers */}
            <div className="text-center mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500">
                {currentMode === "signin" && (
                    <>
                        New to the system?{" "}
                        <button type="button" onClick={() => handleSwitchMode("signup")} className="text-blue-600 font-semibold hover:underline">
                            Create an account
                        </button>
                    </>
                )}
                {currentMode === "signup" && (
                    <>
                        Already setup?{" "}
                        <button type="button" onClick={() => handleSwitchMode("signin")} className="text-blue-600 font-semibold hover:underline">
                            Sign in here
                        </button>
                    </>
                )}
                {currentMode === "verify" && (
                    <button
                        type="button"
                        onClick={() => setValue("mode", "signup")}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600 underline"
                    >
                        ← Return to signup page
                    </button>
                )}
            </div>
        </div>
    );
}