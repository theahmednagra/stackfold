interface ProjectDetailsProps {
  description: string;
  features?: string[];
  techStack?: string[];
}

export default function ProjectDetails({ description, features = [], techStack = [] }: ProjectDetailsProps) {
  return (
    <div className="w-full space-y-10 pt-2 text-left animate-fade-in">

      {/* 📝 SECTION 1: Case Overview Copy */}
      <div className="space-y-4 w-full">
        <h4 className="text-[12px] sm:text-[13px] font-bold tracking-widest text-portfolio-accent uppercase font-mono select-none">
          // Overview
        </h4>
        <p className="text-[15.5px] sm:text-[17px] text-portfolio-muted leading-relaxed font-normal tracking-normal whitespace-pre-wrap w-full">
          {description}
        </p>
      </div>

      {/* 🛠️ SECTION 2: Integrated Technical Stack Row (Visual Separator Matrix) */}
      {techStack.length > 0 && (
        <div className="w-full py-5 border-y border-portfolio-border/40 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <span className="text-[11.5px] sm:text-[12px] font-mono font-bold tracking-wider text-portfolio-text uppercase shrink-0 select-none">
            Engineered With:
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-lg text-[12.5px] sm:text-[13px] font-mono bg-portfolio-card border border-portfolio-border text-portfolio-text/90 font-medium shadow-2xs whitespace-nowrap"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 📋 SECTION 3: Highlights & Innovations Grid */}
      {features.length > 0 && (
        <div className="space-y-6 w-full">
          <h4 className="text-[12px] sm:text-[13px] font-bold tracking-widest text-portfolio-accent uppercase font-mono select-none">
            // Core Highlights & Innovations
          </h4>
          <div className="grid grid-cols-1 gap-4 w-full">
            {features.map((feat, index) => {
              // Strictly isolate only the first colon to protect descriptions containing URLs or inline times
              const match = feat.match(/^([^:]+):(.*)$/);
              const titlePart = match ? match[1].trim() : null;
              const bodyPart = match ? match[2] : feat;

              return (
                <div
                  key={index}
                  className="w-full p-4 sm:p-5 rounded-xl border border-portfolio-border bg-portfolio-card/20 flex items-start gap-3.5 text-[14.5px] sm:text-[15.5px] text-portfolio-muted leading-relaxed transition-colors duration-200 hover:bg-portfolio-card/40"
                >
                  <span className="text-portfolio-accent font-mono select-none pt-0.5 text-[13px] sm:text-[14px] shrink-0">
                    ✦
                  </span>
                  <p className="w-full wrap-break-word whitespace-normal">
                    {titlePart ? (
                      <>
                        <strong className="text-portfolio-text font-bold tracking-tight mr-1">
                          {titlePart}:
                        </strong>
                        {bodyPart}
                      </>
                    ) : (
                      feat
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}