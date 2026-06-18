"use client";

import React, { useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { FiMoreVertical, FiEdit2, FiTrash2, FiCalendar, FiBriefcase } from "react-icons/fi";

interface ExperienceNode {
    _id: string;
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    currentJob: boolean;
    description: string;
}

interface ExperienceCardProps {
    item: ExperienceNode;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ExperienceCard({ item, onEdit, onDelete }: ExperienceCardProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useClickOutside<HTMLDivElement>(() => setDropdownOpen(false));

    const formatTimelineDate = (dateStr: string) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        const dateObj = new Date(Number(year), Number(month) - 1);
        return dateObj.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    // Split the description string into individual lines for real-time parsing
    const descriptionLines = item.description ? item.description.split("\n") : [];

    return (
        <div className="group bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-5 sm:p-6 shadow-md hover:border-portfolio-accent/40 transition-all flex flex-col sm:flex-row justify-between gap-4 relative overflow-hidden">

            <div className="flex items-start gap-4 max-w-3xl w-full">
                {/* Visual Structural Node Indicator Badge */}
                <div className="w-10 h-10 rounded-xl bg-portfolio-bg border border-portfolio-border/60 flex items-center justify-center text-portfolio-accent shrink-0 mt-0.5">
                    <FiBriefcase className="w-4 h-4" />
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                    <div>
                        <h3 className="text-[17px] font-bold text-portfolio-text tracking-tight leading-snug wrap-break-word">
                            {item.role}
                        </h3>
                        <p className="text-[14px] text-portfolio-accent font-semibold wrap-break-word">
                            {item.company}
                        </p>
                    </div>

                    {/* Styled Dynamic Timeline Label Badge */}
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-portfolio-bg border border-portfolio-border/40 text-portfolio-muted">
                        <FiCalendar className="w-3.5 h-3.5 opacity-60" />
                        <span>
                            {formatTimelineDate(item.startDate)} — {item.currentJob ? "Present" : formatTimelineDate(item.endDate)}
                        </span>
                    </div>

                    {/* Job Description Canvas - Processing each line separately */}
                    <div className="space-y-2 pt-1 max-w-full">
                        {descriptionLines.length === 0 ? (
                            <p className="text-[14px] text-portfolio-muted/50 italic font-normal">No description provided.</p>
                        ) : (
                            descriptionLines.map((line, index) => {
                                const trimmedLine = line.trim();
                                if (!trimmedLine) return null;

                                // Identical regex engine matcher to extract 1-4 word colon prefixes
                                const match = trimmedLine.match(/^([^\s:][^:]*?(?:\s+[^\s:][^:]*?){0,3}):(.*)$/);
                                const titlePart = match ? match[1].trim() : null;
                                const bodyPart = match ? match[2] : trimmedLine;

                                return (
                                    <p key={index} className="text-[14px] text-portfolio-muted font-normal leading-relaxed wrap-break-word">
                                        {titlePart ? (
                                            <>
                                                <strong className="text-portfolio-text font-semibold mr-1">
                                                    {titlePart}:
                                                </strong>
                                                {bodyPart}
                                            </>
                                        ) : (
                                            trimmedLine
                                        )}
                                    </p>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Dropdown Menu System */}
            <div ref={dropdownRef} className="absolute top-5 right-5 sm:relative sm:top-0 sm:right-0 shrink-0">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-portfolio-bg/80 border border-portfolio-border/60 text-portfolio-text/60 hover:text-portfolio-text transition-all cursor-pointer"
                >
                    <FiMoreVertical className="w-4 h-4" />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-36 bg-portfolio-card/99 border border-portfolio-border rounded-xl shadow-2xl py-1 z-30 animate-fadeIn">
                        <button
                            onClick={() => { setDropdownOpen(false); onEdit(); }}
                            className="w-full px-3.5 h-9 text-left text-[13px] text-portfolio-text/80 hover:text-portfolio-text hover:bg-portfolio-border/30 flex items-center gap-2 cursor-pointer"
                        >
                            <FiEdit2 className="w-3.5 h-3.5 text-portfolio-accent" />
                            <span>Edit Milestone</span>
                        </button>
                        <hr className="border-portfolio-border/40 my-1" />
                        <button
                            onClick={() => { setDropdownOpen(false); onDelete(); }}
                            className="w-full px-3.5 h-9 text-left text-[13px] text-red-400 hover:text-red-300 hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                        >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span>Delete Node</span>
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}