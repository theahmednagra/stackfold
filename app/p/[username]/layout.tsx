import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user.model";
import { Info } from "@/models/info.model";
import { Project } from "@/models/project.model";
import { ProgressProvider } from "@/components/portfolio/progress-provider";
import { CommandProvider } from "@/context/command-context";
import CommandMenu from "@/components/portfolio/command-menu";
import FloatingShortcut from "@/components/portfolio/floating-shortcut";
import AmbientGlow from "@/components/portfolio/ambient-glow";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

// 🎯 High-Performance Memoized Request Engine
export const getCachedProfileData = cache(async (username: string) => {
  await connectToDatabase();

  const userAccount = await User.findOne({
    username: username.toLowerCase().trim()
  }).select("_id email");

  if (!userAccount) return null;

  const profile = await Info.findOne({ userId: userAccount._id });
  return { userAccount, profile };
});

// ================= PRODUCTION METADATA ENGINE =================
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  if (!username) return { title: "Portfolio" };

  const data = await getCachedProfileData(username);
  if (!data || !data.profile) {
    return { title: "Portfolio Builder" };
  }

  const { profile } = data;
  return {
    title: `${profile.fullname || "Developer"} - Portfolio`,
    description: profile.bio || "Crafting premium user experiences and highly optimized web interfaces.",
    openGraph: {
      title: `${profile.fullname || "Developer"} - Portfolio`,
      description: profile.bio || "Explore projects, background timeline, and experience details.",
      type: "profile",
      username: username,
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.fullname || "Developer"} - Portfolio`,
      description: profile.bio || "Explore projects, background timeline, and experience details.",
    },
  };
}

// ================= SHARED LAYOUT ORCHESTRATION CANVAS =================
export default async function PortfolioLayout({ children, params }: LayoutProps) {
  const { username } = await params;
  if (!username) notFound();

  const data = await getCachedProfileData(username);
  if (!data) notFound();

  const { profile } = data;

  // ⚡ Retrieve only required fields for command filtering payload
  await connectToDatabase();
  const rawProjects = profile
    ? await Project.find({ infoId: profile._id }).select("title slug tagline iconUrl")
    : [];

  const optimizedProjects = rawProjects.map((p) => ({
    title: p.title,
    slug: p.slug,
    tagline: p.tagline || "",
    iconUrl: p.iconUrl || "",
  }));

  const activeTheme = profile?.theme || "default-dark";

  return (
    <div data-theme={activeTheme}>
      <ProgressProvider>
        <CommandProvider>
          <div
            className="relative min-h-screen bg-portfolio-bg text-portfolio-text antialiased font-sans transition-colors duration-300 flex flex-col items-center w-full"
          >
            {/* 🔍 Global Headless Overlay Command System */}
            <CommandMenu username={username} projects={optimizedProjects} socials={profile?.socialLinks} />

            {/* 🔮 Interactive Backdrop Atmospheric Glow Component */}
            <AmbientGlow />

            {/* Structural Child Viewport Core Node Mount Point */}
            <div className="w-full relative z-10 flex flex-col items-center">
              {children}
            </div>

            {/* 🕹️ Premium Floating Side Action Command Shortcut Trigger */}
            <FloatingShortcut />
          </div>
        </CommandProvider>
      </ProgressProvider>
    </div>
  );
}