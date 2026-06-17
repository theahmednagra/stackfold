"use client";

import { useCommand } from "@/context/command-context";

export default function AmbientGlow() {
    const { showCircles } = useCommand();
    if (!showCircles) return null;

    return (
        <div
            className="fixed top-0 right-0 w-220 h-220 pointer-events-none rounded-full blur-[140px] opacity-100 mix-blend-multiply dark:mix-blend-screen z-0 select-none transform-gpu animate-fade-in"
            style={{ backgroundImage: `radial-gradient(circle at top right, var(--glow), transparent 90%)` }}
        />
    );
}