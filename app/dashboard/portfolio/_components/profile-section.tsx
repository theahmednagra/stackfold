"use client";

import React, { useEffect, useState } from "react";
import ProfileInfoForm from "@/components/dashboard/forms/profileForm";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  FiEdit3,
  FiMail,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiPlus,
  FiX,
  FiFileText,
  FiUser,
} from "react-icons/fi";

interface ProfileSectionProps {
  profileData: any;
  onRefresh: () => void;
}

export default function ProfileSection({ profileData, onRefresh }: ProfileSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalRef = useClickOutside<HTMLDivElement>(() => {
    setIsModalOpen(false);
  });

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleFormComplete = () => {
    setIsModalOpen(false);
    onRefresh();
  };

  // Evaluates whether the user has actually written their profile data yet
  const hasProfile = profileData && profileData.fullname && profileData.fullname.trim() !== "";

  return (
    <div className="w-full space-y-6 relative">

      <div className="border-b border-portfolio-border/60 pb-4">
        <h2 className="text-[20px] font-bold text-portfolio-text tracking-tight flex items-center gap-2.5">
          <FiUser className="w-5 h-5 text-portfolio-accent" />
          <span>Profile Identity</span>
        </h2>
      </div>

      {!hasProfile ? (
        <div className="w-full py-16 px-4 bg-portfolio-card border border-portfolio-border/60 rounded-2xl flex flex-col items-center text-center max-w-2xl mx-auto shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-portfolio-bg border border-portfolio-border/80 flex items-center justify-center text-portfolio-text/40 mb-5">
            <FiFileText className="w-5 h-5" />
          </div>
          <h3 className="text-[18px] font-bold text-portfolio-text tracking-tight">Identity Metadata Node Not Set</h3>
          <p className="text-[14px] text-portfolio-muted font-normal max-w-md mt-2 leading-relaxed">
            Your primary portfolio information fields are empty. Configure your personal identity variables to deploy your professional index layout.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-6 h-11 bg-portfolio-text text-portfolio-bg text-[13px] font-bold rounded-xl hover:bg-portfolio-text/90 shadow-[0_4px_24px_var(--color-portfolio-glow)] transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4 stroke-3" /> Initialize Identity
          </button>
        </div>
      ) : (
        <div className="w-full bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-5 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">

          <div className="absolute top-5 right-5 sm:top-8 sm:right-10 z-10">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 h-8.5 bg-portfolio-bg border border-portfolio-border/80 text-portfolio-text/80 text-[12px] font-bold rounded-lg hover:bg-portfolio-border/40 hover:text-portfolio-text transition-all cursor-pointer"
            >
              <FiEdit3 className="w-3.5 h-3.5 text-portfolio-accent" />
              <span className="hidden sm:inline">Edit Section</span>
            </button>
          </div>

          <div className="max-w-3xl space-y-3 pr-14 sm:pr-24">
            <h1 className="text-[28px] sm:text-[38px] font-bold tracking-tight text-portfolio-text leading-tight sm:leading-none">
              {profileData.fullname}
            </h1>
            {profileData.bio && (
              <p className="text-[15px] sm:text-[18px] text-portfolio-accent font-medium leading-relaxed">
                {profileData.bio}
              </p>
            )}

            {profileData.contact && (
              <div className="flex items-center gap-2 pt-1 text-[13px] sm:text-[14px] text-portfolio-muted font-normal">
                <FiMail className="w-4 h-4 text-portfolio-text/30" />
                <a href={`mailto:${profileData.contact}`} className="hover:text-portfolio-text transition-colors truncate">
                  {profileData.contact}
                </a>
              </div>
            )}
          </div>

          {profileData.description && <hr className="border-portfolio-border/40 w-full" />}

          {profileData.description && (
            <div className="max-w-4xl space-y-3">
              <h3 className="text-[11px] sm:text-[12px] font-bold tracking-wider text-portfolio-text/30 uppercase">About / Background</h3>
              <div className="text-[14px] sm:text-[16px] text-portfolio-text/80 font-normal leading-relaxed space-y-4 whitespace-pre-line">
                {profileData.description}
              </div>
            </div>
          )}

          {(profileData.socialLinks?.github || profileData.socialLinks?.linkedin || profileData.socialLinks?.twitter || profileData.endNote) && (
            <div className="border-t border-portfolio-border/40 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 text-portfolio-text/40">
                {profileData.socialLinks?.github && (
                  <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer" className="hover:text-portfolio-text transition-colors p-1 pl-0">
                    <FiGithub className="w-5 h-5" />
                  </a>
                )}
                {profileData.socialLinks?.linkedin && (
                  <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-portfolio-text transition-colors p-1">
                    <FiLinkedin className="w-5 h-5" />
                  </a>
                )}
                {profileData.socialLinks?.twitter && (
                  <a href={profileData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-portfolio-text transition-colors p-1">
                    <FiTwitter className="w-5 h-5" />
                  </a>
                )}
              </div>

              {profileData.endNote && (
                <div className="text-[12px] sm:text-[13px] text-portfolio-muted font-medium tracking-wide opacity-80">
                  {profileData.endNote}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-portfolio-bg/70 backdrop-blur-md p-3 sm:p-6 md:p-10 transition-all animate-fadeIn">
          <div
            ref={modalRef}
            className="relative w-full max-w-3xl my-auto bg-portfolio-card border border-portfolio-border rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
          >
            <div className="absolute top-5 right-5 z-20">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-portfolio-bg/80 border border-portfolio-border/80 text-portfolio-text/60 hover:text-portfolio-text hover:border-portfolio-accent transition-all cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="p-1 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="[&>form]:border-0 [&>form]:bg-transparent [&>form]:shadow-none [&>form]:p-5 [&>form]:sm:p-8">
                <ProfileInfoForm
                  initialData={profileData}
                  onComplete={handleFormComplete}
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}