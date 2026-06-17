"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, ProfileFormValues } from "@/schemas/profileSchema";

interface ProfileFormProps {
  initialData?: Partial<ProfileFormValues> | null;
}

export default function ProfileInfoForm({ initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Determine if we are updating or creating for the first time
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

  // Keep form fields synced if initialData fetches/hydrates late from the server component
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
        method: "PUT", // Updated to PUT to match our idempotent upsert architecture
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save profile changes.");
      }

      // Reset form status to pristine using the current user entries
      reset(data);
      alert(isExistingProfile ? "Changes saved successfully!" : "Profile created successfully!");
    } catch (error: any) {
      setApiError(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {isExistingProfile ? "Edit Profile Settings" : "Setup Core Profile"}
        </h2>
        <p className="text-sm text-gray-500">
          This information will populate your personal portfolio landing section.
        </p>
      </div>

      {apiError && (
        <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
          {apiError}
        </div>
      )}

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Full Name</label>
        <input
          {...register("fullname")}
          className={`p-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 ${errors.fullname ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
            }`}
          placeholder="John Doe"
        />
        {errors.fullname && <p className="text-xs text-red-500">{errors.fullname.message}</p>}
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Tagline / Bio</label>
        <input
          {...register("bio")}
          className={`p-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 ${errors.bio ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
            }`}
          placeholder="Building scalable web experiences."
        />
        {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Detailed About Me</label>
        <textarea
          {...register("description")}
          rows={4}
          className={`p-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 ${errors.description ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
            }`}
          placeholder="Write a comprehensive overview of your skills and history..."
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      {/* Contact Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Contact Email</label>
        <input
          {...register("contact")}
          type="email"
          className={`p-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 ${errors.contact ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
            }`}
          placeholder="hello@yourdomain.com"
        />
        {errors.contact && <p className="text-xs text-red-500">{errors.contact.message}</p>}
      </div>

      {/* End Note */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          End Note <span className="text-xs text-gray-400">(Optional)</span>
        </label>
        <input
          {...register("endNote")}
          className={`p-2 border text-gray-700 rounded-md focus:outline-none focus:ring-2 ${errors.endNote ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
            }`}
          placeholder="Thanks for visiting my portfolio!"
        />
        {errors.endNote && <p className="text-xs text-red-500">{errors.endNote.message}</p>}
      </div>

      <hr className="border-gray-200 my-4" />

      {/* Social Links Sub-Section */}
      <div>
        <h3 className="text-md font-medium text-gray-900">Social Presence</h3>
        <p className="text-xs text-gray-500 mb-4">Provide links to your professional profiles.</p>

        <div className="space-y-4">
          {/* GitHub */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">GitHub URL</label>
            <input
              {...register("socialLinks.github")}
              className={`p-2 border text-gray-700 text-sm rounded-md focus:outline-none focus:ring-2 ${errors.socialLinks?.github ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                }`}
              placeholder="https://github.com/username"
            />
            {errors.socialLinks?.github && <p className="text-xs text-red-500">{errors.socialLinks.github.message}</p>}
          </div>

          {/* LinkedIn */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">LinkedIn URL</label>
            <input
              {...register("socialLinks.linkedin")}
              className={`p-2 border text-gray-700 text-sm rounded-md focus:outline-none focus:ring-2 ${errors.socialLinks?.linkedin ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                }`}
              placeholder="https://linkedin.com/in/username"
            />
            {errors.socialLinks?.linkedin && <p className="text-xs text-red-500">{errors.socialLinks.linkedin.message}</p>}
          </div>

          {/* Twitter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Twitter URL</label>
            <input
              {...register("socialLinks.twitter")}
              className={`p-2 border text-gray-700 text-sm rounded-md focus:outline-none focus:ring-2 ${errors.socialLinks?.twitter ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                }`}
              placeholder="https://twitter.com/username"
            />
            {errors.socialLinks?.twitter && <p className="text-xs text-red-500">{errors.socialLinks.twitter.message}</p>}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className={`px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-all
            ${!isDirty || isSubmitting
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm"
            }`}
        >
          {isSubmitting ? "Saving changes..." : isExistingProfile ? "Save Changes" : "Create Profile"}
        </button>
      </div>
    </form>
  );
}