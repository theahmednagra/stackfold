import { notFound } from "next/navigation";
import { Hero } from "@/components/portfolio/home/hero";
import { FeaturedProjects } from "@/components/portfolio/home/featured-projects";
import { ContactSection } from "@/components/portfolio/home/contact-section";
import { getFeaturedProjects, getProfile } from "@/lib/services/portfolio-service";
import { DEFAULT_USERNAME } from "@/lib/data/portfolio";
import { PageShell } from "@/components/portfolio/layout/page-shell";

export default async function HomePage() {
  const profile = await getProfile(DEFAULT_USERNAME);
  if (!profile) notFound();

  const featuredProjects = await getFeaturedProjects(DEFAULT_USERNAME);

  return (
    <PageShell profile={profile} activePath="/">
      <Hero profile={profile} />
      <FeaturedProjects projects={featuredProjects} username={profile.username} />
      <ContactSection email={profile.email} />
    </PageShell>
  );
}
