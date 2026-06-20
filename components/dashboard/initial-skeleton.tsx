"use client";

import React from "react";

export default function DashboardInitialSkeleton() {
    return (
        <div className="min-h-screen bg-portfolio-bg text-portfolio-text select-none animate-fadeIn">

            {/* 1. PERSISTENT MOBILE TOP HEADER */}
            <header className="md:hidden w-full h-14 border-b border-portfolio-border/60 bg-portfolio-bg fixed top-0 left-0 right-0 z-40 px-4 flex items-center justify-between">
                <span className="font-black tracking-tight text-portfolio-text">
                    Stackfold
                </span>
                <div className="w-8 h-8 rounded-lg bg-portfolio-card/60 border border-portfolio-border/40 animate-pulse" />
            </header>

            {/* 2. PERSISTENT DESKTOP SIDEBAR TRACK */}
            <aside className="hidden md:flex flex-col w-64 border-r border-portfolio-border/60 bg-portfolio-bg fixed top-0 bottom-0 left-0 z-30 p-5 justify-between">
                <div className="space-y-7">
                    {/* Branding Hub Static Framework */}
                    <div className="px-3 pt-2">
                        <span className="text-[10px] font-mono tracking-[0.2em] text-portfolio-muted/40 block uppercase">
                            Control Center
                        </span>
                        <span className="text-[18px] font-black tracking-tight text-portfolio-text block mt-1">
                            Stackfold
                        </span>
                    </div>

                    {/* Nav Items Track Skeleton Line items */}
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-9 w-full bg-portfolio-card/40 border border-portfolio-border/20 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* User Footer Profile Node Skeleton */}
                <div className="border-t border-portfolio-border/60 pt-4 px-1.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-portfolio-border/40 shrink-0 animate-pulse" />
                    <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-3/4 bg-portfolio-border/40 rounded animate-pulse" />
                        <div className="h-2.5 w-1/2 bg-portfolio-border/20 rounded" />
                    </div>
                </div>
            </aside>

            {/* 3. MAIN CONTENT LAYER VIEWPORT */}
            <main className="flex-1 w-full md:pl-64 pt-14 md:pt-6 min-w-0 flex flex-col min-h-screen">
                <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 pt-0 sm:pt-0 md:pt-0 flex-1 flex flex-col">

                    {/* ── Top Utility Action Buttons Skeleton Row ── */}
                    <div className="w-full flex justify-end py-2 sm:px-0 animate-pulse">
                        <div className="flex items-center gap-2 bg-portfolio-card/30 p-1 rounded-xl border border-portfolio-border/40">
                            <div className="w-8.5 h-8.5 rounded-lg bg-portfolio-card/60" />
                            <div className="w-8.5 h-8.5 rounded-lg bg-portfolio-card/60" />
                            <div className="w-px h-4 bg-portfolio-border/40 mx-0.5" />
                            <div className="w-8.5 h-8.5 rounded-lg bg-portfolio-card/60" />
                        </div>
                    </div>

                    {/* ── Core Inner Component Viewport Placeholder ── */}
                    <div className="w-full space-y-5 py-6 px-0 md:px-5 animate-pulse">
                        {/* Identity Banner Frame Block */}
                        <div className="w-full h-24 bg-portfolio-card/30 border border-portfolio-border/70 rounded-2xl" />

                        {/* Counters Row Blocks */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 bg-portfolio-card/30 border border-portfolio-border/70 rounded-2xl" />
                            ))}
                        </div>

                        {/* Layout Split Panels Blocks */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-2 h-72 bg-portfolio-card-30 border border-portfolio-border/70 rounded-2xl" />
                            <div className="h-72 bg-portfolio-card-30 border border-portfolio-border/70 rounded-2xl" />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}