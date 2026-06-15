"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienceFormSchema, ExperienceFormValues } from "@/schemas/experienceSchema";

interface ExperienceFormProps {
    initialData?: any; // Hydrated when updating an existing row entry
}

export default function ExperienceForm({ initialData }: ExperienceFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        clearErrors,
        trigger, // Add trigger here to manually kick off validation loops
        formState: { errors, isDirty },
        reset,
    } = useForm<ExperienceFormValues>({
        resolver: zodResolver(experienceFormSchema),
        mode: "onChange",        // FIX: Triggers validation the moment they click a date
        reValidateMode: "onChange", // FIX: Continuously monitors fixing/breaking fields
        defaultValues: initialData || {
            company: "",
            role: "",
            startDate: "",
            currentJob: false,
            endDate: "",
            description: "",
        },
    });

    const isCurrentJob = watch("currentJob");

    // 2. Update the layout synchronization effect block to this:
    useEffect(() => {
        if (isCurrentJob) {
            // Force field state down to an empty string safely
            setValue("endDate", "", { shouldDirty: true });
            // Wipes out any residual chronological errors immediately
            clearErrors("endDate");
        }
    }, [isCurrentJob, setValue, clearErrors]);

    const startDateValue = watch("startDate");
    const endDateValue = watch("endDate");

    // Force cross-field validation check when dates change
    useEffect(() => {
        if (startDateValue || endDateValue) {
            trigger(["startDate", "endDate"]);
        }
    }, [startDateValue, endDateValue, trigger]);

    const onSubmit = async (data: ExperienceFormValues) => {
        setIsSubmitting(true);

        // Data Transformation Layer: Set the strict API payload format
        const payload = {
            company: data.company,
            role: data.role,
            startDate: data.startDate,
            endDate: data.currentJob ? "Present" : data.endDate, // Maps to your Mongoose schema expectations
            description: data.description,
        };

        try {
            const response = await fetch("/api/experience", {
                method: "POST", // or PUT depending on implementation pattern
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save occupational history node.");

            alert("Work experience saved successfully!");
            reset(data); // Re-baseline form parameters
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-sm">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Career History</h2>
                <p className="text-sm text-gray-500">Add milestones detailing your occupational history and background.</p>
            </div>

            {/* Row 1: Company & Role */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <input
                        {...register("company")}
                        className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        placeholder="Stripe, Inc."
                    />
                    {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Role / Position Title</label>
                    <input
                        {...register("role")}
                        className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
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
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="currentJob" className="text-sm font-medium text-gray-700 select-none">
                        I currently work in this role
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Start Date</label>
                        <input
                            type="month" // Browser native calendar month-picker view (YYYY-MM format strings)
                            {...register("startDate")}
                            className="p-2 border rounded-md border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        />
                        {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">End Date</label>
                        <input
                            type="month"
                            disabled={isCurrentJob}
                            {...register("endDate")}
                            className={`p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200
                ${isCurrentJob ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300"}`}
                        />
                        {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
                    </div>
                </div>
            </div>

            {/* Description Rich Textarea */}
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Role Achievements & Impact</label>
                    <span className="text-[11px] text-gray-400 font-mono">Supports Markdown formatting</span>
                </div>
                <textarea
                    {...register("description")}
                    rows={6}
                    className="p-2 border rounded-md border-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                    {isSubmitting ? "Saving record..." : "Save Milestone"}
                </button>
            </div>
        </form>
    );
}