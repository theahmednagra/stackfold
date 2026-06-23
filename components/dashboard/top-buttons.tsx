"use client";

import React, { useState } from "react";
import { FiCopy, FiCheck, FiExternalLink } from "react-icons/fi";
import ThemeToggle from "../global/theme-toggle";
import Tooltip from "../global/tooltip";
import { useAuth } from "@/context/auth-context";

const TopButtons = () => {
    const { user } = useAuth();
    const username = user?.username;
    const [copied, setCopied] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const portfolioUrl = `${baseUrl}/p/${username || ""}`;

    const onCopy = async () => {
        if (!username) return;
        try {
            await navigator.clipboard.writeText(portfolioUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy URL: ", error);
        }
    };

    return (
        <div className="flex w-min items-center gap-2 bg-portfolio-card/30 p-1.5 rounded-xl border border-portfolio-border/40 backdrop-blur-xs">

            {/* Copy Link Control */}
            <Tooltip content={copied ? "Link Copied!" : "Copy Live Portfolio URL"}>
                <button
                    onClick={onCopy}
                    disabled={copied}
                    aria-label={copied ? "Copied portfolio link" : "Copy portfolio link URL to clipboard"}
                    className={`w-8.5 h-8.5 rounded-lg border flex items-center justify-center transition-all duration-300 bg-portfolio-card cursor-pointer text-[14px] ${copied
                        ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/5"
                        : "text-portfolio-muted border-portfolio-border/60 hover:text-portfolio-text hover:border-portfolio-border"
                        }`}
                >
                    {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                </button>
            </Tooltip>

            {/* Visit External Target Pipeline */}
            <Tooltip content="Open Live Portfolio">
                <a
                    href={username ? portfolioUrl : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open live portfolio page in a new window"
                    className={`w-8.5 h-8.5 rounded-lg border bg-portfolio-card border-portfolio-border/60 text-portfolio-muted hover:text-portfolio-text hover:border-portfolio-border flex items-center justify-center transition-all duration-300 text-[14px] ${!username ? "pointer-events-none opacity-40" : ""
                        }`}
                >
                    <FiExternalLink className="w-3.5 h-3.5" />
                </a>
            </Tooltip>

            <div className="w-px h-4 bg-portfolio-border/60 mx-0.5" />

            {/* Interface Theme Toggle Selector Switch */}
            <ThemeToggle />

        </div>
    );
};

export default TopButtons;