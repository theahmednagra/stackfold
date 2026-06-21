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
  FiCheckCircle,
  FiBarChart2,
  FiEyeOff,
  FiLayout,
} from "react-icons/fi";

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
  previewList: { title: string; techStack: string[]; slug: string }[];
}

const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) => (
  <div className="bg-portfolio-card border border-portfolio-border/70 rounded-2xl p-5 flex items-center justify-between group hover:border-portfolio-accent/40 transition-colors duration-200">
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-portfolio-muted/60">
        {label}
      </p>
      <p className="text-3xl font-semibold text-portfolio-text font-mono leading-none">
        {value}
      </p>
    </div>
    <div className="w-10 h-10 rounded-xl bg-portfolio-bg border border-portfolio-border/50 flex items-center justify-center text-portfolio-muted group-hover:text-portfolio-accent transition-colors duration-200">
      <Icon size={16} />
    </div>
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
      <div className="w-full max-w-5xl mx-auto space-y-5 animate-pulse">
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
    <div className="w-full max-w-5xl mx-auto space-y-5">

      <TopButtons />

      {/* ── Identity banner ── */}
      <div className="bg-portfolio-card border border-portfolio-border/70 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        {/* Subtle top line accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-portfolio-accent/30 to-transparent" />

        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-bold text-portfolio-text tracking-tight truncate">
            {data.profile.fullname}
          </h1>
          <p className="text-[14px] text-portfolio-muted leading-relaxed max-w-xl">
            {data.profile.bio}
          </p>
        </div>

        {/* 🎨 Balanced Visual Hierarchy Track */}
        <div className="shrink-0 flex items-center gap-4">

          {/* Secondary Link: Clean Ghost Label (No competing fill) */}
          <div className="flex items-center gap-1.5 border-r border-portfolio-border/60 pr-4 h-5">
            <FiLayout size={13} className="text-portfolio-muted/70" />
            <span className="text-[11.5px] font-mono text-portfolio-muted font-medium">
              {data.profile.activeTheme}
            </span>
          </div>

          {/* Primary Action: Clean Status Badge */}
          {data.profile.isActive ? (
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Live
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded-md">
              <FiEyeOff size={12} className="text-amber-500" />
              Hidden
            </div>
          )}

        </div>
      </div>


      {/* ── Counter row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Projects" value={data.counters.projects} icon={FiLayers} />
        <StatCard label="Experience" value={data.counters.experiences} icon={FiBriefcase} />
        <StatCard label="Linked accounts" value={data.counters.socials} icon={FiLink2} />
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
              <p className="text-[12.5px] text-portfolio-muted pl-5.5">
                Latest builds in your portfolio
              </p>
            </div>
            <Link
              href="/dashboard/portfolio"
              className="shrink-0 flex items-center gap-1 text-[13px] font-medium text-portfolio-accent hover:underline underline-offset-2 transition"
            >
              View all <FiArrowUpRight size={16} />
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
                  <div className="min-w-0 space-y-2">
                    <p className="text-[13.5px] font-semibold text-portfolio-text truncate">
                      {project.title}
                    </p>
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

                  <div className="shrink-0 flex items-center gap-1.5 text-[11.5px] font-mono text-emerald-500 bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    <FiCheckCircle size={12} />
                    Live
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
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-portfolio-bg border border-portfolio-border/40 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-portfolio-muted">
                <FiEye size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  All time
                </span>
              </div>
              <p className="text-[22px] font-semibold font-mono text-portfolio-text leading-none">
                {data.metrics.allTimeViews.toLocaleString()}
              </p>
            </div>
            <div className="bg-portfolio-bg border border-portfolio-border/40 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-portfolio-accent">
                <FiTrendingUp size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  7 days
                </span>
              </div>
              <p className="text-[22px] font-semibold font-mono text-portfolio-accent leading-none">
                {data.metrics.weeklyVelocity.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Geography */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-1.5 text-portfolio-muted">
              <FiMapPin size={11} />
              <p className="text-[10px] font-semibold uppercase tracking-widest">
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