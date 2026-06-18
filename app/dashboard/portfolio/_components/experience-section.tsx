"use client";

import React, { useEffect, useState } from "react";
import ExperienceForm from "@/components/dashboard/forms/experienceForm";
import { useClickOutside } from "@/hooks/useClickOutside";
import { FiPlus, FiX, FiActivity, FiClock } from "react-icons/fi";
import ExperienceCard from "@/components/dashboard/experience-card";

interface ExperienceNode {
  _id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  currentJob: boolean;
  description: string;
}

interface ExperienceSectionProps {
  experiences: ExperienceNode[];
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

export default function ExperienceSection({ experiences, onRefresh, onDelete }: ExperienceSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceNode | null>(null);

  const modalRef = useClickOutside<HTMLDivElement>(() => setIsModalOpen(false));

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isModalOpen]);

  return (
    <div className="w-full space-y-6">
      
      {/* Section Header Component */}
      <div className="flex flex-row items-center justify-between border-b border-portfolio-border/60 pb-4">
        <div>
          <h2 className="text-[20px] font-bold text-portfolio-text tracking-tight flex items-center gap-2.5">
            <FiActivity className="w-5 h-5 text-portfolio-accent" />
            <span>Career Timeline</span>
          </h2>
        </div>
        <button
          onClick={() => { setSelectedExperience(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-1.5 px-4 h-9 bg-portfolio-text text-portfolio-bg text-[12px] font-bold rounded-xl hover:bg-portfolio-text/90 transition-all cursor-pointer"
        >
          <FiPlus className="w-4 h-4 stroke-3" /> Add Milestone
        </button>
      </div>

      {/* Main Stream Stack */}
      {experiences.length === 0 ? (
        <div className="w-full py-14 px-4 bg-portfolio-card border border-portfolio-border/60 rounded-2xl flex flex-col items-center text-center max-w-xl mx-auto shadow-xl">
          <div className="w-11 h-11 rounded-xl bg-portfolio-bg border border-portfolio-border/80 flex items-center justify-center text-portfolio-text/30 mb-4">
            <FiClock className="w-5 h-5" />
          </div>
          <h3 className="text-[16px] font-bold text-portfolio-text tracking-tight">Timeline Array Empty</h3>
          <p className="text-[13px] text-portfolio-muted font-normal max-w-sm mt-1 leading-relaxed">
            No professional experience history, internships, or background nodes tracked yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {experiences.map((item) => (
            <ExperienceCard 
              key={item._id} 
              item={item} 
              onEdit={() => { setSelectedExperience(item); setIsModalOpen(true); }} 
              onDelete={() => onDelete(item._id)} 
            />
          ))}
        </div>
      )}

      {/* OVERLAY PORTAL ACTION FRAME */}
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
                <ExperienceForm initialData={selectedExperience} onComplete={() => { setIsModalOpen(false); onRefresh(); }} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}