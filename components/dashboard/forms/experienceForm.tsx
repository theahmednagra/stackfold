"use client";

import React, { useState, useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienceFormSchema, ExperienceFormValues } from "@/schemas/experience.schema";
import {
    FiBriefcase,
    FiBriefcase as FiAward,
    FiCalendar,
    FiCheckCircle,
    FiAlertCircle
} from "react-icons/fi";
import { useToast } from "@/context/toast-context";

interface ExperienceFormProps {
    initialData?: any; // Hydrated when updating an existing row entry
    onComplete: () => void; // Callback to trigger parent component refreshes or UI state updates
}

export default function ExperienceForm({ initialData, onComplete }: ExperienceFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!initialData?._id;

    const { showToast } = useToast();

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

    // Reactive Hydration Listener - Keeps fields perfectly synchronized when editing entries
    useEffect(() => {
        if (initialData) {
            reset({
                company: initialData.company || "",
                role: initialData.role || "",
                startDate: initialData.startDate || "",
                currentJob: !!initialData.currentJob,
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

        const payload = {
            ...(isEditing && { _id: initialData._id }),
            company: data.company,
            role: data.role,
            startDate: data.startDate,
            currentJob: data.currentJob,
            endDate: data.currentJob ? "" : data.endDate,
            description: data.description,
        };

        try {
            const response = await fetch("/api/experience", {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save occupational history node.");

            showToast("success", isEditing ? "Work experience updated successfully!" : "Work experience saved successfully!");
            onComplete();
        } catch (error) {
            console.error(error);
            showToast("error", "Something went wrong while saving milestone.");
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
                    {isEditing ? "Modify Milestone Details" : "Career History"}
                </h2>
                <p className="text-[14px] text-portfolio-muted font-normal mt-1.5 leading-relaxed">
                    Add milestones detailing your occupational history and background.
                </p>
            </div>

            {/* Row 1: Company & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
                        Company Name
                    </label>
                    <div className="relative flex items-center">
                        <FiBriefcase className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
                        <input
                            {...register("company")}
                            className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.company
                                ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
                                : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                                }`}
                            placeholder="Stripe, Inc."
                        />
                    </div>
                    {errors.company && (
                        <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
                            <FiAlertCircle className="w-3.5 h-3.5" /> {errors.company.message}
                        </p>
                    )}
                </div>

                {/* Role Title */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
                        Role / Position Title
                    </label>
                    <div className="relative flex items-center">
                        <FiAward className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40" />
                        <input
                            {...register("role")}
                            className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all ${errors.role
                                ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
                                : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                                }`}
                            placeholder="Senior Frontend Engineer"
                        />
                    </div>
                    {errors.role && (
                        <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
                            <FiAlertCircle className="w-3.5 h-3.5" /> {errors.role.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Row 2: Employment Duration Timeline Controls */}
            <div className="bg-portfolio-bg/40 p-6 rounded-xl border border-portfolio-border/60 space-y-6">
                {/* Checkbox Trigger Toggle */}
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            id="currentJob"
                            {...register("currentJob")}
                            className="peer w-4.5 h-4.5 appearance-none rounded border border-portfolio-border/80 bg-portfolio-bg checked:bg-portfolio-text checked:border-portfolio-text transition-all cursor-pointer outline-none focus:ring-0"
                        />
                        <div className="absolute inset-0 pointer-events-none hidden peer-checked:flex items-center justify-center text-portfolio-bg font-extrabold text-[11px]">
                            ✓
                        </div>
                    </div>
                    <label
                        htmlFor="currentJob"
                        className="text-[14px] font-semibold text-portfolio-text/90 select-none cursor-pointer"
                    >
                        I currently work in this role
                    </label>
                </div>

                {/* Start & End Dates Pickers Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Start Date */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold tracking-wider text-portfolio-text/70 pl-0.5 uppercase">
                            Start Date
                        </label>
                        <div className="relative flex items-center">
                            <FiCalendar className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40 pointer-events-none z-10" />
                            <input
                                type="month"
                                {...register("startDate")}
                                className={`w-full h-12 pl-12 pr-4 rounded-xl bg-portfolio-bg border text-[15px] font-normal text-portfolio-text outline-none transition-all scheme-dark ${errors.startDate
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-portfolio-border/60 focus:border-portfolio-accent"
                                    }`}
                            />
                        </div>
                        {errors.startDate && (
                            <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.startDate.message}</p>
                        )}
                    </div>

                    {/* End Date */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold tracking-wider text-portfolio-text/70 pl-0.5 uppercase">
                            End Date
                        </label>
                        <div className="relative flex items-center">
                            <FiCalendar className="absolute left-4 w-4.5 h-4.5 text-portfolio-text/40 pointer-events-none z-10 opacity-40 peer-disabled:opacity-10" />
                            <input
                                type="month"
                                disabled={isCurrentJob}
                                {...register("endDate")}
                                className={`w-full h-12 pl-12 pr-4 rounded-xl border text-[15px] font-normal outline-none transition-all scheme-dark peer ${isCurrentJob
                                    ? "bg-portfolio-card/40 border-portfolio-border/30 text-portfolio-text/20 cursor-not-allowed"
                                    : errors.endDate
                                        ? "bg-portfolio-bg border-red-500 focus:border-red-500 text-portfolio-text"
                                        : "bg-portfolio-bg border-portfolio-border/60 focus:border-portfolio-accent text-portfolio-text"
                                    }`}
                            />
                        </div>
                        {errors.endDate && (
                            <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5">{errors.endDate.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Description Area */}
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold tracking-wide text-portfolio-text/90 pl-0.5">
                    Role Achievements & Impact
                </label>
                <textarea
                    {...register("description")}
                    rows={6}
                    className={`w-full p-4 rounded-xl bg-portfolio-bg/70 border text-[15px] font-normal text-portfolio-text placeholder-portfolio-text/20 outline-none transition-all resize-none leading-relaxed custom-scrollbar ${errors.description
                        ? "border-red-500 focus:border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.1)]"
                        : "border-portfolio-border/80 focus:border-portfolio-accent focus:bg-portfolio-bg"
                        }`}
                    placeholder="Spearheaded migration to Next.js App Router, boosting performance metric arrays by 40%&#10;- Mentored 4 junior engineering candidates across fullstack operations..."
                />
                {errors.description && (
                    <p className="text-[13px] font-medium text-red-400 pl-0.5 mt-0.5 flex items-center gap-1.5">
                        <FiAlertCircle className="w-3.5 h-3.5" /> {errors.description.message}
                    </p>
                )}
            </div>

            {/* Action Footer Button Row */}
            <div className="flex justify-end pt-5 border-t border-portfolio-border/80">
                <button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className={`flex items-center gap-2 px-4 h-9 rounded-xl text-[12px] font-bold tracking-tight transition-all select-none border ${!isDirty || isSubmitting
                            ? "bg-portfolio-text/5 border-portfolio-border/40 text-portfolio-text/25 cursor-not-allowed"
                            : "bg-portfolio-text border-portfolio-text text-portfolio-bg hover:bg-portfolio-text/90 active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer"
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 rounded-full border-2 border-portfolio-bg/30 border-t-portfolio-bg animate-spin" />
                            <span>Saving Record...</span>
                        </>
                    ) : (
                        <>
                            <FiCheckCircle className="w-4.5 h-4.5" />
                            <span>{isEditing ? "Save Changes" : "Save Milestone"}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}