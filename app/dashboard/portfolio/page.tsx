"use client";

import React, { useEffect, useState } from "react";
import ProfileSection from "./_components/profile-section";
import ProjectSection from "./_components/projects-section";
import ExperienceSection from "./_components/experience-section";
import { useToast } from "@/context/toast-context";
import ConfirmDialog from "@/components/dashboard/confirm-dialog";

type DeleteTarget = { id: string; type: "project" | "experience" };

export default function PortfolioDashboardPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [experienceData, setExperienceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reusable confirmation structural states
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchDashboardData = async () => {
    try {
      const [profileRes, projectsRes, experienceRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/projects"),
        fetch("/api/experience")
      ]);

      if (!profileRes.ok) throw new Error("Failed to sync personal profile metadata nodes.");
      if (!projectsRes.ok) throw new Error("Failed to sync structural project collection registries.");
      if (!experienceRes.ok) throw new Error("Failed to sync historical career nodes.");

      const [profileJson, projectsJson, experienceJson] = await Promise.all([
        profileRes.json(),
        projectsRes.json(),
        experienceRes.json()
      ]);

      setProfileData(profileJson.profile || profileJson);
      setProjectsData(projectsJson.projects || projectsJson || []);
      setExperienceData(experienceJson.experiences || experienceJson || []);
    } catch (err: any) {
      console.error("Dashboard core synchronization crash:", err);
      showToast("error", err.message || "An unexpected error occurred during API state synchronization.");
    } finally {
      setLoading(false);
    }
  };

  // Triggers the custom confirm modal instead of blocking native window popups
  const openDeleteModal = (id: string, type: "project" | "experience") => {
    setDeleteTarget({ id, type });
  };

  const handleConfirmedDeletion = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const { id, type } = deleteTarget;
    const endpoint = type === "project" ? `/api/projects?id=${id}` : `/api/experience?id=${id}`;

    // Store backup snapshots for optimistic rollback capabilities
    const previousProjects = [...projectsData];
    const previousExperience = [...experienceData];

    // Optimistic UI updates
    if (type === "project") {
      setProjectsData((prev) => prev.filter((item) => item._id !== id));
    } else {
      setExperienceData((prev) => prev.filter((item) => item._id !== id));
    }

    // Instantly close dialog viewport frames
    setDeleteTarget(null);

    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to execute deletion cascade on the target ${type} node.`);

      showToast("success", `${type === "project" ? "Project" : "Experience milestone"} removed successfully.`);
    } catch (err: any) {
      console.error("Deletion lifecycle failure:", err);
      showToast("error", err.message || `Failed to drop the requested ${type} parameter fields.`);

      // Rollback data structures on network errors
      if (type === "project") setProjectsData(previousProjects);
      if (type === "experience") setExperienceData(previousExperience);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-10 p-4 sm:p-6 animate-pulse">
        <div className="w-full bg-portfolio-card/50 border border-portfolio-border/40 rounded-2xl p-5 sm:p-10 h-48" />
        <div className="w-full bg-portfolio-card/50 border border-portfolio-border/40 rounded-2xl p-5 sm:p-10 h-64" />
      </div>
    );
  }

  // ⚡ Check if the user has filled out their full profile name setup step
  const hasFullnameConfigured = profileData && profileData.fullname;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 p-4 sm:p-6">

      {/* 🛠️ GLOBAL INTERCEPT DELETION MODAL ENGINE */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === "project" ? "Delete Project Component?" : "Remove Experience Milestone?"}
        description={
          deleteTarget?.type === "project"
            ? "Are you absolutely sure you want to delete this project node? This execution completely drops record parameters from your public grid view layout permanently."
            : "Are you sure you want to permanently delete this experience milestone? This action cannot be reversed."
        }
        confirmLabel={isDeleting ? "Dropping Parameters..." : "Confirm Deletion"}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmedDeletion}
      />

      {/* 1. Core Profile Layer */}
      <ProfileSection
        profileData={profileData}
        onRefresh={fetchDashboardData}
      />

      {/* 🔮 Conditional Render Track System based on profile configuration */}
      {hasFullnameConfigured && (
        <>
          {/* 2. Core Projects Grid Layer */}
          <ProjectSection
            projects={projectsData}
            onRefresh={fetchDashboardData}
            onDelete={(id) => openDeleteModal(id, "project")}
          />

          {/* 3. Core Experience Timeline Layer */}
          <ExperienceSection
            experiences={experienceData}
            onRefresh={fetchDashboardData}
            onDelete={(id) => openDeleteModal(id, "experience")}
          />
        </>
      )}
    </div>
  );
}
