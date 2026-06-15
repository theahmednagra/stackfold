import Link from "next/link";
import { ExternalLinkIcon } from "@/components/portfolio/icons/social-icons";

export function ContactSection({ email }: { email: string }) {
  return (
    <section className="space-y-4 pt-12">
      <h2 className="text-2xl font-bold text-white">Contact</h2>
      <p className="text-[15px] leading-7 text-zinc-400">
        You can send me over an e-mail on{" "}
        <Link
          href={`mailto:${email}`}
          className="inline-flex items-center gap-1 font-medium text-sky-400 hover:text-sky-300"
        >
          {email}
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </Link>
      </p>
    </section>
  );
}
