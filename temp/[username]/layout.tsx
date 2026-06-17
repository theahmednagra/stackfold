import type { Metadata } from "next";
import { getProfile } from "@/services/portfolio-service";

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
  children
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      {children}
    </>
  );
}