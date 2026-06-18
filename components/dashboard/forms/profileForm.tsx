"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, ProfileFormValues } from "@/schemas/profileSchema";
import {
  FiUser,
  FiFileText,
  FiMail,
  FiHeart,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";
import { useToast } from "@/context/toast-context";

interface ProfileFormProps {
  initialData?: Partial<ProfileFormValues> | null;
  onComplete: () => void;
}

export default function ProfileInfoForm({ initialData, onComplete }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { showToast } = useToast();

  const isExistingProfile = !!initialData?.fullname;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData || {
      fullname: "",
      bio: "",
      description: "",
      contact: "",
      endNote: "",
      socialLinks: { github: "", linkedin: "", twitter: "" },
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setApiError(null);

    const payload = {
      fullname: data.fullname,
      bio: data.bio,
      description: data.description,
      contact: data.contact,
      endNote: data.endNote || "",
      socialLinks: {
        github: data.socialLinks?.github || "",
        linkedin: data.socialLinks?.linkedin || "",
        twitter: data.socialLinks?.twitter || "",
      },
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save profile changes.");
      }

      reset(data);
      showToast("success", isExistingProfile ? "Changes saved successfully!" : "Profile created successfully!");

      onComplete();

    } catch (error: any) {
      showToast("error", error.message || "Something went wrong.");
      setApiError(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-10 bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-8 sm:p-10 backdrop-blur-md shadow-2xl"
    >
      {/* Form Header */}
      <div className="border-b border-portfolio-border/80 pb-6">
        <h2 className="text-[24px] font-bold tracking-tight text-portfolio-text">
          {isExistingProfile ? "Edit Profile Settings" : "Setup Core Profile"}
        </h2>
        <p className="text-[14px] text-portfolio-muted font-normal mt-1.5 leading-relaxed">
          This information will populate your personal portfolio landing section.
        </p>
      </div>

      {/* Error Alert Display */}
      {apiError && (
        <div className="flex items-center gap-3 p-4 text-[14px] font-medium bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl animate-fade-in">
          <FiAlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Core Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
            Full Name
          </label>
          <div className="relative flex items-center">
            <FiUser className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
            <input
              {...register("fullname")}
              className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.fullname
                ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
                : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                }`}
              placeholder="Muhammad Ahmed"
            />
          </div>
          {errors.fullname && (
            <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
              <FiAlertCircle className="w-3.5 h-3.5" /> {errors.fullname.message}
            </p>
          )}
        </div>

        {/* Contact Email */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
            Contact Email
          </label>
          <div className="relative flex items-center">
            <FiMail className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
            <input
              {...register("contact")}
              type="email"
              className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.contact
                ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
                : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                }`}
              placeholder="hello@yourdomain.com"
            />
          </div>
          {errors.contact && (
            <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
              <FiAlertCircle className="w-3.5 h-3.5" /> {errors.contact.message}
            </p>
          )}
        </div>
      </div>

      {/* Tagline / Bio */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
          Tagline / Bio
        </label>
        <div className="relative flex items-center">
          <FiHeart className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
          <input
            {...register("bio")}
            className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.bio
              ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
              : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
              }`}
            placeholder="Building scalable web experiences."
          />
        </div>
        {errors.bio && (
          <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
            <FiAlertCircle className="w-3.5 h-3.5" /> {errors.bio.message}
          </p>
        )}
      </div>

      {/* Detailed Description */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
          Detailed About Me
        </label>
        <div className="relative flex flex-col">
          <FiFileText className="absolute left-4 top-4 w-4.5 h-4.5 text-portfolio-text/40" />
          <textarea
            {...register("description")}
            rows={5}
            className={`w-full p-4 pl-12 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all resize-none leading-relaxed custom-scrollbar ${errors.description
              ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
              : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
              }`}
            placeholder="Write a comprehensive overview of your skills and history..."
          />
        </div>
        {errors.description && (
          <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
            <FiAlertCircle className="w-3.5 h-3.5" /> {errors.description.message}
          </p>
        )}
      </div>

      {/* End Note */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5 flex items-center gap-2">
          End Note
          <span className="text-[12px] text-portfolio-muted/80 font-normal normal-case italic">(Optional)</span>
        </label>
        <input
          {...register("endNote")}
          className={`w-full h-12 px-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.endNote
            ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
            : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
            }`}
          placeholder="Thanks for visiting my portfolio!"
        />
        {errors.endNote && (
          <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
            <FiAlertCircle className="w-3.5 h-3.5" /> {errors.endNote.message}
          </p>
        )}
      </div>

      {/* Separator rule line */}
      <div className="h-px bg-portfolio-border/80 my-4" />

      {/* Social Links Sub-Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight text-portfolio-text">
            Social Presence
          </h3>
          <p className="text-[13px] text-portfolio-muted font-normal mt-0.5">
            Provide direct links to your external professional network.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* GitHub */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-semibold tracking-wider text-portfolio-text/80 pl-0.5">
              GitHub URL
            </label>
            <div className="relative flex items-center">
              <FiGithub className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
              <input
                {...register("socialLinks.github")}
                className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[14px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.socialLinks?.github
                  ? "border-red-500 focus:border-red-500"
                  : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                  }`}
                placeholder="https://github.com/username"
              />
            </div>
            {errors.socialLinks?.github && (
              <p className="text-[12px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.socialLinks.github.message}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-semibold tracking-wider text-portfolio-text/80 pl-0.5">
              LinkedIn URL
            </label>
            <div className="relative flex items-center">
              <FiLinkedin className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
              <input
                {...register("socialLinks.linkedin")}
                className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[14px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.socialLinks?.linkedin
                  ? "border-red-500 focus:border-red-500"
                  : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                  }`}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            {errors.socialLinks?.linkedin && (
              <p className="text-[12px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.socialLinks.linkedin.message}</p>
            )}
          </div>

          {/* Twitter */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-semibold tracking-wider text-portfolio-text/80 pl-0.5">
              Twitter URL
            </label>
            <div className="relative flex items-center">
              <FiTwitter className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
              <input
                {...register("socialLinks.twitter")}
                className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[14px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.socialLinks?.twitter
                  ? "border-red-500 focus:border-red-500"
                  : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                  }`}
                placeholder="https://twitter.com/username"
              />
            </div>
            {errors.socialLinks?.twitter && (
              <p className="text-[12px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.socialLinks.twitter.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Control Submission Row */}
      <div className="flex justify-end pt-5 border-t border-portfolio-border/80">
        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className={`flex items-center gap-2.5 px-6 h-12 rounded-xl text-[14px] font-bold transition-all select-none border ${!isDirty || isSubmitting
            ? "bg-portfolio-card border-portfolio-border text-portfolio-text/30 cursor-not-allowed opacity-40"
            : "bg-portfolio-text border-portfolio-text text-portfolio-bg hover:bg-portfolio-text/90 active:scale-[0.98] shadow-[0_4px_24px_var(--color-portfolio-glow)] cursor-pointer"
            }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-portfolio-bg/30 border-t-portfolio-bg animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <FiCheckCircle className="w-4.5 h-4.5" />
              <span>{isExistingProfile ? "Save Changes" : "Create Profile"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}