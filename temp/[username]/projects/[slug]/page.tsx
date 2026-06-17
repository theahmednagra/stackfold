import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProjectDetail } from "@/components/portfolio/projects/project-detail";
import {
  getProfile,
  getProjectBySlug,
  getProjectSlugs,
} from "@/services/portfolio-service";
import { DEFAULT_USERNAME } from "@/lib/data/portfolio";
import { PageShell } from "@/components/portfolio/layout/page-shell";

interface ProjectPageProps {
  params: Promise<{ slug: string; username: string }>;
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugs(DEFAULT_USERNAME);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(DEFAULT_USERNAME, slug);

  if (!project) return {};

  return {
    title: `${project.name} - Projects`,
    description: project.tagline,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug, username } = await params;

  const profile = await getProfile(DEFAULT_USERNAME);
  const project = await getProjectBySlug(DEFAULT_USERNAME, slug);

  if (!profile || !project) notFound();

  return (
    <PageShell
      profile={profile}
      activePath="/projects"
      breadcrumb={[
        { label: "~", href: `/${username}` },
        { label: "Projects", href: `/${username}/projects` },
        { label: project.name, active: true },
      ]}
    >
      <ProjectDetail project={project} />
    </PageShell>
  );
}
