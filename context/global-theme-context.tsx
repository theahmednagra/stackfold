"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "default-dark" | "default-light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("default-dark");

    useEffect(() => {
        const savedTheme = localStorage.getItem("dashboard-theme") as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            const isLight = document.documentElement.classList.contains("theme-light");
            setTheme(isLight ? "default-light" : "default-dark");
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "default-dark" ? "default-light" : "default-dark";
        setTheme(nextTheme);
        localStorage.setItem("dashboard-theme", nextTheme);

        if (nextTheme === "default-light") {
            document.documentElement.setAttribute("data-theme", "default-light");
            document.documentElement.classList.add("theme-light");
        } else {
            document.documentElement.setAttribute("data-theme", "default-dark");
            document.documentElement.classList.remove("theme-light");
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be inside a <ThemeProvider />");
    return context;
}