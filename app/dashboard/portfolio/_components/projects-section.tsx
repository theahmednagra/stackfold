"use client";

import React, { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import ProjectForm from "@/components/dashboard/forms/projectForm";
import { useClickOutside } from "@/hooks/useClickOutside";
import { FiFolder, FiPlus, FiX, FiLayers } from "react-icons/fi";
import ProjectCard from "@/components/dashboard/project-card";

interface FeatureNode {
  text: string;
}

interface ProjectNode {
  _id: string;
  title: string;
  tagline?: string;
  description: string;
  features?: FeatureNode[];
  techStack: string[];
  projectUrl?: string;
  githubUrl?: string;
  imageFile?: string;
  iconFile?: string;
  slug?: string;
}

interface ProjectSectionProps {
  projects: ProjectNode[];
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

export default function ProjectSection({ projects, onRefresh, onDelete }: ProjectSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectNode | null>(null);

  const modalRef = useClickOutside<HTMLDivElement>(() => setIsModalOpen(false));

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isModalOpen]);

  // Configure breakpoint column configurations for standard screen responsive steps
  const breakpointColumnsObj = {
    default: 2, // 2 columns on desktop
    768: 1      // Collapse to 1 column on tablet/mobile viewports
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-row items-center justify-between border-b border-portfolio-border/60 pb-4">
        <div>
          <h2 className="text-[20px] font-bold text-portfolio-text tracking-tight flex items-center gap-2.5">
            <FiLayers className="w-5 h-5 text-portfolio-accent" />
            <span>Projects Inventory</span>
          </h2>
        </div>
        <button
          onClick={() => { setSelectedProject(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-1.5 px-4 h-9 bg-portfolio-text text-portfolio-bg text-[12px] font-bold rounded-xl hover:bg-portfolio-text/90 transition-all cursor-pointer"
        >
          <FiPlus className="w-4 h-4 stroke-3" /> Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="w-full py-14 px-4 bg-portfolio-card border border-portfolio-border/60 rounded-2xl flex flex-col items-center text-center max-w-xl mx-auto shadow-xl">
          <div className="w-11 h-11 rounded-xl bg-portfolio-bg border border-portfolio-border/80 flex items-center justify-center text-portfolio-text/30 mb-4">
            <FiFolder className="w-5 h-5" />
          </div>
          <h3 className="text-[16px] font-bold text-portfolio-text tracking-tight">No Active Projects</h3>
        </div>
      ) : (
        /* Implementation of the production masonry container layout styling */
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid flex w-auto gap-6"
          columnClassName="my-masonry-grid_column bg-clip-padding flex flex-col"
        >
          {projects.map((project) => (
            <ProjectCard 
              key={project._id} 
              project={project} 
              onEdit={() => { setSelectedProject(project); setIsModalOpen(true); }} 
              onDelete={() => onDelete(project._id)} 
            />
          ))}
        </Masonry>
      )}

      {/* OVERLAY SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-portfolio-bg/70 backdrop-blur-md p-3 sm:p-6 md:p-10 transition-all">
          <div ref={modalRef} className="relative w-full max-w-3xl my-auto bg-portfolio-card border border-portfolio-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute top-5 right-5 z-20">
              <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-portfolio-bg/80 border border-portfolio-border/80 text-portfolio-text/60 hover:text-portfolio-text cursor-pointer">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-1 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="[&>form]:border-0 [&>form]:bg-transparent [&>form]:shadow-none [&>form]:p-5 [&>form]:sm:p-8">
                <ProjectForm initialData={selectedProject} onComplete={() => { setIsModalOpen(false); onRefresh(); }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}