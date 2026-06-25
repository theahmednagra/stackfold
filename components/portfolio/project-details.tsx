import React from "react";

interface ProjectDetailsProps {
  description: string;
  features?: string[];
  techStack?: string[];
}

export default function ProjectDetails({
  description,
  features = [],
  techStack = []
}: ProjectDetailsProps) {
  return (
    <article className="w-full space-y-6 md:space-y-8 text-left animate-fade-in antialiased selection:bg-portfolio-accent/20">

      {/* SECTION 1: Case Overview Copy */}
      <section className="prose prose-portfolio max-w-none">
        <p className="text-[16px] leading-relaxed font-normal tracking-wide text-portfolio-muted whitespace-pre-wrap">
          {description}
        </p>
      </section>

      {/* SECTION 2: Technical Stack Row */}
      {techStack.length > 0 && (
        <section
          className="w-full py-6 border-y border-portfolio-border/30 flex flex-col md:flex-row md:items-center gap-4"
          aria-label="Technology Stack"
        >
          <h3 className="text-[12px] font-mono font-bold tracking-widest text-portfolio-text/60 uppercase shrink-0 select-none">
            Engineered With
          </h3>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-md text-[12px] font-mono bg-portfolio-card/50 border border-portfolio-border/60 text-portfolio-text/90 font-medium tracking-tight shadow-xs hover:border-portfolio-accent/40 transition-colors duration-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: Highlights & Innovations */}
      {features.length > 0 && (
        <section className="space-y-6 w-full" aria-label="Project Highlights">
          <h3 className="text-[12px] font-mono font-bold tracking-widest text-portfolio-accent uppercase select-none">
            Core Highlights & Innovations
          </h3>
          <ul className="grid gap-4 w-full list-none m-0 p-0">
            {features.map((feat, index) => {
              const match = feat.match(/^([^:]+):(.*)$/);
              const titlePart = match ? match[1].trim() : null;
              const bodyPart = match ? match[2] : feat;

              return (
                <li
                  key={index}
                  className="group w-full flex items-start gap-3 text-[16px] text-portfolio-muted leading-relaxed"
                >
                  <span
                    className="w-1.5 h-1.5 mt-2.25 rounded-full bg-portfolio-accent/70 group-hover:bg-portfolio-accent transition-colors duration-200 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="w-full wrap-break-word">
                    {titlePart ? (
                      <p>
                        <strong className="text-portfolio-text font-semibold tracking-tight mr-1.5 inline-block">
                          {titlePart}:
                        </strong>
                        <span className="text-portfolio-muted">{bodyPart.trim()}</span>
                      </p>
                    ) : (
                      <p>{feat}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

    </article>
  );
}
