import ProjectRowCard from "./project-row-card";

interface ProjectItem {
  _id: string | object;
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  iconUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
}

interface ProjectsListProps {
  projects?: ProjectItem[];
  username: string;
  globalGithubUrl?: string; // 🌐 Passed cleanly from profile socialLinks
}

export default function ProjectsList({ projects = [], username, globalGithubUrl }: ProjectsListProps) {
  return (
    <div className="w-full space-y-12 text-left animate-fade-in">
      
      {/* Page Informational Title Block Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-portfolio-text">
          Projects
        </h1>
        <p className="text-[14px] font-mono tracking-tight text-portfolio-muted/80 lowercase">
          * in chronological order of completion
        </p>
      </div>

      {/* Conditionally Managed Core Structural Canvas Matrix */}
      {projects.length === 0 ? (
        <div className="w-full py-16 rounded-2xl border border-dashed border-portfolio-border bg-portfolio-card/20 flex flex-col items-center justify-center text-center select-none">
          <span className="text-portfolio-accent text-xl mb-2 animate-pulse">✧</span>
          <p className="text-[15px] font-medium text-portfolio-muted tracking-wide">
            No dynamic portfolio showcase tracks deployed yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 w-full">
          {projects.map((project) => (
            <ProjectRowCard 
              key={project._id.toString()} 
              project={project} 
              username={username} 
            />
          ))}
        </div>
      )}

      {/* 🚀 ELITE VIEW MORE ON GITHUB ANCHOR LINK */}
      {projects.length > 0 && globalGithubUrl && (
        <div className="pt-4 flex justify-start">
          <a
            href={globalGithubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-[15.5px] font-medium text-portfolio-muted hover:text-portfolio-text transition-colors group cursor-pointer"
          >
            View More on GitHub{" "}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
      )}

    </div>
  );
}