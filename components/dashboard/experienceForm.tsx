"use client";

import React, { useState, useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienceFormSchema, ExperienceFormValues } from "@/schemas/experienceSchema";

interface ExperienceFormProps {
    initialData?: any; // Hydrated when updating an existing row entry
    onComplete: () => void; // Callback to trigger parent component refreshes or UI state updates
}

export default function ExperienceForm({ initialData, onComplete }: ExperienceFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!initialData?._id;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        clearErrors,
        trigger,
        formState: { errors, isDirty },
        reset,
    } = useForm<ExperienceFormValues>({
        resolver: zodResolver(experienceFormSchema) as Resolver<ExperienceFormValues>,
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: initialData || {
            company: "",
            role: "",
            startDate: "",
            currentJob: false,
            endDate: "",
            description: "",
        },
    });

    // FIX 1: Reactive Hydration Listener - Keeps fields perfectly synchronized when editing entries
    useEffect(() => {
        if (initialData) {
            reset({
                company: initialData.company || "",
                role: initialData.role || "",
                startDate: initialData.startDate || "",
                currentJob: !!initialData.currentJob, // Enforce strict boolean casting
                endDate: initialData.currentJob ? "" : initialData.endDate || "",
                description: initialData.description || "",
            });
        } else {
            reset({
                company: "",
                role: "",
                startDate: "",
                currentJob: false,
                endDate: "",
                description: "",
            });
        }
    }, [initialData, reset]);

    const isCurrentJob = watch("currentJob");

    // Dynamic field layout synchronization side-effect block
    useEffect(() => {
        if (isCurrentJob) {
            setValue("endDate", "", { shouldDirty: true });
            clearErrors("endDate");
        }
    }, [isCurrentJob, setValue, clearErrors]);

    const startDateValue = watch("startDate");
    const endDateValue = watch("endDate");

    // Force cross-field validation check when dates change
    useEffect(() => {
        if (startDateValue && endDateValue && !isCurrentJob) {
            trigger(["startDate", "endDate"]);
        }
    }, [startDateValue, endDateValue, isCurrentJob, trigger]);

    const onSubmit = async (data: ExperienceFormValues) => {
        setIsSubmitting(true);

        // Data Transformation Layer: Set the clean API payload format
        const payload = {
            ...(isEditing && { _id: initialData._id }), // Safely pack structural MongoDB row ID for PUT updates
            company: data.company,
            role: data.role,
            startDate: data.startDate,
            currentJob: data.currentJob,
            // FIX 2: Enforce empty string instead of "Present" string literal to avoid DB date-formatting crashes
            endDate: data.currentJob ? "" : data.endDate,
            description: data.description,
        };

        try {
            const response = await fetch("/api/experience", {
                // FIX 3: Dynamic REST switching method mechanism
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save occupational history node.");

            alert(isEditing ? "Work experience updated successfully!" : "Work experience saved successfully!");

            // FIX 4: Safely call the onComplete prop to update the state manager grid
            onComplete();
        } catch (error) {
            console.error(error);
            alert("Something went wrong while saving milestone.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-sm">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">
                    {isEditing ? "Modify Milestone Details" : "Career History"}
                </h2>
                <p className="text-sm text-gray-500">Add milestones detailing your occupational history and background.</p>
            </div>

            {/* Row 1: Company & Role */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <input
                        {...register("company")}
                        className="p-2 border text-gray-700 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        placeholder="Stripe, Inc."
                    />
                    {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Role / Position Title</label>
                    <input
                        {...register("role")}
                        className="p-2 border text-gray-700 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        placeholder="Senior Frontend Engineer"
                    />
                    {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
                </div>
            </div>

            {/* Row 2: Employment Duration Timeline Controls */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="currentJob"
                        {...register("currentJob")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="currentJob" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                        I currently work in this role
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Start Date</label>
                        <input
                            type="month"
                            {...register("startDate")}
                            className="p-2 border text-gray-700 rounded-md border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        />
                        {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">End Date</label>
                        <input
                            type="month"
                            disabled={isCurrentJob}
                            {...register("endDate")}
                            className={`p-2 border text-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200
                                ${isCurrentJob ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300"}`}
                        />
                        {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
                    </div>
                </div>
            </div>

            {/* Description Area */}
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Role Achievements & Impact</label>
                    <span className="text-[11px] text-gray-400 font-mono">Supports Markdown formatting</span>
                </div>
                <textarea
                    {...register("description")}
                    rows={6}
                    className="p-2 border text-gray-700 rounded-md border-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="- Spearheaded migration to Next.js App Router, boosting performance metric arrays by 40%&#10;- Mentored 4 junior engineering candidates across fullstack operations..."
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Action Footer */}
            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className={`px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-all
                        ${!isDirty || isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm"}`}
                >
                    {isSubmitting ? "Saving record..." : isEditing ? "Save Changes" : "Save Milestone"}
                </button>
            </div>
        </form>
    );
}