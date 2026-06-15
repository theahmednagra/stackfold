import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types/portfolio";
import { ExternalLinkIcon } from "@/components/portfolio/icons/social-icons";

export function ProjectDetail({ project }: { project: Project }) {
  const websiteLink = project.links.find((link) => link.icon !== "github");

  return (
    <article className="space-y-8 pt-4 sm:pt-8">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <Image
              src={project.icon.value}
              alt={`${project.name} icon`}
              width={56}
              height={56}
              className="h-14 w-14 object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{project.name}</h1>
            <p className="text-sm text-zinc-500 sm:text-[15px]">{project.tagline}</p>
          </div>
        </div>

        {websiteLink && (
          <Link
            href={websiteLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            {websiteLink.url}
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </Link>
        )}
      </header>

      <div className="relative aspect-16/7 w-full overflow-hidden rounded-2xl border border-white/5 bg-zinc-950">
        <Image
          src={project.coverImage}
          alt={`${project.name} preview`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      <div className="space-y-4">
        {project.description.map((paragraph, index) => (
          <p key={index} className="text-[15px] leading-7 text-zinc-400">
            {paragraph}
          </p>
        ))}
      </div>

      {project.features && project.features.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Key Features:</h2>
          <ul className="space-y-3">
            {project.features.map((feature) => (
              <li key={feature.title} className="flex gap-3 text-[15px] leading-7 text-zinc-400">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                <span>
                  <span className="font-semibold text-zinc-200">{feature.title}: </span>
                  {feature.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
