import { FaGithub, FaLinkedin, FaXTwitter, FaLink } from "react-icons/fa6";

interface SystemFooterProps {
    socialLinks?: string[];
    endNote?: string;
}

export default function SystemFooter({ socialLinks, endNote }: SystemFooterProps) {

    // Footer platform icon and label resolver matching hero mapping matrices
    const getSocialDetails = (url: string, sizeClass = "w-[16px] h-[16px]") => {
        const lowercaseUrl = url.toLowerCase();
        if (lowercaseUrl.includes("github.com")) {
            return { icon: <FaGithub className={sizeClass} />, name: "GitHub" };
        }
        if (lowercaseUrl.includes("linkedin.com")) {
            return { icon: <FaLinkedin className={sizeClass} />, name: "LinkedIn" };
        }
        if (lowercaseUrl.includes("twitter.com") || lowercaseUrl.includes("x.com")) {
            return { icon: <FaXTwitter className={sizeClass} />, name: "X (Twitter)" };
        }
        return { icon: <FaLink className="h-3.75 w-3.75" />, name: "Link" };
    };

    const validSocials = socialLinks ? socialLinks.filter(Boolean) : [];

    return (
        <footer className="py-12 px-4 sm:px-6 md:px-0 border-t border-portfolio-border/50 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left w-full max-w-4xl mx-auto transition-colors duration-300">

            {/* Left Hand: End Note Meta Content */}
            <div className="text-[13.5px] font-medium text-portfolio-muted tracking-normal max-w-sm sm:max-w-md leading-relaxed whitespace-pre-wrap order-1">
                {endNote ? (
                    endNote
                ) : (
                    <span className="select-none font-normal">
                        Made with <span className="text-portfolio-accent/80 text-[9px] inline-block animate-pulse mx-0.5">✦</span> by Developer
                    </span>
                )}
            </div>

            {/* Right Hand: Structured Micro Action Layout Links */}
            {validSocials.length > 0 && (
                <div className="flex items-center gap-2.5 order-2 flex-wrap justify-center sm:justify-end">
                    {validSocials.map((url: string, index: number) => {
                        if (!url || url.trim() === "") return null;
                        const { icon, name } = getSocialDetails(url);

                        return (
                            <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Follow on ${name}`}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-portfolio-border bg-portfolio-card/30 text-portfolio-muted hover:text-portfolio-accent hover:border-portfolio-accent/30 hover:bg-portfolio-card hover:scale-[1.02] transition-all duration-200 shadow-2xs"
                            >
                                {icon}
                            </a>
                        );
                    })}
                </div>
            )}

        </footer>
    );
}