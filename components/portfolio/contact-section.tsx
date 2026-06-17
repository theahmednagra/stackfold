interface ContactSectionProps {
    email?: string;
}

export default function ContactSection({ email }: ContactSectionProps) {
    if (!email) return null; // Gracefully step out of layout if email is completely omitted

    return (
        <section className="space-y-4 pt-2 w-full text-left">
            <h2 className="text-3xl font-bold tracking-tight text-portfolio-text select-none">
                Contact
            </h2>
            <p className="text-[16px] md:text-[17.5px] text-portfolio-muted leading-relaxed font-normal tracking-wide">
                You can send me over an e-mail on{" "}
                <a
                    href={`mailto:${email}`}
                    className="text-portfolio-accent font-semibold transition-colors relative inline-block group"
                >
                    {email} ↗
                    {/* 🟢 High-Fidelity Left-to-Right Green Line Hover Animation */}
                    <span className="absolute left-0 -bottom-0.5 w-full h-0.5 bg-portfolio-accent scale-x-0 origin-left transition-transform duration-200 ease-out group-hover:scale-x-100" />
                </a>
            </p>
        </section>
    );
}