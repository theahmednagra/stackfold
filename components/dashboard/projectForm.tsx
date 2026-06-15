"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectFormSchema, ProjectFormValues } from "@/schemas/projectSchema";

interface ProjectFormProps {
    initialData?: any; // Populated if editing an existing project
}

export default function ProjectForm({ initialData }: ProjectFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState("");

    const iconInputRef = React.useRef<HTMLInputElement | null>(null);
    const imageInputRef = React.useRef<HTMLInputElement | null>(null);

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
            features: [{ text: "" }], // Starts with one empty row ready
        },
    });

    // react-hook-form hook specifically designed to track array items safely
    const { fields, append, remove } = useFieldArray({
        control,
        name: "features",
    });

    const currentTechStack = watch("techStack") || [];

    // Handles adding tags when user hits Enter or Comma
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const trimmed = tagInput.trim().replace(/,$/, "");
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

        // Create a multi-part form data instance to ship binary files + fields
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("tagline", data.tagline);
        formData.append("description", data.description);
        formData.append("projectUrl", data.projectUrl || "");
        formData.append("githubUrl", data.githubUrl || "");

        // 1. Tech Stack Transformation (Sent as stringified array)
        formData.append("techStack", JSON.stringify(data.techStack));

        // 2. Features Transformation: Map array of objects to clean array of strings
        const flattenedFeatures = data.features.map((f) => f.text);
        formData.append("features", JSON.stringify(flattenedFeatures));

        // 3. File attachments passed directly to backend file upload system
        if (data.imageFile instanceof File) formData.append("imageFile", data.imageFile);
        if (data.iconFile instanceof File) formData.append("iconFile", data.iconFile);

        try {
            const response = await fetch("/api/projects", {
                method: "POST", // or PUT if initialData exists
                body: formData, // Do not set content-type header, browser sets multi-part automatically
            });

            if (!response.ok) throw new Error("Failed to save project.");

            alert("Project saved successfully!");
            reset(data);

            if (iconInputRef.current) iconInputRef.current.value = "";
            if (imageInputRef.current) imageInputRef.current.value = "";
            
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-sm">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Project Specifics</h2>
                <p className="text-sm text-gray-500">Showcase your applications, components, or open-source packages.</p>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Project Title</label>
                <input
                    {...register("title")}
                    className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="E-Commerce API Dashboard"
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Tagline */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Tagline</label>
                <input
                    {...register("tagline")}
                    className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="A minimal, lightning-fast dashboard built for developers."
                />
                {errors.tagline && <p className="text-xs text-red-500">{errors.tagline.message}</p>}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Detailed Description</label>
                <textarea
                    {...register("description")}
                    rows={5}
                    className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Provide a comprehensive breakdown of the project architecture, features, and target audience..."
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Icon & Cover Image Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Project Icon Selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Project Icon</label>
                    <input
                        type="file"
                        accept="image/*"
                        ref={iconInputRef} // Attach the DOM reference here
                        onChange={(e) => setValue("iconFile", e.target.files?.[0] || undefined, { shouldDirty: true })}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {watch("iconFile") && (
                        <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 border rounded-md">
                            <img
                                src={watch("iconFile") instanceof File ? URL.createObjectURL(watch("iconFile") as File) : (watch("iconFile") as string)}
                                alt="Icon preview"
                                className="w-10 h-10 object-cover rounded border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setValue("iconFile", undefined, { shouldDirty: true });
                                    if (iconInputRef.current) iconInputRef.current.value = ""; // Clear browser "No file chosen" state
                                }}
                                className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                    {errors.iconFile && <p className="text-xs text-red-500">{errors.iconFile.message as string}</p>}
                </div>

                {/* Cover Image Selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Cover Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef} // Attach the DOM reference here
                        onChange={(e) => setValue("imageFile", e.target.files?.[0] || undefined, { shouldDirty: true })}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {watch("imageFile") && (
                        <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 border rounded-md">
                            <img
                                src={watch("imageFile") instanceof File ? URL.createObjectURL(watch("imageFile") as File) : (watch("imageFile") as string)}
                                alt="Cover preview"
                                className="w-16 h-10 object-cover rounded border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setValue("imageFile", undefined, { shouldDirty: true });
                                    if (imageInputRef.current) imageInputRef.current.value = ""; // Clear browser "No file chosen" state
                                }}
                                className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                    {errors.imageFile && <p className="text-xs text-red-500">{errors.imageFile.message as string}</p>}
                </div>
            </div>

            {/* Project Links */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Live Project URL <span className="text-xs text-gray-400">(Optional)</span></label>
                    <input
                        {...register("projectUrl")}
                        type="url"
                        className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        placeholder="https://myproject.com"
                    />
                    {errors.projectUrl && <p className="text-xs text-red-500">{errors.projectUrl.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">GitHub Repository URL <span className="text-xs text-gray-400">(Optional)</span></label>
                    <input
                        {...register("githubUrl")}
                        type="url"
                        className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        placeholder="https://github.com/user/repo"
                    />
                    {errors.githubUrl && <p className="text-xs text-red-500">{errors.githubUrl.message}</p>}
                </div>
            </div>

            {/* Tech Stack Tags Module */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Technologies Used</label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md border-gray-300 bg-gray-50 min-h-10.5">
                    {currentTechStack.map((tech, idx) => (
                        <span key={idx} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                            {tech}
                            <button type="button" onClick={() => removeTechTag(idx)} className="text-blue-500 hover:text-blue-900 font-bold">×</button>
                        </span>
                    ))}
                    <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={currentTechStack.length === 0 ? "Type tech and hit Enter..." : ""}
                        className="flex-1 bg-transparent text-sm focus:outline-none min-w-30"
                    />
                </div>
                {errors.techStack && <p className="text-xs text-red-500">{errors.techStack.message}</p>}
            </div>

            {/* Dynamic Features Rows Layout */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 block">Key Features / Details</label>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <input
                            {...register(`features.${index}.text` as const)}
                            placeholder="Integrated stripe webhooks for transactional events..."
                            className="flex-1 p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        />
                        {fields.length > 1 && (
                            <button type="button" onClick={() => remove(index)} className="text-red-500 text-sm font-medium hover:underline px-1">
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => append({ text: "" })}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                    + Add Feature Bullet
                </button>
                {errors.features && <p className="text-xs text-red-500">{errors.features.message}</p>}
            </div>

            {/* Action Controller */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className={`px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-all
            ${!isDirty || isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    {isSubmitting ? "Uploading media..." : "Save Project"}
                </button>
            </div>
        </form>
    );
}