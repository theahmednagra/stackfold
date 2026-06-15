import type { SocialLink } from "@/lib/types/portfolio";
import { SocialLinks } from "./social-links";

interface FooterProps {
  socialLinks: SocialLink[];
  footerNote: string;
}

export function Footer({ socialLinks, footerNote }: FooterProps) {
  return (
    <footer className="mx-auto w-full max-w-3xl px-6 pb-16 pt-10 sm:px-10">
      <div className="flex flex-col items-center gap-6">
        <SocialLinks links={socialLinks} />
        <p className="flex items-center gap-1.5 text-sm text-zinc-500">
          <span>{footerNote}</span>
          <span aria-hidden="true" className="text-red-500">
            ♥
          </span>
        </p>
      </div>
    </footer>
  );
}
