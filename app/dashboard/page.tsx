"use client";

import TopButtons from "@/components/dashboard/top-buttons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  FiLayers,
  FiBriefcase,
  FiLink2,
  FiEye,
  FiTrendingUp,
  FiMapPin,
  FiAlertTriangle,
  FiArrowUpRight,
  FiTerminal,
  FiBarChart2,
} from "react-icons/fi";
import { LuEyeOff, LuLayoutDashboard, LuSlidersHorizontal, LuSunMoon } from "react-icons/lu";

interface OverviewData {
  profile: {
    id: string | null;
    fullname: string;
    bio: string;
    activeTheme: string;
    isActive: boolean;
  };
  counters: {
    projects: number;
    experiences: number;
    socials: number;
  };
  metrics: {
    allTimeViews: number;
    weeklyVelocity: number;
    topDistribution: { _id: string; count: number }[];
  };
  previewList: { title: string; techStack: string[]; slug: string; projectUrl: string; }[];
}

const StatCard = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) => (
  <div className="bg-portfolio-card border border-portfolio-border/60 rounded-xl px-5 py-5 sm:px-6 flex items-center justify-between gap-4 group hover:border-portfolio-accent/30 transition-all duration-200 select-none">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-7 h-7 rounded-lg bg-portfolio-bg border border-portfolio-border/40 flex items-center justify-center text-portfolio-muted group-hover:text-portfolio-accent shrink-0 transition-colors">
        <Icon size={14} />
      </div>
      <p className="text-[12px] font-mono font-bold uppercase tracking-wider text-portfolio-muted/60 truncate">{label}</p>
    </div>
    <p className="text-[15px] font-bold text-portfolio-text font-mono tracking-tight shrink-0">{value}</p>
  </div>
);

export default function OverviewDashboard() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/overview")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load dashboard data.");
        return res.json();
      })
      .then((payload) => {
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-5 py-4 sm:py-6 animate-pulse">
        <div className="w-full flex justify-end mb-5 select-none animate-pulse">
          <div className="flex items-center gap-2 bg-portfolio-card/30 p-1.5 rounded-xl border border-portfolio-border/40 backdrop-blur-xs">
            <div className="w-8.5 h-8.5 rounded-lg bg-portfolio-card border border-portfolio-border/40" />
            <div className="w-8.5 h-8.5 rounded-lg bg-portfolio-card border border-portfolio-border/40" />
            <div className="w-px h-4 bg-portfolio-border/60 mx-0.5" />
            <div className="w-8.5 h-8.5 rounded-lg bg-portfolio-card border border-portfolio-border/40" />
          </div>
        </div>
        <div className="h-22 bg-portfolio-card/50 border border-portfolio-border/30 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-22 bg-portfolio-card/50 border border-portfolio-border/30 rounded-2xl"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 h-72 bg-portfolio-card/50 border border-portfolio-border/30 rounded-2xl" />
          <div className="h-72 bg-portfolio-card/50 border border-portfolio-border/30 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 py-24 text-center">
        <div className="w-10 h-10 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center justify-center mx-auto text-red-400 mb-4">
          <FiAlertTriangle size={16} />
        </div>
        <p className="text-[14px] font-semibold text-portfolio-text">
          Failed to load
        </p>
        <p className="text-[13px] text-portfolio-muted mt-1 max-w-xs mx-auto">
          {error ?? "Something went wrong fetching your dashboard."}
        </p>
      </div>
    );
  }

  const maxCount = Math.max(
    ...data.metrics.topDistribution.map((c) => c.count),
    1
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 py-4 sm:py-6">

      {/* Upper Dashboard Sub-Header Context Block */}
      <div className="border-b border-portfolio-border/60 pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-portfolio-text tracking-tight flex items-center gap-2.5">
            <LuLayoutDashboard className="w-5 h-5 text-portfolio-accent" />
            <span>Metrics</span>
          </h2>
        </div>

        {/* Action Buttons Strip */}
        <TopButtons />
      </div>

      {/* ── Identity banner ── */}
      <div className="bg-portfolio-card border border-portfolio-border/70 rounded-2xl px-5 py-5 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">

        {/* Decorative Layer: Ambient linear gradient border accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-portfolio-accent/30 to-transparent" />

        {/* Typography Block: Self-contained narrative text engine handling truncation and wrapping rules */}
        <div className="space-y-1.5 min-w-0 w-full md:max-w-[70%]">
          <h1 className="text-xl sm:text-2xl font-bold text-portfolio-text tracking-tight truncate">
            {data.profile.fullname}
          </h1>
          <p className="text-[13.5px] sm:text-[14px] text-portfolio-muted leading-relaxed wrap-break-word">
            {data.profile.bio}
          </p>
        </div>

        {/* Status Control Track: Auto-sizing balanced metadata utility deck centered safely on viewport shifts */}
        <div className="w-fit shrink-0 flex items-center gap-2.5 bg-portfolio-card/30 border border-portfolio-border/40 p-1 rounded-lg select-none self-start md:self-center">

          <div className="flex items-center gap-1.5 px-2 py-1 h-6 rounded-md hover:bg-portfolio-card/60 transition-colors duration-150 cursor-default" aria-label="Theme">
            <LuSunMoon
              className="w-4 h-4 text-portfolio-accent shrink-0"
              aria-hidden="true"
            />
            <span className="text-[12px] font-mono font-semibold tracking-wide text-portfolio-muted uppercase">
              {data.profile.activeTheme}
            </span>
          </div>

          {data.profile.isActive ? (
            <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase tracking-wide text-emerald-400 border border-emerald-500/20 px-2.5 h-6 rounded-md">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/80 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Live
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase tracking-wide text-amber-500 border border-amber-500/20 px-2.5 h-6 rounded-md">
              <LuEyeOff strokeWidth={2.5} className="w-3 h-3 shrink-0" aria-hidden="true" />
              Hidden
            </div>
          )}
        </div>

      </div>

      {/* ── Counter row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Projects" value={data.counters.projects} icon={FiLayers} />
        <StatCard label="Experience" value={data.counters.experiences} icon={FiBriefcase} />
        <StatCard label="Channels" value={data.counters.socials} icon={FiLink2} />
      </div>

      {/* ── Main panels ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Projects list */}
        <div className="md:col-span-2 bg-portfolio-card border border-portfolio-border/70 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <FiTerminal size={16} className="text-portfolio-accent" />
                <h2 className="text-[15px] font-bold text-portfolio-text tracking-tight">
                  Recent projects
                </h2>
              </div>
              <p className="text-[12.5px] text-portfolio-muted">
                Latest builds in your portfolio
              </p>
            </div>
            <Link
              href="/dashboard/portfolio"
              className="relative shrink-0 flex items-center gap-1 text-[13px] font-medium text-portfolio-accent select-none group py-0.5"
            >
              <span>View all</span>
              <FiArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200 ease-out shrink-0"
              />
              <span
                className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-portfolio-accent transition-all duration-300 ease-out group-hover:w-full"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="space-y-2.5">
            {data.previewList.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-portfolio-muted border border-dashed border-portfolio-border/60 rounded-xl">
                No projects added yet.
              </div>
            ) : (
              data.previewList.map((project, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 px-4 py-3 bg-portfolio-bg/50 border border-portfolio-border/40 rounded-xl hover:border-portfolio-border/70 transition-colors duration-150 group"
                >
                  {/* Project Identification & Capabilities Matrix */}
                  <div className="min-w-0 w-full space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-[13.5px] font-semibold text-portfolio-text truncate">
                        {project.title}
                      </p>
                      {project.projectUrl && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_1px_rgba(16,185,129,0.4)] shrink-0 animate-pulse [animation-duration:2.5s]" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 4).map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-portfolio-card border border-portfolio-border/60 text-portfolio-muted"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))

            )}
          </div>
        </div>

        {/* Traffic panel */}
        <div className="bg-portfolio-card border border-portfolio-border/70 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <FiBarChart2 size={16} className="text-portfolio-accent" />
              <h2 className="text-[15px] font-bold text-portfolio-text tracking-tight">
                Traffic
              </h2>
            </div>
            <p className="text-[12.5px] text-portfolio-muted pl-5.5">
              Visitor overview
            </p>
          </div>

          {/* Metric pair */}
          <div className="flex flex-col gap-2.5 py-2 border-y border-portfolio-border/30 w-full select-none text-[11px] font-mono font-bold uppercase tracking-wider">

            {/* Metric Entity: All-Time Volumetric Channel */}
            <div className="flex w-full items-center justify-between gap-3 min-w-0">
              <FiEye size={13} className="text-portfolio-muted shrink-0" aria-hidden="true" />
              <span className="text-portfolio-muted shrink-0">All time</span>
              {/* Clean typography layout directly inline instead of heavy enclosed badges */}
              <span className="text-[13.5px] font-mono font-bold tracking-tight text-portfolio-text ml-auto tabular-nums">
                {data.metrics.allTimeViews.toLocaleString()}
              </span>
            </div>

            {/* Metric Entity: 7-Day Velocity Tracking Channel */}
            <div className="flex w-full items-center justify-between gap-3 border-l border-portfolio-border/30 min-w-0">
              <FiTrendingUp size={13} className="text-portfolio-accent/70 shrink-0" aria-hidden="true" />
              <span className="text-portfolio-accent/90 shrink-0">7 days</span>
              {/* Styled beautifully with inline contrast matching your text theme */}
              <span className="text-[13.5px] font-mono font-bold tracking-tight text-portfolio-accent ml-auto tabular-nums">
                {data.metrics.weeklyVelocity.toLocaleString()}
              </span>
            </div>

          </div>

          {/* Geography */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-1.5 text-portfolio-muted">
              <FiMapPin size={12.5} />
              <p className="text-[11px] font-semibold uppercase tracking-widest">
                Top locations
              </p>
            </div>

            {data.metrics.topDistribution.length === 0 ? (
              <p className="text-[12.5px] text-portfolio-muted italic">
                No location data yet.
              </p>
            ) : (
              data.metrics.topDistribution.slice(0, 3).map((c, cIdx) => {
                const pct = Math.min(
                  Math.max((c.count / maxCount) * 100, 5),
                  100
                );
                return (
                  <div key={cIdx} className="space-y-1.5">
                    <div className="flex justify-between text-[12px]">
                      <span className="font-medium text-portfolio-text truncate max-w-30">
                        {c._id === "Unknown" ? "Unknown" : c._id}
                      </span>
                      <span className="font-mono text-portfolio-muted tabular-nums">
                        {c.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-portfolio-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-portfolio-accent rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Link
            href="/dashboard/analytics"
            className="mt-auto w-full h-9 flex items-center justify-center gap-1.5 bg-portfolio-text text-portfolio-bg text-[12.5px] font-semibold rounded-xl hover:bg-portfolio-text/90 transition-colors duration-150"
          >
            Full analytics <FiArrowUpRight size={13} />
          </Link>
        </div>

      </div>
    </div>
  );
}