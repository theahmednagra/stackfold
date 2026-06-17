"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useProgressNavigation } from "./progress-provider";
import MobileMenuDrawer from "./mobile-menu-drawer";

interface NavHeaderProps {
  fullname?: string;
  username: string;
}

export default function NavHeader({ fullname, username }: NavHeaderProps) {
  const pathname = usePathname();
  const { navigate } = useProgressNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayName = fullname?.trim() ? fullname.trim().split(" ")[0] : "Dev";
  const pathSegments = pathname.split("/").filter(Boolean);

  const isProjectsRoot = pathSegments.length === 3 && pathSegments[2] === "projects";
  const isProjectDetail = pathSegments.length === 4 && pathSegments[2] === "projects";

  const formatSlugToTitle = (slug: string) => {
    return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  };

  // Safely close the menu drawer if screen handles resizing layout changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent background scroll bleed when mobile window is visible
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleMobileNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="w-full p-6 flex justify-between items-center relative z-50 select-none">
        
        {/* Breadcrumbs Track */}
        <div className="flex items-center gap-2 text-[17px] font-mono tracking-tight">
          {isProjectsRoot ? (
            <>
              <button onClick={() => navigate(`/p/${username}`)} className="text-portfolio-muted hover:text-portfolio-text cursor-pointer">~</button>
              <span className="text-portfolio-border">/</span>
              <span className="text-portfolio-accent font-bold">Projects</span>
            </>
          ) : isProjectDetail ? (
            <>
              <button onClick={() => navigate(`/p/${username}`)} className="text-portfolio-muted hover:text-portfolio-text cursor-pointer">~</button>
              <span className="text-portfolio-border">/</span>
              <button onClick={() => navigate(`/p/${username}/projects`)} className="text-portfolio-muted hover:text-portfolio-text cursor-pointer">Projects</button>
              <span className="text-portfolio-border">/</span>
              <span className="text-portfolio-accent font-bold truncate max-w-36 sm:max-w-none">
                {formatSlugToTitle(pathSegments[3])}
              </span>
            </>
          ) : (
            <span className="font-bold tracking-tight text-portfolio-accent font-sans">{displayName}</span>
          )}
        </div>

        {/* 💻 Desktop Action Tabs Slider */}
        <div className="hidden sm:flex items-center gap-1 bg-portfolio-card border border-portfolio-border p-1.5 rounded-xl backdrop-blur-md">
          <button
            onClick={() => navigate(`/p/${username}`)}
            className={`text-[14px] font-medium px-4 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
              pathSegments.length === 2 ? "bg-portfolio-text text-portfolio-bg shadow-xs" : "text-portfolio-muted hover:text-portfolio-text"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate(`/p/${username}/projects`)}
            className={`text-[14px] font-medium px-4 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
              pathSegments.includes("projects") ? "bg-portfolio-text text-portfolio-bg shadow-xs" : "text-portfolio-muted hover:text-portfolio-text"
            }`}
          >
            Projects
          </button>
        </div>

        {/* 📱 Mobile Morphing Menu Trigger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex sm:hidden flex-col justify-center items-center w-8 h-8 relative z-50 rounded-lg hover:bg-portfolio-card/50 transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <div className="flex flex-col gap-1.5 w-5">
            <span 
              className={`h-0.5 w-full bg-portfolio-text rounded-full transition-all duration-300 origin-center ${
                isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`} 
            />
            <span 
              className={`h-0.5 w-full bg-portfolio-text rounded-full transition-all duration-200 ${
                isMobileMenuOpen ? "opacity-0 scale-x-0" : ""
              }`} 
            />
            <span 
              className={`h-0.5 w-full bg-portfolio-text rounded-full transition-all duration-300 origin-center ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`} 
            />
          </div>
        </button>
      </nav>

      {/* 📱 Decoupled Sidebar Overlay Panel */}
      <MobileMenuDrawer 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={handleMobileNavigate}
        username={username}
        pathSegments={pathSegments}
      />
    </>
  );
}