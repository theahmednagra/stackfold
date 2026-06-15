import { portfolios } from "@/lib/data/portfolio";
import type { PortfolioData, Profile, Project } from "@/lib/types/portfolio";

/**
 * Data access layer.
 *
 * Every export here is `async` and shaped the way a Mongoose-backed
 * implementation would be (e.g. `User.findOne({ username })`,
 * `Project.find({ owner, featured: true }).sort({ featuredOrder: 1 })`).
 * Today they read from the in-memory `portfolios` map in
 * `lib/data/portfolio.ts`; swapping that for real MongoDB calls later
 * will not require any changes to the components or pages that call
 * these functions.
 */

/** Simulates network/database latency so loading states behave realistically. */
async function simulateLatency() {
  // Intentionally short — keep local dev snappy while still exercising
  // any Suspense/loading boundaries that wrap these calls.
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Fetches the full portfolio document (profile + projects) for a username.
 * Mirrors: `db.collection("portfolios").findOne({ username })`.
 */
export async function getPortfolioByUsername(
  username: string
): Promise<PortfolioData | null> {
  await simulateLatency();
  return portfolios[username] ?? null;
}

/**
 * Fetches just the profile section for a username.
 * Mirrors: `Profile.findOne({ username })`.
 */
export async function getProfile(username: string): Promise<Profile | null> {
  const portfolio = await getPortfolioByUsername(username);
  return portfolio?.profile ?? null;
}

/**
 * Fetches every project belonging to a user, sorted for the /projects page.
 * Mirrors: `Project.find({ owner: username }).sort({ order: 1 })`.
 */
export async function getProjects(username: string): Promise<Project[]> {
  const portfolio = await getPortfolioByUsername(username);
  if (!portfolio) return [];

  return [...portfolio.projects].sort((a, b) => a.order - b.order);
}

/**
 * Fetches only the projects flagged for the homepage preview, sorted by
 * their dedicated `featuredOrder`.
 * Mirrors: `Project.find({ owner: username, featured: true }).sort({ featuredOrder: 1 })`.
 */
export async function getFeaturedProjects(username: string): Promise<Project[]> {
  const projects = await getProjects(username);

  return projects
    .filter((project) => project.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
}

/**
 * Fetches a single project by its slug, scoped to a username.
 * Mirrors: `Project.findOne({ owner: username, slug })`.
 */
export async function getProjectBySlug(
  username: string,
  slug: string
): Promise<Project | null> {
  const projects = await getProjects(username);
  return projects.find((project) => project.slug === slug) ?? null;
}

/**
 * Returns the slugs for every project belonging to a user — handy for
 * `generateStaticParams` on the project detail route.
 */
export async function getProjectSlugs(username: string): Promise<string[]> {
  const projects = await getProjects(username);
  return projects.map((project) => project.slug);
}
