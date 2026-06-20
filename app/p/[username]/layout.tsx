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

// Re-export generateMetadata directly from this layout portal so Next.js hooks it safely
export { generateMetadata } from "./metadata";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

type ProfileStatus =
  | { status: "ACTIVE"; userAccount: any; profile: any }
  | { status: "PRIVATE" }
  | { status: "UNINITIALIZED" }
  | { status: "NOT_FOUND" };

// 🎯 High-Performance Memoized Request Engine
export const getProfileStatus = cache(async (username: string): Promise<ProfileStatus> => {
  await connectToDatabase();

  const userAccount = await User.findOne({
    username: username.toLowerCase().trim()
  }).select("_id email");

  if (!userAccount) return { status: "NOT_FOUND" };

  const profile = await Info.findOne({ userId: userAccount._id });

  if (!profile) return { status: "UNINITIALIZED" };
  if (profile.isActive === false) return { status: "PRIVATE" };

  return { status: "ACTIVE", userAccount, profile };
});

// Backwards Compatibility Layer for nested routes
export const getCachedProfileData = cache(async (username: string) => {
  const resolution = await getProfileStatus(username);
  if (resolution.status !== "ACTIVE") return null;
  return { userAccount: resolution.userAccount, profile: resolution.profile };
});

export default async function PortfolioLayout({ children, params }: LayoutProps) {
  const { username } = await params;
  if (!username) notFound();

  const resolution = await getProfileStatus(username);

  if (resolution.status === "NOT_FOUND" || resolution.status === "PRIVATE") {
    notFound();
  }

  if (resolution.status === "UNINITIALIZED") {
    return (
      <div className="min-h-screen bg-[#030303] text-portfolio-muted flex flex-col items-center justify-center p-6 select-none antialiased relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-portfolio-accent/5 blur-[140px] rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative max-w-sm w-full text-center flex flex-col items-center">
          <div className="relative w-12 h-12 rounded-xl border border-portfolio-border/40 bg-portfolio-card/30 flex items-center justify-center mb-6 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tr from-portfolio-accent/10 via-transparent to-transparent opacity-60" />
            <svg className="w-5 h-5 text-portfolio-text/80 stroke-[1.25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-portfolio-accent/80 animate-pulse" />
          </div>

          <h1 className="text-[15px] font-black tracking-tight text-portfolio-text mb-2">Space Reserved</h1>
          <p className="text-[13px] font-medium leading-relaxed text-portfolio-muted/70 max-w-65">
            The portfolio for <span className="text-portfolio-text font-semibold">@{username.toLowerCase()}</span> is currently being engineered. Check back shortly for the live launch.
          </p>

          <div className="mt-12 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-portfolio-border/20 bg-portfolio-card/10 backdrop-blur-xs">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-portfolio-muted/40">Powered by Stackfold</span>
          </div>
        </div>
      </div>
    );
  }

  const { profile } = resolution;

  await connectToDatabase();
  const rawProjects = await Project.find({ infoId: profile._id }).select("title slug tagline iconUrl");

  const optimizedProjects = rawProjects.map((p) => ({
    title: p.title,
    slug: p.slug,
    tagline: p.tagline || "",
    iconUrl: p.iconUrl || "",
  }));

  return (
    <div data-theme={profile.theme || "default-dark"}>
      <ProgressProvider>
        <CommandProvider>
          <div className="relative min-h-screen bg-portfolio-bg text-portfolio-text antialiased font-sans transition-colors duration-300 flex flex-col items-center w-full">
            <CommandMenu username={username} projects={optimizedProjects} socials={profile.socialLinks} />
            <AmbientGlow />
            <div className="w-full relative z-10 flex flex-col items-center">{children}</div>
            <FloatingShortcut />
          </div>
        </CommandProvider>
      </ProgressProvider>
    </div>
  );
}
