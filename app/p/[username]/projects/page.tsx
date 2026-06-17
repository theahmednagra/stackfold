import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/models/project.model";
import { getCachedProfileData } from "../layout";

import NavHeader from "@/components/portfolio/nav-header";
import ProjectsList from "@/components/portfolio/projects-list";
import SystemFooter from "@/components/portfolio/system-footer";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function PublicProjectsPage({ params }: Props) {
  const { username } = await params;
  if (!username) notFound();

  const data = await getCachedProfileData(username);
  if (!data) notFound();

  const { profile } = data;

  await connectToDatabase();
  const projects = profile
    ? await Project.find({ infoId: profile._id }).sort({ createdAt: -1 })
    : [];

  // Find the user's primary GitHub link dynamically from their social array profile options
  const globalGithubUrl = profile?.socialLinks?.find((url: string) =>
    url?.toLowerCase().includes("github.com")
  ) || "";

  return (
    <div className="w-full flex flex-col items-center">
      <NavHeader fullname={profile?.fullname} username={username} />

      <main className="w-full max-w-4xl min-h-screen px-6 pt-8 md:pt-10 pb-24 relative z-10 flex flex-col items-center">
        <ProjectsList
          projects={projects}
          username={username}
          globalGithubUrl={globalGithubUrl}
        />
      </main>

      <SystemFooter
        socialLinks={profile?.socialLinks}
        endNote={profile?.endNote}
      />
    </div>
  );
}