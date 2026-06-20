"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  FiEye,
  FiTrendingUp,
  FiGlobe,
  FiCalendar,
  FiAlertCircle,
  FiActivity,
  FiMapPin,
  FiLoader,
  FiPlusCircle,
  FiArrowRight
} from "react-icons/fi";

interface DbDataPoint { _id: string; views: number; }
interface CountryData { _id: string; count: number; }
interface AnalyticsPayload {
  weekly: DbDataPoint[];
  monthly: DbDataPoint[];
  topCountries: CountryData[];
  totalViews: number;
}

function completeDateGaps(data: DbDataPoint[], daysToLookBack: number) {
  const lookbackMap = new Map(data?.map(item => [item._id, item.views]));
  const structuredData = [];

  for (let i = daysToLookBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0];

    structuredData.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: lookbackMap.get(dateString) || 0,
    });
  }
  return structuredData;
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-portfolio-card/95 border border-portfolio-border rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-30">
        <p className="text-[11px] font-bold text-portfolio-muted uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-portfolio-accent" />
          <p className="text-[15px] font-extrabold text-portfolio-text font-mono">
            {payload[0].value.toLocaleString()} <span className="text-[12px] font-medium text-portfolio-muted">views</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const [viewType, setViewType] = useState<"weekly" | "monthly">("weekly");
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); // State checkpoint flag
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
  async function initializeAnalyticsTelemetry() {
    try {
      // ── Step 1: Lightweight Profile Onboarding Check ──
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();

      // ⚡ FIX: Added optional chaining down into the nested '.profile' property object
      if (!profileRes.ok || !profileData || profileData.error || !profileData.profile?.fullname) {
        setHasProfile(false);
        setLoading(false);
        return; // Short-circuit: prevent analytics collection database queries entirely
      }

      setHasProfile(true);

      // ── Step 2: Fetch Analytics only if Profile Shell Exists ──
      const analyticsRes = await fetch("/api/analytics/data");
      if (!analyticsRes.ok) throw new Error("Could not sync traffic records.");

      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);
    } catch (err: any) {
      setError(err.message || "Failed to initialize telemetry vectors.");
    } finally {
      setLoading(false);
    }
  }

  initializeAnalyticsTelemetry();
}, []);



  // 1. ASYNC DASHBOARD SKELETON LOADER
  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-pulse pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-portfolio-card/50 border border-portfolio-border/40 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-portfolio-card/50 border border-portfolio-border/40 rounded-2xl" />
        <div className="h-64 bg-portfolio-card/50 border border-portfolio-border/40 rounded-2xl" />
      </div>
    );
  }

  // 2. SHORT-CIRCUIT INTERCEPT LAYER (Profile not initialized yet)
  if (hasProfile === false) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[65vh] select-none">
        <div className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-xl animate-fadeIn relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-portfolio-accent/20 to-transparent" />
          
          <div className="w-12 h-12 rounded-xl bg-portfolio-bg border border-portfolio-border/80 flex items-center justify-center text-portfolio-muted mx-auto shadow-inner">
            <FiPlusCircle className="w-5 h-5 text-portfolio-accent" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-[16px] font-bold text-portfolio-text tracking-tight">Analytics Offline</h2>
            <p className="text-[13px] text-portfolio-muted leading-relaxed">
              We cannot trace audience tracking metrics or telemetry vectors until you configure your base system information framework.
            </p>
          </div>

          <Link
            href="/dashboard/portfolio"
            className="h-10 w-full flex items-center justify-center gap-2 text-[12.5px] font-bold text-portfolio-bg bg-portfolio-text hover:bg-portfolio-text/90 rounded-xl transition-all shadow-md group cursor-pointer"
          >
            <span>Initialize Profile Layout</span>
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. TELEMETRY RECORD SYNC FAULT state
  if (error || !analytics) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 text-center py-20">
        <div className="w-12 h-12 rounded-xl bg-red-950/20 border border-red-900/40 flex items-center justify-center mx-auto text-red-400 mb-4">
          <FiAlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-[16px] font-bold text-portfolio-text">Analytics Engine Error</h3>
        <p className="text-[13px] text-portfolio-muted mt-1 max-w-sm mx-auto">
          {error || "Failed to initialize active traffic database analytics collections safely."}
        </p>
      </div>
    );
  }

  const rawDataset = viewType === "weekly" ? analytics.weekly : analytics.monthly;
  const targetDays = viewType === "weekly" ? 7 : 30;
  const chartData = completeDateGaps(rawDataset, targetDays);

  const totalPeriodViews = rawDataset.reduce((acc, curr) => acc + curr.views, 0);
  const maxPeakViews = Math.max(...chartData.map(d => d.views), 0);
  const maxCountryCount = Math.max(...analytics.topCountries.map(c => c.count), 1);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4 sm:p-6 relative">

      {/* Upper Dashboard Sub-Header Context Block */}
      <div className="border-b border-portfolio-border/60 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-portfolio-text tracking-tight flex items-center gap-2.5">
            <FiActivity className="w-5 h-5 text-portfolio-accent" />
            <span>Audience Insights</span>
          </h2>
        </div>

        {/* Timeline Selector Controls */}
        <div className="p-1 bg-portfolio-card border border-portfolio-border/60 rounded-xl flex gap-1 self-start sm:self-auto">
          <button
            onClick={() => setViewType("weekly")}
            className={`h-8 px-4 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${viewType === "weekly"
              ? "bg-portfolio-bg text-portfolio-text shadow-md"
              : "text-portfolio-muted hover:text-portfolio-text"
              }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setViewType("monthly")}
            className={`h-8 px-4 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${viewType === "monthly"
              ? "bg-portfolio-bg text-portfolio-text shadow-md"
              : "text-portfolio-muted hover:text-portfolio-text"
              }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Metrics Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4 hover:border-portfolio-accent/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-portfolio-muted/90">All-Time Audience</p>
            <h2 className="text-3xl font-bold text-portfolio-text tracking-tight font-mono">
              {analytics.totalViews.toLocaleString()}
            </h2>
            <p className="text-[12px] text-portfolio-muted/60 pt-0.5">Total accumulated system impressions</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-portfolio-bg border border-portfolio-border/60 flex items-center justify-center text-portfolio-muted/80 shrink-0 shadow-inner">
            <FiGlobe className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4 hover:border-portfolio-accent/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-portfolio-muted/90">Period Engine Hits</p>
            <h2 className="text-3xl font-bold text-portfolio-text tracking-tight font-mono">
              {totalPeriodViews.toLocaleString()}
            </h2>
            <p className="text-[12px] text-portfolio-muted/60 pt-0.5">Traffic dynamic inside active filter window</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-portfolio-bg border border-portfolio-border/60 flex items-center justify-center text-portfolio-accent shrink-0 shadow-inner">
            <FiTrendingUp className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4 hover:border-portfolio-accent/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-portfolio-muted/90">Historical Peak</p>
            <h2 className="text-3xl font-bold text-portfolio-text tracking-tight font-mono">
              {maxPeakViews.toLocaleString()}
            </h2>
            <p className="text-[12px] text-portfolio-muted/60 pt-0.5">Maximum concurrent event threshold logging</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-portfolio-bg border border-portfolio-border/60 flex items-center justify-center text-portfolio-muted/80 shrink-0 shadow-inner">
            <FiCalendar className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Primary Chart Presentation Block */}
      <div className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-[16px] font-bold text-portfolio-text tracking-tight flex items-center gap-2">
            <FiEye className="w-4 h-4 text-portfolio-accent" />
            <span>Traffic Volume Dynamics</span>
          </h3>
          <p className="text-[13px] text-portfolio-muted">Chronological analysis of incoming public portfolio visits</p>
        </div>

        <div className="w-full h-76 text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="glowColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-portfolio-accent, #3b82f6)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="var(--color-portfolio-accent, #3b82f6)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.25)" fontSize={10} tickLine={false} axisLine={false} dy={12} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="views" stroke="var(--color-portfolio-accent, #3b82f6)" strokeWidth={2.5} fillOpacity={1} fill="url(#glowColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographic Density Block */}
      <div className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div>
          <h4 className="text-[16px] font-bold text-portfolio-text tracking-tight">Geographic Domain Density</h4>
          <p className="text-[13px] text-portfolio-muted">Origination metrics logged across network request streams</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {analytics.topCountries.length === 0 ? (
            <div className="sm:col-span-2 py-8 text-center text-[13px] text-portfolio-muted border border-dashed border-portfolio-border/60 rounded-xl">
              No regional distribution intelligence captured yet.
            </div>
          ) : (
            analytics.topCountries.map((c, idx) => {
              const scalarPercent = Math.min(Math.max((c.count / maxCountryCount) * 100, 2), 100);
              return (
                <div key={idx} className="p-3.5 bg-portfolio-bg/40 border border-portfolio-border/50 rounded-xl space-y-2 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 top-0 bg-portfolio-accent/5 border-r border-portfolio-accent/10 transition-all duration-500 ease-out" style={{ width: `${scalarPercent}%` }} />
                  <div className="flex justify-between items-center text-[13.5px] relative z-10">
                    <span className="text-portfolio-text font-semibold flex items-center gap-2.5">
                      {c._id === "Unknown" ? (
                        <FiLoader className="w-4 h-4 text-portfolio-muted/60 animate-spin" />
                      ) : (
                        <FiMapPin className="w-4 h-4 text-portfolio-accent/80" />
                      )}
                      <span>{c._id === "Unknown" ? "Unknown Location / Proxy Nodes" : c._id}</span>
                    </span>
                    <span className="font-mono bg-portfolio-card border border-portfolio-border/85 px-2 py-0.5 rounded-md text-[12px] font-bold text-portfolio-accent shadow-sm">
                      {c.count.toLocaleString()} views
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}