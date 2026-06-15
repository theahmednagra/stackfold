import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types/portfolio";

export function ProjectListItem({ project, username }: { project: Project; username: string }) {
  return (
    <Link
      href={`${username}/projects/${project.slug}`}
      className="flex items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/40 p-4 transition-colors hover:border-white/10 hover:bg-zinc-900/70"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl">
        <Image
          src={project.icon.value}
          alt={`${project.name} icon`}
          width={48}
          height={48}
          className="h-12 w-12 object-cover"
        />
      </div>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-zinc-100">{project.name}</h3>
        <p className="truncate text-sm text-zinc-500">{project.tagline}</p>
      </div>
    </Link>
  );
}
