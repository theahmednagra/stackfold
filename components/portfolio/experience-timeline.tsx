interface ExperienceItem {
    _id: string | object;
    role: string;
    company: string;
    startDate: string;
    endDate?: string;
    currentJob?: boolean;
    description: string;
}

interface ExperienceTimelineProps {
    experiences?: ExperienceItem[];
}

// Helper to reliably format raw date inputs into a premium, clean output format
function formatTimelineDate(dateString: string | undefined): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // If the date input string is invalid, gracefully fall back to displaying the raw string
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ExperienceTimeline({ experiences = [] }: ExperienceTimelineProps) {
    // 🛡️ High-Reliability Sort: Ensure current jobs or most recent dates sit at the very top
    const sortedExperiences = [...experiences].sort((a, b) => {
        if (a.currentJob && !b.currentJob) return -1;
        if (!a.currentJob && b.currentJob) return 1;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return (
        <section className="space-y-10 w-full text-left">
            <h2 className="text-3xl font-bold tracking-tight text-portfolio-text select-none">
                Experience
            </h2>

            {sortedExperiences.length === 0 ? (
                /* Premium Contextual Empty State */
                <div className="w-full py-12 px-6 rounded-2xl border border-dashed border-portfolio-border bg-portfolio-card/30 flex flex-col items-center justify-center text-center group transition-all">
                    <span className="text-portfolio-accent text-lg mb-2 opacity-60">✦</span>
                    <p className="text-[15px] font-medium text-portfolio-muted">
                        No professional timeline entries added yet.
                    </p>
                </div>
            ) : (
                /* Premium Core Vertical Timeline Grid */
                <div className="relative pl-7 sm:pl-8 space-y-10 before:absolute before:top-2 before:left-[8px] before:bottom-2 before:w-[1.5px] before:bg-portfolio-border transition-all duration-300">
                    {sortedExperiences.map((exp) => {
                        const descriptionLines = exp.description.split('\n');

                        return (
                            <div key={exp._id.toString()} className="relative group space-y-3">

                                {/* Geometric timeline tracing circle node element */}
                                <div className={`absolute -left-[26px] sm:-left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-portfolio-bg border-2 transition-all duration-300 z-10 ${exp.currentJob
                                    ? "border-portfolio-accent bg-portfolio-accent ring-4 ring-portfolio-accent/10"
                                    : "border-portfolio-muted/40"
                                    }`} />

                                {/* Heading & Meta Metadata Data-Block */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 w-full">
                                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap min-w-0">
                                        <h3 className="text-[19px] sm:text-[20px] font-bold text-portfolio-text transition-colors duration-300 group-hover:text-portfolio-accent wrap-break-word">
                                            {exp.role}
                                        </h3>
                                        <span className="text-[12.5px] sm:text-[13.5px] font-medium text-portfolio-accent bg-portfolio-accent/5 border border-portfolio-accent/10 px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                                            @{exp.company}
                                        </span>
                                    </div>
                                    <span className="text-[13.5px] sm:text-[14.5px] font-mono text-portfolio-muted tracking-tight transition-colors duration-300 whitespace-nowrap self-start lg:self-auto">
                                        {formatTimelineDate(exp.startDate)} - {exp.currentJob ? "Present" : formatTimelineDate(exp.endDate)}
                                    </span>
                                </div>

                                {/* Job Description Canvas - Processing each line separately */}
                                <div className="space-y-3 max-w-4xl">
                                    {descriptionLines.map((line, index) => {
                                        const trimmedLine = line.trim();
                                        if (!trimmedLine) return null;

                                        const match = trimmedLine.match(/^([^\s:][^:]*?(?:\s+[^\s:][^:]*?){0,3}):(.*)$/);
                                        const titlePart = match ? match[1].trim() : null;
                                        const bodyPart = match ? match[2] : trimmedLine;

                                        return (
                                            <p key={index} className="text-[15.5px] sm:text-[16.5px] text-portfolio-muted leading-relaxed transition-colors duration-300 wrap-break-word font-normal">
                                                {titlePart ? (
                                                    <>
                                                        <strong className="text-portfolio-text font-semibold tracking-tight mr-1">
                                                            {titlePart}:
                                                        </strong>
                                                        {bodyPart}
                                                    </>
                                                ) : (
                                                    trimmedLine
                                                )}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}