import Link from "next/link";
import type { SocialLink, SocialPlatform } from "@/lib/types/portfolio";
import {
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  ExternalLinkIcon,
} from "@/components/portfolio/icons/social-icons";

const ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  twitter: TwitterIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  website: ExternalLinkIcon,
};

const LABELS: Record<SocialPlatform, string> = {
  twitter: "Twitter",
  github: "GitHub",
  linkedin: "LinkedIn",
  website: "Website",
};

export function SocialLinks({
  links,
  className = "",
}: {
  links: SocialLink[];
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map((link) => {
        const Icon = ICONS[link.platform];
        return (
          <Link
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={LABELS[link.platform]}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
          >
            <Icon className="h-4 w-4" />
          </Link>
        );
      })}
    </div>
  );
}
