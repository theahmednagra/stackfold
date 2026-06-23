import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/models/project.model";
import { getCachedProfileData } from "../../layout";

import NavHeader from "@/components/portfolio/nav-header";
import ProjectHero from "@/components/portfolio/project-hero";
import ProjectDetails from "@/components/portfolio/project-details";
import SystemFooter from "@/components/portfolio/system-footer";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export default async function PublicProjectDetailPage({ params }: Props) {
  const { username, slug } = await params;
  if (!username || !slug) notFound();

  const data = await getCachedProfileData(username);
  if (!data) notFound();

  const { profile } = data;

  await connectToDatabase();
  const project = profile
    ? await Project.findOne({ infoId: profile._id, slug: slug.toLowerCase().trim() })
    : null;

  if (!project) notFound();

  return (
    <div className="w-full flex flex-col items-center">
      <NavHeader fullname={profile?.fullname} username={username} />

      <main className="w-full max-w-4xl min-h-screen px-6 pt-10 pb-24 relative z-10 space-y-6 md:space-y-8">

        <ProjectHero
          title={project.title}
          tagline={project.tagline}
          iconUrl={project.iconUrl}
          imageUrl={project.imageUrl} // Pass custom high-res cover image
          projectUrl={project.projectUrl}
          githubUrl={project.githubUrl}
        />

        <ProjectDetails
          description={project.description}
          techStack={project.techStack} // Pass exact schema token array
          features={project.features}   // Pass exact features string array
        />

      </main>

      <SystemFooter
        socialLinks={profile?.socialLinks}
        endNote={profile?.endNote}
      />
    </div>
  );
}