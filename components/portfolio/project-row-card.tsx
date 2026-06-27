"use client";

import { useProgressNavigation } from "./progress-provider";
import LazyImage from "./lazy-image";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

interface ProjectItem {
    _id: string | object;
    slug: string;
    title: string;
    tagline?: string;
    description: string;
    iconUrl?: string;
    imageUrl?: string;
    projectUrl?: string;
    githubUrl?: string;
}

interface ProjectRowCardProps {
    project: ProjectItem;
    username: string;
}

export default function ProjectRowCard({ project, username }: ProjectRowCardProps) {
    const { navigate } = useProgressNavigation();
    const projectRoute = `/p/${username}/projects/${project.slug}`;

    return (
        <div className="w-full p-4 sm:p-6 rounded-2xl border border-portfolio-border bg-portfolio-card flex flex-col md:flex-row items-stretch gap-5 md:gap-6 transition-all duration-300 hover:border-portfolio-accent/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">

            {/* 🖼️ LEFT ELEMENT COLUMN: High-Fidelity Mockup Container */}
            <div
                onClick={() => navigate(projectRoute)}
                className="w-full md:w-75 aspect-video md:h-auto rounded-xl overflow-hidden shrink-0 cursor-pointer relative bg-portfolio-bg border border-portfolio-border/40 transition-all duration-500 group-hover:border-portfolio-accent/10"
            >
                {project.imageUrl ? (
                    <LazyImage
                        src={project.imageUrl}
                        alt={`${project.title} mockup`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-portfolio-muted/20 text-2xl font-mono select-none">
                        ✦
                    </div>
                )}
            </div>

            {/* 📝 RIGHT ELEMENT COLUMN: Premium Structured Context Canvas */}
            <div className="flex flex-col justify-between items-start flex-1 min-w-0 pt-0.5">

                {/* Header Core & Tagline Stack */}
                <div className="w-full">

                    {/* Responsive Title + Icon Block Grid */}
                    <div
                        onClick={() => navigate(projectRoute)}
                        className="flex items-start gap-2.5 cursor-pointer max-w-full group/title mb-3"
                    >
                        {project.iconUrl && (
                            /* Premium Scaled Icon Container */
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-portfolio-border/60 bg-portfolio-bg/40 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                                <LazyImage
                                    src={project.iconUrl}
                                    alt={`${project.title} logo`}
                                    className="w-full h-full object-contain rounded-md"
                                />
                            </div>
                        )}

                        <div className="space-y-0.5 min-w-0 flex-1 self-center">
                            <h3 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-portfolio-text transition-colors duration-200 group-hover/title:text-portfolio-accent wrap-break-word leading-snug">
                                {project.title}
                            </h3>
                        </div>
                    </div>

                    {/* Tagline / Core Canvas Block */}
                    <p className="text-[14.5px] sm:text-[15.5px] text-portfolio-muted leading-relaxed font-normal tracking-wide line-clamp-none sm:line-clamp-2 md:line-clamp-3 wrap-break-word whitespace-normal mb-5">
                        {project.tagline || project.description}
                    </p>
                </div>

                {/* 🔗 Dynamic Interactive Action Link Anchors & Learn More Gateway */}
                <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-1">

                    {/* External Deployments & Source Repository Links Row */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        {project.projectUrl && (
                            <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-portfolio-border bg-portfolio-bg/50 text-[12.5px] font-medium text-portfolio-muted hover:text-portfolio-text hover:border-portfolio-accent/30 hover:bg-portfolio-bg transition-all"
                            >
                                <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-80" />
                                <span className="truncate max-w-45">
                                    {project.projectUrl.replace(/^https?:\/\/(www\.)?/, "")}
                                </span>
                            </a>
                        )}

                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-portfolio-border bg-portfolio-bg/50 text-[12.5px] font-medium text-portfolio-muted hover:text-portfolio-text hover:border-portfolio-accent/30 hover:bg-portfolio-bg transition-all"
                            >
                                <FaGithub className="w-3.5 h-3.5 opacity-80" />
                                <span className="truncate max-w-45">
                                    {project.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                                </span>
                            </a>
                        )}
                    </div>

                    {/* Core Route Action Trigger */}
                    <button
                        onClick={() => navigate(projectRoute)}
                        className="text-[14px] font-bold text-portfolio-muted/90 hover:text-portfolio-text transition-colors cursor-pointer self-start sm:self-auto group/btn whitespace-nowrap"
                    >
                        Learn More{" "}
                        <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-0.5">
                            →
                        </span>
                    </button>

                </div>

            </div>

        </div>
    );
}