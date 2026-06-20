"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectFormSchema, ProjectFormValues } from "@/schemas/projectSchema";
import {
    FiFolder,
    FiType,
    FiCpu,
    FiLink,
    FiGithub,
    FiImage,
    FiPaperclip,
    FiPlus,
    FiTrash2,
    FiCheckCircle,
    FiAlertCircle
} from "react-icons/fi";
import { useToast } from "@/context/toast-context";

interface ProjectFormProps {
    initialData?: any; // Populated if editing an existing project
    onComplete: () => void;
}

export default function ProjectForm({ initialData, onComplete }: ProjectFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState("");

    const iconInputRef = React.useRef<HTMLInputElement | null>(null);
    const imageInputRef = React.useRef<HTMLInputElement | null>(null);

    const isExistingProject = !!initialData?._id;

    const { showToast } = useToast();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty },
        reset,
    } = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: initialData || {
            title: "",
            tagline: "",
            description: "",
            projectUrl: "",
            githubUrl: "",
            techStack: [],
            features: [{ text: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "features",
    });

    const currentTechStack = watch("techStack") || [];

    // ⚡ CATCH MOBILE VIRTUAL COMMAS
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value.endsWith(",")) {
            const cleanTag = value.slice(0, -1).trim();
            if (cleanTag && !currentTechStack.includes(cleanTag)) {
                setValue("techStack", [...currentTechStack, cleanTag], { shouldDirty: true });
            }
            setTagInput("");
            return;
        }

        setTagInput(value);
    };

    // ⚡ ONLY CATCH DESKTOP HARDWARE ENTER KEYS
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const trimmed = tagInput.trim();
            if (trimmed && !currentTechStack.includes(trimmed)) {
                setValue("techStack", [...currentTechStack, trimmed], { shouldDirty: true });
                setTagInput("");
            }
        }
    };

    const removeTechTag = (indexToRemove: number) => {
        setValue(
            "techStack",
            currentTechStack.filter((_, i) => i !== indexToRemove),
            { shouldDirty: true }
        );
    };

    const onSubmit = async (data: ProjectFormValues) => {
        setIsSubmitting(true);
        const formData = new FormData();

        if (initialData?._id) {
            formData.append("_id", initialData._id);
        }

        formData.append("title", data.title);
        formData.append("tagline", data.tagline);
        formData.append("description", data.description);
        formData.append("projectUrl", data.projectUrl || "");
        formData.append("githubUrl", data.githubUrl || "");
        formData.append("techStack", JSON.stringify(data.techStack));

        const flattenedFeatures = data.features.map((f) => f.text);
        formData.append("features", JSON.stringify(flattenedFeatures));

        if (data.imageFile instanceof File || typeof data.imageFile === "string") {
            formData.append("imageFile", data.imageFile);
        }

        if (data.iconFile instanceof File || typeof data.iconFile === "string") {
            formData.append("iconFile", data.iconFile);
        }

        try {
            const response = await fetch("/api/projects", {
                method: initialData?._id ? "PUT" : "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to save project document properties.");

            showToast("success", isExistingProject ? "Project updated successfully!" : "Project created successfully!");
            reset(data);

            onComplete();

        } catch (error: any) {
            showToast("error", error.message || "Something went wrong while saving project.");
            console.error(error);
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
                    {isExistingProject ? "Edit Project Details" : "Project Specifics"}
                </h2>
                <p className="text-[14px] text-portfolio-muted font-normal mt-1.5 leading-relaxed">
                    Showcase your applications, components, or open-source packages.
                </p>
            </div>

            {/* Project Title */}
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
                    Project Title
                </label>
                <div className="relative flex items-center">
                    <FiFolder className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
                    <input
                        {...register("title")}
                        className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.title
                            ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
                            : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                            }`}
                        placeholder="E-Commerce API Dashboard"
                    />
                </div>
                {errors.title && (
                    <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
                        <FiAlertCircle className="w-3.5 h-3.5" /> {errors.title.message}
                    </p>
                )}
            </div>

            {/* Tagline */}
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
                    Tagline
                </label>
                <div className="relative flex items-center">
                    <FiType className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
                    <input
                        {...register("tagline")}
                        className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.tagline
                            ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
                            : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                            }`}
                        placeholder="A minimal, lightning-fast dashboard built for developers."
                    />
                </div>
                {errors.tagline && (
                    <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
                        <FiAlertCircle className="w-3.5 h-3.5" /> {errors.tagline.message}
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
                    Detailed Description
                </label>
                <textarea
                    {...register("description")}
                    rows={5}
                    className={`w-full p-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all resize-none leading-relaxed custom-scrollbar ${errors.description
                        ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
                        : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                        }`}
                    placeholder="Provide a comprehensive breakdown of the project architecture, features, and target audience..."
                />
                {errors.description && (
                    <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
                        <FiAlertCircle className="w-3.5 h-3.5" /> {errors.description.message}
                    </p>
                )}
            </div>

            {/* Media Pickers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Project Icon */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
                        Project Icon
                    </label>
                    <div className="relative flex items-center">
                        <input
                            type="file"
                            accept="image/*"
                            ref={iconInputRef}
                            onChange={(e) => setValue("iconFile", e.target.files?.[0] || undefined, { shouldDirty: true })}
                            className="hidden"
                            id="icon-upload-trigger"
                        />
                        <label
                            htmlFor="icon-upload-trigger"
                            className="w-full h-12 px-4 rounded-xl bg-portfolio-bg/70 border border-portfolio-border/80 text-[14px] text-portfolio-text/60 hover:text-portfolio-text flex items-center gap-2.5 cursor-pointer hover:border-portfolio-accent/50 transition-all select-none"
                        >
                            <FiPaperclip className="w-4 h-4 text-portfolio-text/40" />
                            <span>Select app icon asset...</span>
                        </label>
                    </div>

                    {watch("iconFile") && (
                        <div className="mt-2 flex items-center justify-between p-3 bg-portfolio-bg/30 border border-portfolio-border/60 rounded-xl">
                            <div className="flex items-center gap-3">
                                <img
                                    src={watch("iconFile") instanceof File ? URL.createObjectURL(watch("iconFile") as File) : (watch("iconFile") as string)}
                                    alt="Icon preview"
                                    className="w-10 h-10 object-cover rounded-lg border border-portfolio-border/80"
                                />
                                <span className="text-[12px] font-medium text-portfolio-text/70 truncate max-w-35">
                                    {watch("iconFile") instanceof File ? (watch("iconFile") as File).name : "Saved Asset"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setValue("iconFile", undefined, { shouldDirty: true });
                                    if (iconInputRef.current) iconInputRef.current.value = "";
                                }}
                                className="text-[12px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1"
                            >
                                <FiTrash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                        </div>
                    )}
                    {errors.iconFile && (
                        <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.iconFile.message as string}</p>
                    )}
                </div>

                {/* Cover Image */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
                        Cover Image
                    </label>
                    <div className="relative flex items-center">
                        <input
                            type="file"
                            accept="image/*"
                            ref={imageInputRef}
                            onChange={(e) => setValue("imageFile", e.target.files?.[0] || undefined, { shouldDirty: true })}
                            className="hidden"
                            id="cover-upload-trigger"
                        />
                        <label
                            htmlFor="cover-upload-trigger"
                            className="w-full h-12 px-4 rounded-xl bg-portfolio-bg/70 border border-portfolio-border/80 text-[14px] text-portfolio-text/60 hover:text-portfolio-text flex items-center gap-2.5 cursor-pointer hover:border-portfolio-accent/50 transition-all select-none"
                        >
                            <FiImage className="w-4 h-4 text-portfolio-text/40" />
                            <span>Select showcase mockup...</span>
                        </label>
                    </div>

                    {watch("imageFile") && (
                        <div className="mt-2 flex items-center justify-between p-3 bg-portfolio-bg/30 border border-portfolio-border/60 rounded-xl">
                            <div className="flex items-center gap-3">
                                <img
                                    src={watch("imageFile") instanceof File ? URL.createObjectURL(watch("imageFile") as File) : (watch("imageFile") as string)}
                                    alt="Cover preview"
                                    className="w-16 h-10 object-cover rounded-md border border-portfolio-border/80"
                                />
                                <span className="text-[12px] font-medium text-portfolio-text/70 truncate max-w-30">
                                    {watch("imageFile") instanceof File ? (watch("imageFile") as File).name : "Saved Layout"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setValue("imageFile", undefined, { shouldDirty: true });
                                    if (imageInputRef.current) imageInputRef.current.value = "";
                                }}
                                className="text-[12px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1"
                            >
                                <FiTrash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                        </div>
                    )}
                    {errors.imageFile && (
                        <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.imageFile.message as string}</p>
                    )}
                </div>
            </div>

            {/* Target Source Code and Deploy URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Live URL */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5 flex items-center gap-2">
                        Live Project URL
                        <span className="text-[12px] text-portfolio-muted/80 font-normal italic">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                        <FiLink className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
                        <input
                            {...register("projectUrl")}
                            type="url"
                            className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.projectUrl
                                ? "border-red-500 focus:border-red-500"
                                : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                                }`}
                            placeholder="https://myproject.com"
                        />
                    </div>
                    {errors.projectUrl && (
                        <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.projectUrl.message}</p>
                    )}
                </div>

                {/* GitHub URL */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5 flex items-center gap-2">
                        GitHub Repository URL
                        <span className="text-[12px] text-portfolio-muted/80 font-normal italic">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                        <FiGithub className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
                        <input
                            {...register("githubUrl")}
                            type="url"
                            className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.githubUrl
                                ? "border-red-500 focus:border-red-500"
                                : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                                }`}
                            placeholder="https://github.com/user/repo"
                        />
                    </div>
                    {errors.githubUrl && (
                        <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.githubUrl.message}</p>
                    )}
                </div>
            </div>

            {/* Tech Stack Module */}
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
                    Technologies Used
                </label>
                <div className="flex flex-wrap gap-2.5 p-3 rounded-xl bg-portfolio-bg/70 border border-portfolio-border/80 min-h-13 items-center focus-within:border-portfolio-accent transition-all">
                    {currentTechStack.map((tech, idx) => (
                        <span
                            key={idx}
                            className="flex items-center gap-1.5 bg-portfolio-text text-portfolio-bg text-[12px] font-bold px-3 py-1 rounded-lg select-none"
                        >
                            {tech}
                            <button
                                type="button"
                                onClick={() => removeTechTag(idx)}
                                className="text-portfolio-bg/70 hover:text-portfolio-bg font-extrabold text-[14px]"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <input
                        value={tagInput}
                        onChange={handleInputChange} // ⚡ Calls the mobile virtual keypad intercept function
                        onKeyDown={handleKeyDown}    // ⚡ Cleared of comma logic to prevent process 229 bugs
                        placeholder={currentTechStack.length === 0 ? "Type tech and press Enter or Comma..." : ""}
                        className="flex-1 bg-transparent text-[14px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none min-w-40"
                    />
                </div>
                {errors.techStack && (
                    <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.techStack.message}</p>
                )}
            </div>

            {/* Feature Bullet Multi-Rows Layout */}
            <div className="space-y-4">
                <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5 block">
                    Key Features / Details
                </label>

                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-3">
                            <div className="relative flex-1 flex items-center">
                                <FiCpu className="absolute left-4 w-4 h-4 text-portfolio-text/30" />
                                <input
                                    {...register(`features.${index}.text` as const)}
                                    placeholder="Integrated Stripe webhooks for core transactional system lifecycle events..."
                                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-portfolio-bg/70 border border-portfolio-border/80 text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none focus:border-portfolio-accent focus:bg-portfolio-bg transition-all"
                                />
                            </div>
                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="h-12 px-3 text-red-400 hover:text-red-300 text-[13px] font-bold transition-colors flex items-center gap-1 shrink-0"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Remove</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => append({ text: "" })}
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-portfolio-accent hover:opacity-80 transition-opacity pl-0.5 pt-1 cursor-pointer"
                >
                    <FiPlus className="w-4 h-4" /> Add Feature Bullet
                </button>
                {errors.features && (
                    <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.features.message}</p>
                )}
            </div>

            {/* Form Submission Action Control Row */}
            <div className="flex justify-end pt-5 border-t border-portfolio-border/80">
                <button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className={`flex items-center gap-2 px-4 h-9 rounded-xl text-[12px] font-bold tracking-tight transition-all select-none border ${!isDirty || isSubmitting
                        ? "bg-portfolio-card border-portfolio-border text-portfolio-text/30 cursor-not-allowed opacity-40"
                        : "bg-portfolio-text border-portfolio-text text-portfolio-bg hover:bg-portfolio-text/90 active:scale-[0.98] shadow-[0_4px_24px_var(--color-portfolio-glow)] cursor-pointer"
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 rounded-full border-2 border-portfolio-bg/30 border-t-portfolio-bg animate-spin" />
                            <span>Uploading Media...</span>
                        </>
                    ) : (
                        <>
                            <FiCheckCircle className="w-4.5 h-4.5" />
                            <span>{isExistingProject ? "Update Project" : "Save Project"}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}