import Link from "next/link";
import type { Project } from "@/lib/types/portfolio";
import { ProjectListItem } from "@/components/portfolio/projects/project-list-item";
import { ArrowRightIcon } from "@/components/portfolio/icons/social-icons";

export function FeaturedProjects({ projects, username }: { projects: Project[]; username: string }) {
  return (
    <section className="space-y-6 pt-12">
      <h2 className="text-2xl font-bold text-white">Projects</h2>

      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectListItem key={project._id} project={project} username={username} />
        ))}
      </div>

      <Link
        href={`/${username}/projects`}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
      >
        View All Projects
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </section>
  );
}
