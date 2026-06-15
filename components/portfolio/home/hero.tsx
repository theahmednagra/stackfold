import type { Profile } from "@/lib/types/portfolio";
import { BioText } from "@/components/portfolio/home/bio-text";
import { SocialLinks } from "../layout/social-links";

export function Hero({ profile }: { profile: Profile }) {
  const titleParts = profile.title.split("•").map((part) => part.trim());

  return (
    <section className="space-y-6 pt-4 sm:pt-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {profile.name}
        </h1>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-zinc-500 sm:text-base">
          {titleParts.map((part, index) => (
            <span key={part} className="flex items-center gap-2">
              {index > 0 && <span className="text-zinc-600">•</span>}
              {part}
            </span>
          ))}
        </p>
      </div>

      <div className="space-y-4">
        <BioText bio={profile.bio} bioLinks={profile.bioLinks} />
      </div>

      <SocialLinks links={profile.socialLinks} />
    </section>
  );
}
