"use client";

import React from "react";

interface TooltipProps {
    children: React.ReactNode;
    content: string;
}

export default function Tooltip({ children, content }: TooltipProps) {
    return (
        <div className="relative group/tooltip">
            {/* Target Element Hook */}
            {children}

            {/* Reusable Tooltip Overlay */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 scale-0 group-hover/tooltip:scale-100 min-w-max rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-150 origin-bottom shadow-md z-50
                bg-zinc-900 text-zinc-100 border border-zinc-800
                dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800/60"
            >
                {content}
            </span>
        </div>
    );
}
