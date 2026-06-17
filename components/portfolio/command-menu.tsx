"use client";

import { Command } from "cmdk";
import { useEffect, useState, useRef } from "react";
import { useCommand } from "@/context/command-context";
import { useProgressNavigation } from "./progress-provider";
import {
    FiSearch,
    FiHome,
    FiFolder,
    FiEye,
    FiGithub,
    FiLinkedin
} from "react-icons/fi";

import { FaXTwitter } from "react-icons/fa6";
import BlurImage from "./blur-image";

interface Project {
    title: string;
    slug: string;
    tagline?: string;
    iconUrl?: string;
}

interface CommandMenuProps {
    username: string;
    projects: Project[];
    socials?: string[];
}

export default function CommandMenu({ username, projects = [], socials = [] }: CommandMenuProps) {
    const { navigate } = useProgressNavigation();
    const { isOpen, setIsOpen, toggleCircles } = useCommand();
    const [search, setSearch] = useState("");

    // 💡 Declared ref hook targeted for native input element controls
    const inputRef = useRef<HTMLInputElement>(null);

    // Global Escape Key Binding (Always active in background)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setIsOpen]);

    // 💡 Clear text input and force auto-focus immediately upon menu initialization
    useEffect(() => {
        if (isOpen) {
            setSearch("");

            // Micro-delay ensures the DOM mounting paint loop has settled completely
            const focusTimeout = setTimeout(() => {
                inputRef.current?.focus();
            }, 25);

            return () => clearTimeout(focusTimeout);
        }
    }, [isOpen]);

    // Clean, non-stuttering screen body lock behavior
    useEffect(() => {
        if (!isOpen) return;

        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isOpen]);

    // Global keyboard shortcut listener for fast action triggers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === "h" && document.activeElement?.tagName !== "INPUT") {
                e.preventDefault();
                navigateTo(`/p/${username}`);
            }
            if (e.key === "p" && document.activeElement?.tagName !== "INPUT") {
                e.preventDefault();
                navigateTo(`/p/${username}/projects`);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, username]);

    // Early return moved here so hooks above run correctly
    if (!isOpen) return null;

    const navigateTo = (path: string) => {
        navigate(path);
        setIsOpen(false);
        setSearch("");
    };

    // Clean lookups to find specific platform links from backend array strings
    const githubLink = socials.find(link => link.includes("github.com"));
    const linkedinLink = socials.find(link => link.includes("linkedin.com"));
    const twitterLink = socials.find(link => link?.includes("twitter.com") || link?.includes("x.com"));

    const hasSocials = githubLink || linkedinLink || twitterLink;
    const isSearchingProjects = search.trim().length > 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030303]/75 backdrop-blur-md animate-fade-in"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-137.5 rounded-2xl border border-portfolio-border bg-portfolio-card/95 shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <Command label="Global Control Center">
                    {/* 🔍 Premium Input Core Panel */}
                    <div className="flex items-center gap-3 px-4 border-b border-portfolio-border/40 bg-portfolio-bg/10">
                        <FiSearch className="w-4 h-4 text-portfolio-muted/40 shrink-0" />
                        <Command.Input
                            ref={inputRef}
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Type a command or search..."
                            className="w-full h-15 bg-transparent text-[14.5px] text-portfolio-text placeholder-portfolio-muted/30 outline-none font-sans font-normal"
                        />
                        <kbd className="px-1.5 py-0.5 rounded border border-portfolio-border bg-portfolio-bg text-[9px] font-mono text-portfolio-muted/50 select-none">
                            esc
                        </kbd>
                    </div>

                    <Command.List
                        className="max-h-105 overflow-y-auto p-2.5 space-y-1.5 overscroll-contain select-none scrollbar-none [&::-webkit-scrollbar]:hidden"
                    >
                        <Command.Empty className="py-10 text-center text-[13px] font-mono text-portfolio-muted/40">
                            No results found for "{search}"
                        </Command.Empty>

                        {/* 🛠️ DYNAMIC PROJECTS BLOCK */}
                        {projects.length > 0 && (
                            <Command.Group
                                heading="Projects"
                                className={`text-[11px] font-sans font-semibold tracking-wide text-portfolio-muted/50 px-3 pt-2.5 pb-1 select-none text-transform-none ${isSearchingProjects ? "block" : "hidden"
                                    }`}
                            >
                                {projects.map((proj) => (
                                    <Command.Item
                                        key={proj.slug}
                                        value={`project-${proj.slug}-${proj.title}`}
                                        onSelect={() => navigateTo(`/p/${username}/projects/${proj.slug}`)}
                                        className="flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-[14px] font-medium text-portfolio-text/90 data-[selected=true]:bg-portfolio-bg data-[selected=true]:text-portfolio-accent transition-all duration-100 group"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            {proj.iconUrl ? (
                                                <BlurImage
                                                    src={proj.iconUrl}
                                                    alt=""
                                                    className="w-5 h-5 object-cover shrink-0 rounded-full"
                                                />
                                            ) : (
                                                <FiFolder className="w-4 h-4 text-portfolio-muted/40 group-data-[selected=true]:text-portfolio-accent transition-colors" />
                                            )}

                                            <span className="truncate tracking-tight font-sans">
                                                Projects <span className="text-portfolio-muted/30 font-normal font-mono mx-0.5">→</span> {proj.title}
                                            </span>
                                        </div>
                                        {proj.tagline && (
                                            <span className="text-[11.5px] text-portfolio-muted/40 font-normal hidden sm:block truncate max-w-47.5 font-sans pl-2">
                                                {proj.tagline}
                                            </span>
                                        )}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {/* 📄 STATIC PAGES CATEGORY */}
                        <Command.Group
                            heading="Pages"
                            className="text-[11px] font-sans font-semibold tracking-wide text-portfolio-muted/50 px-3 pt-2.5 pb-1 select-none text-transform-none"
                        >
                            <Command.Item
                                value="Home"
                                onSelect={() => navigateTo(`/p/${username}`)}
                                className="flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-[14px] font-medium text-portfolio-text/90 data-[selected=true]:bg-portfolio-bg data-[selected=true]:text-portfolio-accent transition-all duration-100 group"
                            >
                                <div className="flex items-center gap-3.5">
                                    <FiHome className="w-4 h-4 text-portfolio-muted/40 group-data-[selected=true]:text-portfolio-accent transition-colors" />
                                    <span className="tracking-tight font-sans">Home</span>
                                </div>
                                <kbd className="px-1.5 py-0.5 rounded bg-portfolio-card border border-portfolio-border/40 text-[9px] font-mono text-portfolio-muted/50">h</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Projects"
                                onSelect={() => navigateTo(`/p/${username}/projects`)}
                                className="flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-[14px] font-medium text-portfolio-text/90 data-[selected=true]:bg-portfolio-bg data-[selected=true]:text-portfolio-accent transition-all duration-100 group"
                            >
                                <div className="flex items-center gap-3.5">
                                    <FiFolder className="w-4 h-4 text-portfolio-muted/40 group-data-[selected=true]:text-portfolio-accent transition-colors" />
                                    <span className="tracking-tight font-sans">Projects</span>
                                </div>
                                <kbd className="px-1.5 py-0.5 rounded bg-portfolio-card border border-portfolio-border/40 text-[9px] font-mono text-portfolio-muted/50">p</kbd>
                            </Command.Item>

                            {/* 🕹️ APP UTILITIES BLOCK */}
                            <Command.Item
                                value="Toggle Circles"
                                onSelect={() => {
                                    toggleCircles();
                                    setIsOpen(false);
                                }}
                                className="flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-[14px] font-medium text-portfolio-text/90 data-[selected=true]:bg-portfolio-bg data-[selected=true]:text-portfolio-accent transition-all duration-100 group"
                            >
                                <div className="flex items-center gap-3.5">
                                    <FiEye className="w-4 h-4 text-portfolio-muted/40 group-data-[selected=true]:text-portfolio-accent transition-colors" />
                                    <span className="tracking-tight font-sans">Toggle Circles</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <kbd className="px-1.5 py-0.5 rounded bg-portfolio-card border border-portfolio-border/40 text-[9px] font-mono text-portfolio-muted/50">t</kbd>
                                    <kbd className="px-1.5 py-0.5 rounded bg-portfolio-card border border-portfolio-border/40 text-[9px] font-mono text-portfolio-muted/50">c</kbd>
                                </div>
                            </Command.Item>
                        </Command.Group>

                        {/* 🌐 OUTBOUND ECOSYSTEM LINKS */}
                        {hasSocials && (
                            <Command.Group
                                heading="Socials"
                                className="text-[11px] font-sans font-semibold tracking-wide text-portfolio-muted/50 px-3 pt-2.5 pb-1 select-none text-transform-none"
                            >
                                {twitterLink && (
                                    <Command.Item
                                        value="Twitter"
                                        onSelect={() => window.open(twitterLink, "_blank", "noopener,noreferrer")}
                                        className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer text-[14px] font-medium text-portfolio-text/90 data-[selected=true]:bg-portfolio-bg data-[selected=true]:text-portfolio-accent transition-all duration-100"
                                    >
                                        <FaXTwitter className="w-4 h-4 text-portfolio-muted/40" />
                                        <span className="tracking-tight font-sans">Twitter</span>
                                    </Command.Item>
                                )}

                                {githubLink && (
                                    <Command.Item
                                        value="GitHub"
                                        onSelect={() => window.open(githubLink, "_blank", "noopener,noreferrer")}
                                        className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer text-[14px] font-medium text-portfolio-text/90 data-[selected=true]:bg-portfolio-bg data-[selected=true]:text-portfolio-accent transition-all duration-100"
                                    >
                                        <FiGithub className="w-4 h-4 text-portfolio-muted/40" />
                                        <span className="tracking-tight font-sans">GitHub</span>
                                    </Command.Item>
                                )}

                                {linkedinLink && (
                                    <Command.Item
                                        value="LinkedIn"
                                        onSelect={() => window.open(linkedinLink, "_blank", "noopener,noreferrer")}
                                        className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer text-[14px] font-medium text-portfolio-text/90 data-[selected=true]:bg-portfolio-bg data-[selected=true]:text-portfolio-accent transition-all duration-100"
                                    >
                                        <FiLinkedin className="w-4 h-4 text-portfolio-muted/40" />
                                        <span className="tracking-tight font-sans">LinkedIn</span>
                                    </Command.Item>
                                )}
                            </Command.Group>
                        )}
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}