"use client";

import ExperienceForm from "@/components/dashboard/experienceForm";
import React, { useEffect, useState } from "react";

export default function ExperienceDashboardPage() {
    const [experiences, setExperiences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editingExperience, setEditingExperience] = useState<any | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const loadOccupationalHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/experience");
            if (!res.ok) throw new Error("Failed to load timeline records.");
            const data = await res.json();
            setExperiences(data.experiences || []);
        } catch (err: any) {
            setError(err.message || "An exception error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOccupationalHistory();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this experience node?")) return;

        try {
            const response = await fetch(`/api/experience?id=${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Could not drop data record parameters.");

            setExperiences((prev) => prev.filter((item) => item._id !== id));
            if (editingExperience?._id === id) {
                handleCloseForm();
            }
        } catch (err: any) {
            alert(err.message || "Wipe actions exception dropped.");
        }
    };

    const handleEditClick = (item: any) => {
        setEditingExperience(item);
        setIsFormOpen(true);
    };

    const handleCreateClick = () => {
        setEditingExperience(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingExperience(null);
        loadOccupationalHistory();
    };

    // Humanize string inputs dynamically for timeline displays
    const formatTimelineDate = (dateStr: string) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        const dateObj = new Date(Number(year), Number(month) - 1);
        return dateObj.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    if (loading) {
        return <div className="p-6 max-w-4xl mx-auto text-zinc-400">Loading timeline metrics...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Experience & Timeline</h1>
                    <p className="text-sm text-gray-500">Document history, internships, and freelance milestones sequentially.</p>
                </div>
                {!isFormOpen && (
                    <button
                        onClick={handleCreateClick}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-all shadow-sm"
                    >
                        + Add Milestone
                    </button>
                )}
            </div>

            {error && <div className="p-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md">{error}</div>}

            {isFormOpen ? (
                <div className="space-y-4">
                    <button onClick={handleCloseForm} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 transition-all">
                        ← Cancel and Return
                    </button>
                    <ExperienceForm initialData={editingExperience} onComplete={handleCloseForm} />
                </div>
            ) : experiences.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-lg bg-gray-50">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Timeline grid empty</h3>
                    <p className="mt-1 text-sm text-gray-500">No career history or background metrics tracked yet.</p>
                    <button onClick={handleCreateClick} className="mt-6 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">
                        Add First Node
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {experiences.map((item) => (
                        <div key={item._id} className="p-5 border border-zinc-200 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row justify-between gap-4 hover:border-zinc-300 transition-all">
                            <div className="space-y-2 max-w-2xl">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-base">{item.role}</h3>
                                    <p className="text-sm font-medium text-blue-600">{item.company}</p>
                                </div>

                                <p className="text-xs font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded inline-block">
                                    {formatTimelineDate(item.startDate)} - {item.currentJob ? "Present" : formatTimelineDate(item.endDate)}
                                </p>

                                <p className="text-sm text-gray-600 whitespace-pre-wrap pt-1 font-sans leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            <div className="flex sm:flex-col justify-end items-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 text-sm font-medium shrink-0">
                                <button onClick={() => handleEditClick(item)} className="text-zinc-600 hover:text-blue-600 transition-colors">
                                    Edit Node
                                </button>
                                <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 transition-colors">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}