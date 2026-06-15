import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types/portfolio";
import { ExternalLinkIcon, GithubIcon } from "@/components/portfolio/icons/social-icons";

export function ProjectCard({ project, username }: { project: Project; username: string }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/60">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-video w-full shrink-0 bg-zinc-950 sm:aspect-auto sm:w-72">
          <Image
            src={project.coverImage}
            alt={`${project.name} preview`}
            fill
            className="object-contain"
            sizes="(min-width: 640px) 288px, 100vw"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="text-xl font-bold text-white">{project.name}</h3>
          <p className="text-[15px] leading-6 text-zinc-400">{project.tagline}</p>

          {project.links.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm">
              {project.links.map((link) => (
                <Link
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white"
                >
                  {link.icon === "github" ? (
                    <GithubIcon className="h-4 w-4" />
                  ) : null}
                  <span>{link.label}</span>
                  {link.icon !== "github" && <ExternalLinkIcon className="h-3.5 w-3.5" />}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4">
            <Link
              href={`/${username}/projects/${project.slug}`}
              className="text-sm font-medium text-zinc-300 underline-offset-4 hover:text-white hover:underline"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
