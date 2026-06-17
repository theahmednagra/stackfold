import Link from "next/link";
import { ArrowRightIcon } from "@/components/portfolio/icons/social-icons";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-white">Project not found</h1>
      <p className="text-[15px] text-zinc-500">
        The project you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
      >
        Back to Projects
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
