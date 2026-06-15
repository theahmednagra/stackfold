import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/portfolio/projects/project-card";
import { ArrowRightIcon, GithubIcon } from "@/components/portfolio/icons/social-icons";
import Link from "next/link";
import { getProfile, getProjects } from "@/lib/services/portfolio-service";
import { PageShell } from "@/components/portfolio/layout/page-shell";

export default async function ProjectsPage({ params }: { params: Promise<{ username: string }> }) {

  const resolvedParams = await params;
  const username = resolvedParams?.username;

  const profile = await getProfile(username);
  if (!profile) notFound();

  const projects = await getProjects(username);
  const githubLink = profile.socialLinks.find((link) => link.platform === "github");

  return (
    <PageShell
      profile={profile}
      activePath="/projects"
      breadcrumb={[
        { label: "~", href: `/${username}` },
        { label: "Projects", active: true },
      ]}
    >
      <div className="space-y-1 pt-4 sm:pt-8">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <p className="text-sm text-zinc-500">* In random order</p>
      </div>

      <div className="space-y-6 pt-8">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} username={username} />
        ))}
      </div>

      {githubLink && (
        <div className="pt-8">
          <Link
            href={githubLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
          >
            <GithubIcon className="h-4 w-4" />
            View more on GitHub
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      )}
    </PageShell>
  );
}
