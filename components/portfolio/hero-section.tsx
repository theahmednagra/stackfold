import { FaGithub, FaLinkedin, FaXTwitter, FaLink } from "react-icons/fa6";

interface HeroSectionProps {
    fullname?: string;
    bio?: string;
    description?: string;
    socialLinks?: string[];
}

export default function HeroSection({ fullname, bio, description, socialLinks }: HeroSectionProps) {
    
    // Global uniform mapping engine for high-fidelity social icons
    const getSocialDetails = (url: string, sizeClass = "w-[20px] h-[20px]") => {
        const lowercaseUrl = url.toLowerCase();
        if (lowercaseUrl.includes("github.com")) {
            return { icon: <FaGithub className={sizeClass} />, name: "GitHub" };
        }
        if (lowercaseUrl.includes("linkedin.com")) {
            return { icon: <FaLinkedin className={sizeClass} />, name: "LinkedIn" };
        }
        if (lowercaseUrl.includes("twitter.com") || lowercaseUrl.includes("x.com")) {
            return { icon: <FaXTwitter className={sizeClass} />, name: "X (formerly Twitter)" };
        }
        return { icon: <FaLink className="w-4.5 h-4.5" />, name: "Website" };
    };

    return (
        <section className="space-y-6 w-full text-left animate-fade-in">
            {/* Identity Header Stack */}
            <div className="space-y-3">
                <h1 className="text-4xl md:text-[52px] font-bold tracking-tight text-portfolio-text leading-[1.15] md:leading-[1.1]">
                    {fullname || "Developer"}
                </h1>
                <p className="text-[16.5px] md:text-[18.5px] font-medium text-portfolio-text/90 tracking-wide">
                    {bio || "Creator • Full-stack Web Developer • Mobile App Developer"}
                </p>
            </div>

            {/* Core Narrative Block */}
            <div className="text-[16px] md:text-[18px] text-portfolio-muted leading-relaxed font-normal tracking-normal whitespace-pre-wrap max-w-3xl transition-colors duration-300">
                {description || "Welcome to my portfolio! Here you'll find a curated selection of my projects, experiences, and the journey that has shaped me as a developer."}
            </div>

            {/* Social Action Grid Links */}
            {socialLinks && socialLinks.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-3 sm:gap-4 pt-3">
                    {socialLinks.map((url: string, index: number) => {
                        if (!url || url.trim() === "") return null;
                        const { icon, name } = getSocialDetails(url);

                        return (
                            <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Visit my ${name}`}
                                className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border border-portfolio-border bg-portfolio-card text-portfolio-muted hover:text-portfolio-accent hover:border-portfolio-accent/30 transition-all duration-300 hover:scale-[1.03] shadow-2xs"
                            >
                                {icon}
                            </a>
                        );
                    })}
                </div>
            )}
        </section>
    );
}