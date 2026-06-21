"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authFormSchema, type AuthFormValues } from "@/schemas/authSchema";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowLeft,
  FiLoader
} from "react-icons/fi";
import { useToast } from "@/context/toast-context";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

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
  const capturedEmail = watch("email");

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

    let endpoint = "/api/auth/signin";
    if (data.mode === "signup") endpoint = "/api/auth/signup";
    if (data.mode === "verify") endpoint = "/api/auth/verify";

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
        showToast("success", "Account created! Please verify your email identity token.");
        setValue("mode", "verify");
        clearErrors();
      } else if (data.mode === "verify") {
        showToast("success", "Email successfully verified. Welcome onboard!");

        router.push("/dashboard");
        router.refresh();
      } else {
        showToast("success", "Welcome back! Authorization validated.");

        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      // Active toast alert notification
      showToast("error", err.message || "An unexpected system verification error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* overflow-y-scroll forces a continuous vertical track layer to prevent page container layout-snapping */
    <div className="w-full bg-portfolio-bg flex flex-col justify-center items-center p-4 overflow-y-scroll custom-scrollbar">
      <div className="w-full max-w-md bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden transition-all duration-300 ease-in-out">

        {/* Decorative Top Accent Light Glow line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-portfolio-accent/60 to-transparent" />

        {/* Header Block Section */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-portfolio-bg border border-portfolio-border/80 flex items-center justify-center mx-auto text-portfolio-accent shadow-xl">
            <FiShield className="w-5 h-5 stroke-2" />
          </div>
          <h2 className="text-[22px] font-bold text-portfolio-text tracking-tight pt-1">
            {currentMode === "signin" && "Welcome Back"}
            {currentMode === "signup" && "Create Account"}
            {currentMode === "verify" && "Verify Email"}
          </h2>
          <p className="text-[13.5px] text-portfolio-muted leading-relaxed px-4">
            {currentMode === "signin" && "Sign in to manage your portfolio applications"}
            {currentMode === "signup" && "Onboard your developer identity attributes"}
            {currentMode === "verify" && `Enter the 6-digit verification security token sent to ${capturedEmail || "your email"}`}
          </p>
        </div>

        {/* Premium Sliding Mode Switcher Tab (Hidden in Verification View) */}
        {currentMode !== "verify" && (
          <div className="p-1 bg-portfolio-bg border border-portfolio-border/60 rounded-xl grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleSwitchMode("signin")}
              className={`h-9 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${currentMode === "signin"
                ? "bg-portfolio-card text-portfolio-text shadow-md"
                : "text-portfolio-muted hover:text-portfolio-text"
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode("signup")}
              className={`h-9 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${currentMode === "signup"
                ? "bg-portfolio-card text-portfolio-text shadow-md"
                : "text-portfolio-muted hover:text-portfolio-text"
                }`}
            >
              Register
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {currentMode === "verify" ? (
            /* Premium Verification Code Section */
            <div className="space-y-2 animate-fadeIn">
              <label className="text-[12px] font-bold tracking-wider text-portfolio-text/40 uppercase">
                Verification Code
              </label>
              <div className="relative">
                <input
                  {...register("code")}
                  maxLength={6}
                  type="text"
                  className="w-full h-12 bg-portfolio-bg border border-portfolio-border/80 rounded-xl text-portfolio-text text-center tracking-[0.6em] font-mono text-[20px] font-bold focus:outline-none focus:border-portfolio-accent/60 focus:ring-1 focus:ring-portfolio-accent/30 placeholder:tracking-normal placeholder:font-sans placeholder:text-[14px] placeholder:text-portfolio-text/20 transition-all"
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>
              {errors.code && <p className="text-[12px] text-red-400 font-medium">{errors.code.message}</p>}
            </div>
          ) : (
            /* Signin & Signup Input Fields Layer */
            <div className="space-y-4">

              {/* Animated Username Block Wrapper */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${currentMode === "signup" ? "grid-rows-[1fr] opacity-100 mb-1" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                  }`}
              >
                <div className="overflow-hidden space-y-1.5">
                  <label className="text-[12px] font-bold tracking-wider text-portfolio-text/40 uppercase">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3.5 flex items-center text-portfolio-text/30 pointer-events-none">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <input
                      {...register("username")}
                      type="text"
                      tabIndex={currentMode === "signup" ? 0 : -1}
                      className="w-full h-11 pl-10 pr-4 bg-portfolio-bg border border-portfolio-border/80 rounded-xl text-portfolio-text text-[14px] focus:outline-none focus:border-portfolio-accent/60 focus:ring-1 focus:ring-portfolio-accent/30 placeholder:text-portfolio-text/20 transition-all"
                      placeholder="alex_dev"
                    />
                  </div>
                  {errors.username && <p className="text-[12px] text-red-400 font-medium">{errors.username.message}</p>}
                </div>
              </div>

              {/* Email Input Field (Always Visible) */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold tracking-wider text-portfolio-text/40 uppercase">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center text-portfolio-text/30 pointer-events-none">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full h-11 pl-10 pr-4 bg-portfolio-bg border border-portfolio-border/80 rounded-xl text-portfolio-text text-[14px] focus:outline-none focus:border-portfolio-accent/60 focus:ring-1 focus:ring-portfolio-accent/30 placeholder:text-portfolio-text/20 transition-all"
                    placeholder="you@domain.com"
                  />
                </div>
                {errors.email && <p className="text-[12px] text-red-400 font-medium">{errors.email.message}</p>}
              </div>

              {/* Password Input Field (Always Visible) */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold tracking-wider text-portfolio-text/40 uppercase">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center text-portfolio-text/30 pointer-events-none">
                    <FiLock className="w-4 h-4" />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className="w-full h-11 pl-10 pr-10 bg-portfolio-bg border border-portfolio-border/80 rounded-xl text-portfolio-text text-[14px] focus:outline-none focus:border-portfolio-accent/60 focus:ring-1 focus:ring-portfolio-accent/30 placeholder:text-portfolio-text/20 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-portfolio-text/40 hover:text-portfolio-text/70 cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[12px] text-red-400 font-medium">{errors.password.message}</p>}
              </div>

              {/* Animated Confirm Password Block Wrapper */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${currentMode === "signup" ? "grid-rows-[1fr] opacity-100 pt-1" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                  }`}
              >
                <div className="overflow-hidden space-y-1.5">
                  <label className="text-[12px] font-bold tracking-wider text-portfolio-text/40 uppercase">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3.5 flex items-center text-portfolio-text/30 pointer-events-none">
                      <FiLock className="w-4 h-4" />
                    </div>
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      tabIndex={currentMode === "signup" ? 0 : -1}
                      className="w-full h-11 pl-10 pr-10 bg-portfolio-bg border border-portfolio-border/80 rounded-xl text-portfolio-text text-[14px] focus:outline-none focus:border-portfolio-accent/60 focus:ring-1 focus:ring-portfolio-accent/30 placeholder:text-portfolio-text/20 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-portfolio-text/40 hover:text-portfolio-text/70 cursor-pointer"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[12px] text-red-400 font-medium">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Core Interactive Action Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-portfolio-text text-portfolio-bg hover:bg-portfolio-text/90 disabled:bg-portfolio-text/40 font-bold rounded-xl text-[13px] tracking-wide inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed select-none shadow-xl mt-2"
          >
            {isSubmitting ? (
              <FiLoader className="w-4 h-4 animate-spin stroke-3" />
            ) : (
              <>
                {currentMode === "signin" && "Sign In Account"}
                {currentMode === "signup" && "Register Account"}
                {currentMode === "verify" && "Verify Security Tokens"}
              </>
            )}
          </button>
        </form>

        {/* Dynamic Navigation Sub-Footers */}
        {currentMode === "verify" && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setValue("mode", "signup")}
              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-portfolio-muted hover:text-portfolio-text transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-3.5 h-3.5" /> Return to registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}