"use client"

import LazyImage from "@/components/portfolio/lazy-image";
import { FaArrowRight } from "react-icons/fa6";
import { useProgressNavigation } from "./progress-provider";

interface ProjectItem {
  _id: string | object;
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  iconUrl?: string;
}

interface FeaturedProjectsProps {
  projects?: ProjectItem[];
  username: string;
}

export default function FeaturedProjects({ projects = [], username }: FeaturedProjectsProps) {
  const { navigate } = useProgressNavigation();

  // Enforce a strict fallback maximum of 3 items for the featured display structure
  const featuredList = projects.slice(0, 3);

  return (
    <section className="space-y-8 w-full text-left">
      <h2 className="text-3xl font-bold tracking-tight text-portfolio-text">
        Projects
      </h2>

      {featuredList.length === 0 ? (
        <div className="w-full py-12 rounded-2xl border border-dashed border-portfolio-border bg-portfolio-card/30 flex flex-col items-center justify-center text-center">
          <span className="text-portfolio-accent text-xl mb-2">✧</span>
          <p className="text-[15px] font-medium text-portfolio-muted">
            Showcase builds are currently being deployed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 w-full">
          {featuredList.map((proj) => (
            <div
              key={proj._id.toString()}
              onClick={() => navigate(`/p/${username}/projects/${proj.slug}`)}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 p-5 rounded-2xl border border-portfolio-border bg-portfolio-card/30 transition-all duration-300 hover:border-portfolio-accent/20 hover:bg-portfolio-card/70 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full"
            >
              {/* Left Core Context Block */}
              <div className="flex items-center sm:items-start gap-2.5 sm:gap-4 min-w-0 flex-1">

                {/* Premium Isolated Icon Frame Container */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0 overflow-hidden border border-portfolio-border/60 bg-portfolio-card p-1 flex items-center justify-center shadow-2xs">
                  {proj.iconUrl ? (
                    <LazyImage
                      src={proj.iconUrl}
                      alt={`${proj.title} icon`}
                      className="w-full h-full object-contain rounded-md"
                    />
                  ) : (
                    <span className="text-portfolio-accent text-xs font-mono font-bold select-none">✦</span>
                  )}
                </div>

                {/* Text Canvas: Optimized for Hybrid Row/Stack Layouts */}
                <div className="min-w-0 flex-1 pt-0.5 sm:pt-0">
                  <div className="flex items-center justify-between sm:justify-start gap-3 w-full">
                    <h3 className="text-[17px] sm:text-[18px] font-bold tracking-tight text-portfolio-text group-hover:text-portfolio-accent transition-colors duration-200 truncate">
                      {proj.title}
                    </h3>

                    {/* Mobile-Only Row End Anchor to prevent layout dead-spaces */}
                    <div className="sm:hidden text-portfolio-muted/40 group-hover:text-portfolio-accent group-hover:translate-x-0.5 transition-all duration-300 shrink-0">
                      <FaArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Desktop-Responsive Description Text Block */}
                  <p className="hidden sm:block text-[14px] sm:text-[14.5px] text-portfolio-muted font-normal tracking-wide leading-relaxed wrap-break-word line-clamp-1 sm:line-clamp-2">
                    {proj.tagline || proj.description}
                  </p>
                </div>
              </div>

              {/* Mobile Description Row (Breaks out under header block to maximize typography horizontal space) */}
              <p className="block sm:hidden text-[14px] text-portfolio-muted font-normal tracking-wide leading-relaxed wrap-break-word line-clamp-2">
                {proj.tagline || proj.description}
              </p>

              {/* Desktop-Only Clean Interactive Indicator Element */}
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-portfolio-muted/40 bg-portfolio-border/10 group-hover:text-portfolio-accent group-hover:bg-portfolio-accent/5 group-hover:translate-x-1 transition-all duration-300 shrink-0">
                <FaArrowRight className="w-3.5 h-3.5" />
              </div>

            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="pt-2">
          <div
            onClick={() => navigate(`/p/${username}/projects`)}
            className="inline-flex items-center gap-2 text-[15.5px] font-medium text-portfolio-muted hover:text-portfolio-text transition-colors group cursor-pointer"
          >
            View All Projects <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </div>
        </div>
      )}
    </section>
  );
}