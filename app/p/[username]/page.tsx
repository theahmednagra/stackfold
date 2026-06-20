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

// For Analytics
import AnalyticsTracker from "@/components/portfolio/analytics-tracker";
import { verifySession } from "@/lib/authGuard";

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

  // Fire all database reads and the session check in parallel
  await connectToDatabase();

  const [rawProjects, rawExperiences, session] = await Promise.all([
    profile ? Project.find({ infoId: profile._id }).sort({ createdAt: -1 }).limit(3).lean() : [],
    profile ? Experience.find({ infoId: profile._id }).sort({ startDate: -1 }).lean() : [],
    verifySession().catch(() => null) // Catch error silently if visitor is logged out
  ]);

  // 🛠️ 1. Serialize Projects data to pass across Server/Client boundaries safely
  const serializedProjects = rawProjects.map((project: any) => ({
    ...project,
    _id: project._id.toString(),
    infoId: project.infoId.toString(),
    createdAt: project.createdAt?.toISOString() || null,
    updatedAt: project.updatedAt?.toISOString() || null,
  }));

  // 🛠️ 2. Serialize Experiences data to pass across Server/Client boundaries safely
  const serializedExperiences = rawExperiences.map((exp: any) => ({
    ...exp,
    _id: exp._id.toString(),
    infoId: exp.infoId.toString(),
    startDate: exp.startDate instanceof Date ? exp.startDate.toISOString() : (exp.startDate || null),
    endDate: exp.endDate instanceof Date ? exp.endDate.toISOString() : (exp.endDate || null),
    createdAt: exp.createdAt?.toISOString() || null,
    updatedAt: exp.updatedAt?.toISOString() || null,
  }));

  // Check if the logged-in visitor is the portfolio owner [Analytics]
  const isOwner = session && session.userId === profile?.userId?.toString();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Only track if it's a real visitor, completely asynchronous [Analytics] */}
      {!isOwner && profile?.userId && (
        <AnalyticsTracker ownerId={profile.userId.toString()} />
      )}

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

        {/* ⚡ FIXED: Passing pristine serialized plain data strings */}
        <ExperienceTimeline experiences={serializedExperiences} />

        {/* ⚡ FIXED: Passing pristine serialized plain data strings */}
        <FeaturedProjects projects={serializedProjects} username={username} />

        <ContactSection email={profile?.email || userAccount.email} />

      </main>

      <SystemFooter
        socialLinks={profile?.socialLinks}
        endNote={profile?.endNote}
      />
    </div>
  );
}
