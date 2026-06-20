"use client";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  username: string;
  pathSegments: string[];
}

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  onNavigate,
  username,
  pathSegments,
}: MobileMenuDrawerProps) {
  return (
    <div 
      className={`fixed inset-0 z-40 sm:hidden flex justify-end transition-all duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
    >
      {/* Backdrop Tint */}
      <div 
        className={`absolute inset-0 bg-portfolio-bg/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel Sliding Content */}
      <div 
        className={`relative w-72 h-full bg-portfolio-card border-l border-portfolio-border/40 px-6 pt-32 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col border-t border-portfolio-border/20">
          <button
            onClick={() => onNavigate(`/p/${username}`)}
            className={`w-full text-left font-sans text-[20px] font-medium py-4 border-b border-portfolio-border/20 transition-colors cursor-pointer ${
              pathSegments.length === 2 ? "text-portfolio-accent" : "text-portfolio-text/80 active:text-portfolio-accent"
            }`}
          >
            Home
          </button>
          
          <button
            onClick={() => onNavigate(`/p/${username}/projects`)}
            className={`w-full text-left font-sans text-[20px] font-medium py-4 border-b border-portfolio-border/20 transition-colors cursor-pointer ${
              pathSegments.includes("projects") ? "text-portfolio-accent" : "text-portfolio-text/80 active:text-portfolio-accent"
            }`}
          >
            Projects
          </button>
        </div>
      </div>
    </div>
  );
}