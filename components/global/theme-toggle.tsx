"use client";

import { useTheme } from "@/context/global-theme-context";
import { FiSun, FiMoon } from "react-icons/fi";
import Tooltip from "./tooltip";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "default-dark";

  return (
    <Tooltip content={isDark ? "Light Mode" : "Dark Mode"}>
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        className="w-9 h-9 relative rounded-xl border bg-portfolio-card border-portfolio-border/60 text-portfolio-muted hover:text-portfolio-accent hover:border-portfolio-accent/60 flex items-center justify-center transition-all duration-300 shadow-sm"
      >
        {/* Sun Icon */}
        <div className={`absolute transition-all duration-300 ease-out transform flex items-center justify-center ${isDark ? "translate-y-0 opacity-100 scale-100 rotate-0" : "translate-y-3 opacity-0 scale-75 -rotate-45"}`}>
          <FiSun className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400 dark:drop-shadow-[0_0_6px_rgba(251,191,36,0.2)]" />
        </div>

        {/* Moon Icon */}
        <div className={`absolute transition-all duration-300 ease-out transform flex items-center justify-center ${!isDark ? "translate-y-0 opacity-100 scale-100 rotate-0" : "-translate-y-3 opacity-0 scale-75 rotate-45"}`}>
          <FiMoon className="w-4.25 h-4.25 text-portfolio-accent" />
        </div>
      </button>
    </Tooltip>
  );
}
