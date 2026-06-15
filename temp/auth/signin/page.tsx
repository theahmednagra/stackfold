"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginUserInput, loginUserSchema } from "@/schemas/loginUserSchema";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

export const LoginForm = () => {
    const router = useRouter();

    const { user, setUser } = useAppContext();

    useEffect(() => {
        if (user) {
            router.push("/home")
        }
    }, [router, user]);

    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState } = useForm<LoginUserInput>({
        resolver: zodResolver(loginUserSchema),
    });
    const { errors } = formState;

    const onSubmit = async (data: LoginUserInput) => {
        try {
            setIsLoading(true);

            const res = await fetch("/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const result = await res.json();

            if (res.status === 403 && result.isVerified === false) {
                router.push(`/verify?email=${encodeURIComponent(data.email)}`);
                toast.info(result.message);
                return;
            }
            if (!res.ok) {
                throw new Error(result.message || "Something went wrong");
            }

            if (result.user) setUser(result.user);

            toast.success(result.message || "Logged in successfully");

            router.push("/home");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unexpected error occured");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
            {/* Ambient background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Sign in to continue to your portfolio
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-linear-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-800/50 shadow-2xl p-6 sm:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                {...register("email")}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                {/* <a
                                    href="#"
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Forgot?
                                </a> */}
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...register("password")}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative px-6 py-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <svg
                                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                                            />
                                        </svg>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700/50" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-800/50 text-gray-400">
                                Don't have an account?
                            </span>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <Link
                        href="/signup"
                        className="block w-full text-center px-6 py-3 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50 text-white font-medium rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                        Create Account
                    </Link>
                </div>

                {/* Footer */}
                {/* <p className="text-center text-sm text-gray-500 mt-6">
                    Protected by industry-standard encryption
                </p> */}
            </div>
        </div>
    );
};

export default LoginForm