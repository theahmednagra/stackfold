import React from "react";

interface ProjectDetailsProps {
  description: string;
  features?: string[];
  techStack?: string[];
}

export default function ProjectDetails({
  description,
  features = [],
  techStack = [],
}: ProjectDetailsProps) {
  return (
    <article className="w-full text-left animate-fade-in antialiased selection:bg-portfolio-accent/20">

      {/* ── DESCRIPTION ── */}
      <p className="text-[16px] leading-[1.85] text-portfolio-muted whitespace-pre-wrap mb-4 sm:mb-6">
        {description}
      </p>

      {/* ── FEATURES ── */}
      {features.length > 0 && (
        <div className="mb-5 sm:mb-7">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-portfolio-text tracking-tight mb-4">
            Key Features
          </h2>
          <ul className="space-y-2.5 ml-3 sm:ml-6">
            {features.map((feat, index) => {
              const match = feat.match(/^([^:]+):(.*)$/);
              const titlePart = match ? match[1].trim() : null;
              const bodyPart = match ? match[2].trim() : feat;

              return (
                <li key={index} className="flex items-start gap-3 sm:gap-5">
                  <span className="mt-2.25 w-1.5 h-1.5 rounded-full bg-portfolio-text shrink-0" />
                  <span className="text-[15px] text-portfolio-muted leading-relaxed">
                    {titlePart ? (
                      <>
                        <strong className="font-semibold text-portfolio-text">
                          {titlePart}:
                        </strong>{" "}
                        {bodyPart}
                      </>
                    ) : (
                      feat
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── TECH STACK ── */}
      {techStack.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-2.75 py-1.25 rounded-lg text-[11.5px] font-mono font-medium bg-portfolio-card/40 border border-portfolio-border/60 text-portfolio-text/75 hover:border-portfolio-accent/40 hover:text-portfolio-text transition-all duration-150"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

    </article>
  );
}