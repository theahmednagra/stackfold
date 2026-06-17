"use client";

import React, { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const ProgressContext = createContext<{
    isPending: boolean;
    navigate: (href: string) => void;
}>({ isPending: false, navigate: () => { } });

export function ProgressProvider({ children }: { children: React.ReactNode }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const navigate = (href: string) => {
        startTransition(() => {
            router.push(href);
        });
    };

    return (
        <ProgressContext.Provider value={{ isPending, navigate }}>
            {/* ⚡ THE FIXED TOP ACCENT LOADER STRIP */}
            {isPending && (
                <div className="fixed top-0 left-0 right-0 z-9999 pointer-events-none">
                    <div className="h-0.5 w-full bg-portfolio-accent/10 relative overflow-hidden">
                        {/* Main bar */}
                        <div className="absolute inset-y-0 left-0 right-0 bg-portfolio-accent animate-loading-bar shadow-[0_0_16px_2px_var(--color-portfolio-accent)]" />
                        {/* Glow bloom on top */}
                        <div className="absolute inset-y-0 left-0 right-0 bg-portfolio-accent/40 blur-sm animate-loading-bar animate-loading-glow scale-y-[3]" />
                    </div>
                </div>
            )}
            {children}
        </ProgressContext.Provider>
    );
}

export const useProgressNavigation = () => useContext(ProgressContext);