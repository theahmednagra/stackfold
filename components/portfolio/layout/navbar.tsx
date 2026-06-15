import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface NavbarProps {
  brandName?: string;
  activePath: string;
  breadcrumb?: BreadcrumbItem[];
  username: string;
}

export function Navbar({ activePath, breadcrumb, brandName, username }: NavbarProps) {

  const navLinks = [
    {
      label: "Home",
      href: `/${username}`,
    },
    {
      label: "Projects",
      href: `/${username}/projects`,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5 sm:px-10">

        {/* LEFT SIDE */}
        <div className="min-w-0">
          {breadcrumb?.length ? (
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm font-medium"
            >
              {breadcrumb.map((item, index) => (
                <span
                  key={`${item.label}-${index}`}
                  className="flex items-center gap-2"
                >
                  {index > 0 && (
                    <span className="text-zinc-600">/</span>
                  )}

                  {item.href && !item.active ? (
                    <Link
                      href={item.href}
                      className="text-zinc-400 transition-colors hover:text-zinc-200"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        item.active
                          ? "text-emerald-400"
                          : "text-zinc-500"
                      }
                    >
                      {item.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          ) : (
            <Link
              href={`/${username}`}
              className="text-lg font-bold text-emerald-400"
            >
              {brandName}
            </Link>
          )}
        </div>

        {/* RIGHT SIDE */}
        <nav aria-label="Primary" className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.href === activePath;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-medium text-white"
                    : "rounded-full px-4 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}