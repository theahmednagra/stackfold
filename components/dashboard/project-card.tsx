"use client";

import React, { useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
    FiGithub,
    FiExternalLink,
    FiMoreVertical,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiChevronDown,
    FiChevronUp
} from "react-icons/fi";

interface FeatureNode {
    text: string;
}

interface ProjectNode {
    _id: string;
    title: string;
    tagline?: string;
    description: string;
    features?: FeatureNode[];
    techStack: string[];
    projectUrl?: string;
    githubUrl?: string;
    imageFile?: string;
    iconFile?: string;
    slug?: string;
}

interface ProjectCardProps {
    project: ProjectNode;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [featuresExpanded, setFeaturesExpanded] = useState(false);

    const dropdownRef = useClickOutside<HTMLDivElement>(() => setDropdownOpen(false));

    return (
        <div className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl overflow-hidden shadow-lg hover:border-portfolio-accent/40 transition-all flex flex-col justify-between relative mb-6 break-inside-avoid">

            <div>
                {/* Cover Image Header Layer (Hover Effect Completely Removed) */}
                {project.imageFile && (
                    <div className="w-full aspect-video overflow-hidden relative border-b border-portfolio-border/40 bg-portfolio-bg">
                        <img
                            src={project.imageFile}
                            alt={`${project.title} Banner`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-portfolio-card via-transparent to-transparent opacity-90" />
                    </div>
                )}

                <div className="p-5 sm:p-6 space-y-4">

                    {/* Main Context Info Line */}
                    <div className="flex items-start justify-between gap-4 relative">
                        <div className="flex items-center gap-3">
                            {project.iconFile && (
                                <img
                                    src={project.iconFile}
                                    alt={project.title}
                                    className="w-10 h-10 rounded-xl object-contain bg-portfolio-bg border border-portfolio-border/60 p-1 shrink-0"
                                />
                            )}
                            <div>
                                <h3 className="text-[18px] font-bold text-portfolio-text tracking-tight line-clamp-1">
                                    {project.title}
                                </h3>
                                {project.tagline && (
                                    <p className="text-[12px] text-portfolio-accent font-medium tracking-wide line-clamp-1">
                                        {project.tagline}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        <div ref={dropdownRef} className="relative shrink-0">
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
                                        <span>Edit Details</span>
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

                    {/* Project Narrative */}
                    <p className="text-[13.5px] text-portfolio-muted font-normal leading-relaxed line-clamp-4 whitespace-pre-line">
                        {project.description}
                    </p>

                    {/* Accordion Feature Matrix List */}
                    {project.features && project.features.length > 0 && (
                        <div className="border-t border-portfolio-border/40 pt-3">
                            <button
                                onClick={() => setFeaturesExpanded(!featuresExpanded)}
                                className="w-full flex items-center justify-between text-[12px] font-bold tracking-wider text-portfolio-text/40 uppercase cursor-pointer hover:text-portfolio-text/60 transition-colors"
                            >
                                <span>Core Capabilities ({project.features.length})</span>
                                {featuresExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                            </button>

                            {featuresExpanded && (
                                <div className="mt-2.5 space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1 animate-fadeIn">
                                    {project.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-[13px] text-portfolio-text/85 leading-relaxed bg-portfolio-bg/40 p-2 rounded-lg border border-portfolio-border/20">
                                            <FiCheckCircle className="w-3.5 h-3.5 text-portfolio-accent shrink-0 mt-0.5" />
                                            <span>{feature.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Footer Meta Row tags */}
            <div className="p-5 sm:p-6 pt-0 space-y-4">
                {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {project.techStack.map((tech, index) => (
                            <span key={index} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-portfolio-bg border border-portfolio-border/40 text-portfolio-text/70">
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                <div className="border-t border-portfolio-border/40 pt-3.5 flex items-center gap-4 text-portfolio-text/40">
                    {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-portfolio-text transition-colors flex items-center gap-1.5 text-[12px] font-medium">
                            <FiGithub className="w-4 h-4" /> Codebase
                        </a>
                    )}
                    {project.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="hover:text-portfolio-text transition-colors flex items-center gap-1.5 text-[12px] font-medium">
                            <FiExternalLink className="w-4 h-4" /> Deployment
                        </a>
                    )}
                </div>
            </div>

        </div>
    );
}