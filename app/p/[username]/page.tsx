import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/models/project.model";
import { Experience } from "@/models/experience.model";

// 🎯 Shared Request Memoization Strategy
import { getCachedProfileData } from "./layout";

// 🧱 Abstracted Clean Portfolio Building Nodes
import NavHeader from "@/components/portfolio/nav-header";
import HeroSection from "@/components/portfolio/hero-section";
import ExperienceTimeline from "@/components/portfolio/experience-timeline";
import FeaturedProjects from "@/components/portfolio/featured-projects";
import ContactSection from "@/components/portfolio/contact-section";
import SystemFooter from "@/components/portfolio/system-footer";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { username } = await params;
  if (!username) notFound();

  // Consume the deduplicated server data payload instantly
  const data = await getCachedProfileData(username);
  if (!data) notFound();

  const { userAccount, profile } = data;

  // Perform parallel, highly efficient database reads if profile documents exist
  await connectToDatabase();
  const [projects, experiences] = profile
    ? await Promise.all([
      Project.find({ infoId: profile._id }).sort({ createdAt: -1 }).limit(3),
      Experience.find({ infoId: profile._id }).sort({ startDate: -1 }),
    ])
    : [[], []];

  return (
    <div className="w-full flex flex-col items-center">
      {/* ================= CONTEXTUAL SMART BREADCRUMB HEADER ================= */}
      <NavHeader fullname={profile?.fullname} username={username} />

      {/* ================= CORE CENTERED CONTENT CANVAS ================= */}
      <main className="w-full max-w-4xl min-h-screen px-6 pt-8 md:pt-10 space-y-24 pb-24 relative z-10 flex flex-col items-center">

        <HeroSection
          fullname={profile?.fullname}
          bio={profile?.bio}
          description={profile?.description}
          socialLinks={profile?.socialLinks}
        />

        <ExperienceTimeline experiences={experiences} />

        <FeaturedProjects projects={projects} username={username} />

        <ContactSection email={profile?.email || userAccount.email} />

      </main>

      <SystemFooter
        socialLinks={profile?.socialLinks}
        endNote={profile?.endNote}
      />
    </div>
  );
}