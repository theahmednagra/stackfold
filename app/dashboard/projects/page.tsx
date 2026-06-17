"use client";

import ProjectForm from "@/components/dashboard/projectForm";
import BlurImage from "@/components/portfolio/blur-image";
import React, { useEffect, useState } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tracks which project is currently being edited (null means we are creating a new one)
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 1. Fetch all projects belonging to the logged-in user
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to load projects.");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Handle deleting a single project card safely
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this project?")) return;

    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete the project.");

      alert("Project removed successfully!");
      // Optimistically update frontend UI state immediately
      setProjects((prev) => prev.filter((p) => p._id !== id));
      
      // Clear editing state if the deleted item was currently open in the form
      if (editingProject?._id === id) {
        handleCloseForm();
      }
    } catch (err: any) {
      alert(err.message || "Could not delete project.");
    }
  };

  const handleEditClick = (project: any) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    fetchProjects(); // Refresh the master list data grid to catch additions/changes
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-zinc-400">
        Loading your engineering showcase...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Upper Dashboard Navigation Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects Inventory</h1>
          <p className="text-sm text-gray-500">Manage, edit, or arrange the modules displaying on your public portfolio site.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-all shadow-sm"
          >
            + Add New Project
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* Conditional Interface Split View Matrix */}
      {isFormOpen ? (
        <div className="space-y-4">
          <div className="flex justify-start">
            <button
              onClick={handleCloseForm}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 transition-all"
            >
              ← Back to Project List
            </button>
          </div>
          {/* Reuse the exact same form component for both create and update */}
          <ProjectForm initialData={editingProject} />
        </div>
      ) : projects.length === 0 ? (
        /* Empty State Blueprint View */
        <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-lg bg-gray-50">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects built yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by documenting your applications or components packages.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
            >
              Create Your First Entry
            </button>
          </div>
        </div>
      ) : (
        /* The Responsive Data Grid Cards Layout displaying the custom Blur-up effect */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="border border-zinc-200 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col justify-between group hover:border-zinc-300 transition-all"
            >
              <div>
                {/* Embedded High-Perceived Blur Placeholder Reveal Layer */}
                <BlurImage
                  src={project.imageFile}
                  alt={project.title}
                  className="w-full h-44 border-b border-zinc-100"
                />
                
                <div className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    {project.iconFile && (
                      <BlurImage
                        src={project.iconFile}
                        alt="icon"
                        className="w-7 h-7 rounded-md border shrink-0"
                      />
                    )}
                  </div>
                  
                  <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block">
                    {project.tagline}
                  </p>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 pt-1">
                    {project.description}
                  </p>

                  {/* Inline Technology Tags Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {project.techStack?.map((tech: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-zinc-100 text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Control Button Triggers footer */}
              <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3 text-sm">
                <button
                  onClick={() => handleEditClick(project)}
                  className="text-zinc-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Modify Details
                </button>
                <span className="text-zinc-300">|</span>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}