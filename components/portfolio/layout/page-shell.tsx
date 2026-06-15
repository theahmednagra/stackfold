import type { ReactNode } from "react";
import type { Profile } from "@/lib/types/portfolio";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface PageShellProps {
  username?: string;
  profile: Profile;
  activePath: string;
  breadcrumb?: BreadcrumbItem[];
  children: ReactNode;
}

export function PageShell({ profile, activePath, breadcrumb, children }: PageShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar
        activePath={activePath}
        breadcrumb={breadcrumb}
        brandName={profile.brandName}
        username={profile.username}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 sm:px-10">{children}</main>

      <Footer socialLinks={profile.socialLinks} footerNote={profile.footerNote} />
    </div>
  );
}
