import type { Metadata } from "next";
import { getProfile } from "@/lib/services/portfolio-service";
import { PortfolioProvider } from "@/context/PortfolioContext";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  // 1. Safely await the params promise
  const resolvedParams = await params;

  // 2. Safely access username using optional chaining (?.)
  const username = resolvedParams?.username;

  if (!username) {
    return { title: "Portfolio" };
  }

  const profile = await getProfile(username);

  return {
    title: profile ? `${profile.name} - Portfolio` : "Portfolio",
    description: profile?.title ?? "Portfolio",
  };
}

export default async function PortfolioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  const username = resolvedParams?.username;

  if (!username) {
    return <>{children}</>;
  }

  return (
    <PortfolioProvider username={username}>
      {children}
    </PortfolioProvider>
  );
}