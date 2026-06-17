"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CommandContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    showCircles: boolean;
    toggleCircles: () => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCircles, setShowCircles] = useState(true);

    // Global Keyboard Listener
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
            // Quick Macro for Circles: T + C
            if (e.key === "c" && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== "INPUT") {
                // Simple listener extension if needed later
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const toggleCircles = () => setShowCircles((prev) => !prev);

    return (
        <CommandContext.Provider value={{ isOpen, setIsOpen, showCircles, toggleCircles }}>
            {children}
        </CommandContext.Provider>
    );
}

export function useCommand() {
    const context = useContext(CommandContext);
    if (!context) throw new Error("useCommand must be used within a CommandProvider");
    return context;
}