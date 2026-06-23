import LazyImage from "./lazy-image";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

interface ProjectHeroProps {
  title: string;
  tagline?: string;
  iconUrl?: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
}

export default function ProjectHero({
  title,
  tagline,
  iconUrl,
  imageUrl,
  projectUrl,
  githubUrl,
}: ProjectHeroProps) {
  return (
    <section className="w-full space-y-10 md:space-y-8 text-left animate-fade-in relative z-10">

      {/* 📐 Proportional Branding Alignment Grid */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">

        {/* Left Side: Combined Icon & Content Core */}
        <div className="flex items-start gap-5 max-w-3xl flex-1 min-w-0">
          {iconUrl && (
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border border-portfolio-border bg-portfolio-card p-2 shrink-0 flex items-center justify-center shadow-xs overflow-hidden">
              <LazyImage
                src={iconUrl}
                alt={`${title} icon`}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          )}

          <div className="flex flex-col justify-center space-y-2.5 min-w-0 flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-portfolio-text wrap-break-word">
              {title}
            </h1>

            {tagline && (
              <p className="text-[14.5px] sm:text-[15.5px] font-medium text-portfolio-accent font-mono leading-tight wrap-break-word">
                {tagline}
              </p>
            )}

          </div>
        </div>

        {/* Right Side: Action Target Anchor Links */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 self-start md:self-center flex-wrap sm:flex-nowrap">
          {githubUrl && githubUrl.trim() !== "" && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-portfolio-border bg-portfolio-card text-[14px] font-medium text-portfolio-muted hover:text-portfolio-text hover:border-portfolio-accent/30 transition-all shadow-xs"
            >
              <FaGithub className="w-4 h-4 opacity-90" />
              <span>Source</span>
            </a>
          )}
          {projectUrl && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-portfolio-text text-portfolio-bg text-[14px] font-semibold hover:opacity-90 transition-all shadow-xs"
            >
              <FaExternalLinkAlt className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </a>
          )}
        </div>
      </div>

      {/* Cinematic Main Mockup Frame Preview Container */}
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-portfolio-card border border-portfolio-border shadow-xs relative">
        {imageUrl ? (
          <LazyImage
            src={imageUrl}
            alt={`${title} case showcase`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-portfolio-muted/20 text-2xl sm:text-3xl font-mono select-none">
            ✦
          </div>
        )}
      </div>

    </section>
  );
}