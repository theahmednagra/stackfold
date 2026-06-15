import Link from "next/link";
import type { Profile } from "@/lib/types/portfolio";

/**
 * Renders bio paragraphs, turning the first occurrence of any
 * `bioLinks[].text` into a hyperlink.
 */
export function BioText({ bio, bioLinks = [] }: Pick<Profile, "bio" | "bioLinks">) {
  return (
    <>
      {bio.map((paragraph, index) => (
        <p key={index} className="text-[15px] leading-7 text-zinc-400">
          {renderWithLinks(paragraph, bioLinks)}
        </p>
      ))}
    </>
  );
}

function renderWithLinks(
  text: string,
  bioLinks: { text: string; href: string }[]
): React.ReactNode {
  let remaining = text;
  const nodes: React.ReactNode[] = [];

  for (const { text: linkText, href } of bioLinks) {
    const index = remaining.indexOf(linkText);
    if (index === -1) continue;

    const before = remaining.slice(0, index);
    if (before) nodes.push(before);

    nodes.push(
      <Link
        key={href}
        href={href}
        className="font-medium text-zinc-200 underline underline-offset-2 hover:text-white"
      >
        {linkText}
      </Link>
    );

    remaining = remaining.slice(index + linkText.length);
  }

  nodes.push(remaining);
  return nodes;
}
