/**
 * Domain types for the Portfolio Builder.
 *
 * These types describe the shape of data as it would be persisted in
 * MongoDB and accessed through Mongoose models. Each interface below
 * mirrors a Mongoose schema 1:1 so that swapping the in-memory mock
 * data source (see `lib/data/portfolio.ts`) for a real database layer
 * (see `lib/services/portfolio-service.ts`) requires no changes to the
 * UI layer.
 */

/** Supported social platforms shown as icon links in the nav/footer. */
export type SocialPlatform = "twitter" | "github" | "linkedin" | "website";

export interface SocialLink {
  platform: SocialPlatform;
  /** Fully-qualified URL the icon links to. */
  url: string;
}

/** A single external link surfaced on a project (live site, repo, etc). */
export interface ProjectLink {
  /** Short label rendered next to the URL, e.g. "MUNYYB/Projectorate". */
  label: string;
  url: string;
  /** Which icon to render alongside the label. */
  icon?: "external" | "github";
}

/** A bullet point under "Key Features" on a project's detail page. */
export interface ProjectFeature {
  title: string;
  description: string;
}

/**
 * Visual treatment for the small square icon shown next to a project
 * in the homepage "Projects" list. Kept generic so a user can either
 * upload an image or fall back to a generated initials badge.
 */
export interface ProjectIcon {
  type: "image" | "initials";
  /** Image URL when type === "image", initials text when type === "initials". */
  value: string;
  /** Tailwind-compatible background color/gradient classes for initials badges. */
  accentClassName?: string;
}

export interface Project {
  /** Mongo ObjectId in a real database. */
  _id: string;
  /** URL-safe identifier used for /projects/[slug] routes. */
  slug: string;
  name: string;
  /** One-line summary shown in list views. */
  tagline: string;
  /** Full description rendered as one paragraph per array entry. */
  description: string[];
  /** Cover/banner image shown on the projects list and detail page. */
  coverImage: string;
  /** Small icon shown next to the project on the homepage. */
  icon: ProjectIcon;
  /** External links (live site, GitHub repo, etc.) shown on list/detail views. */
  links: ProjectLink[];
  /** Optional "Key Features" bullet list shown on the detail page. */
  features?: ProjectFeature[];
  /** Whether this project appears in the homepage "Projects" preview. */
  featured: boolean;
  /** Sort order on the /projects listing page (ascending). */
  order: number;
  /** Sort order within the homepage featured preview (ascending). Required when `featured` is true. */
  featuredOrder?: number;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Profile {
  /** Display name, e.g. "Muneeb ur rehman". */
  name: string;
  /** Public handle used in the portfolio URL: munyyb.com -> "munyyb". */
  username: string;
  /** Short brand wordmark shown top-left of the nav, e.g. "Munyyb". */
  brandName: string;
  /** Role/tagline under the name, e.g. "Creator • Full-stack Web Developer • Mobile App Developer". */
  title: string;
  /** Bio rendered as one paragraph per array entry. */
  bio: string[];
  /**
   * Inline links rendered within the bio text. Each `text` value is
   * matched (first occurrence only) within the joined bio paragraphs
   * and rendered as a hyperlink to `href`.
   */
  bioLinks?: { text: string; href: string }[];
  /** Contact email shown in the "Contact" section. */
  email: string;
  /** Optional avatar/profile image. */
  avatarUrl?: string;
  socialLinks: SocialLink[];
  navLinks: NavLink[];
  /** Closing line in the footer, e.g. "Made with". */
  footerNote: string;
}

/** Aggregate document for a single user's portfolio. */
export interface PortfolioData {
  profile: Profile;
  projects: Project[];
}
