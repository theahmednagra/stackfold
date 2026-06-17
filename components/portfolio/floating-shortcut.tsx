"use client";

import { useCommand } from "@/context/command-context";
import { FaTerminal } from "react-icons/fa6";

export default function FloatingShortcut() {
    const { setIsOpen } = useCommand();

    return (
        <button
            onClick={() => setIsOpen(true)}
            type="button"
            aria-label="Open global command control layout"
            className="fixed bottom-6 right-6 w-9 h-9 rounded-xl border border-portfolio-border bg-portfolio-card/80 text-portfolio-muted backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:text-portfolio-accent hover:border-portfolio-accent/30 hover:scale-105 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] active:scale-95 z-40 cursor-pointer"
        >
            <FaTerminal className="w-4 h-4 transform transition-transform duration-300 group-hover:rotate-6" />
        </button>
    );
}