"use client";

import LazyImage from "@/components/portfolio/lazy-image";
import Link from "next/link";
import { FiArrowRight, FiActivity, FiLayers, FiShield } from "react-icons/fi";
import { AuthProvider } from "@/context/auth-context";

export default function LandingPage() {

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#030303] text-portfolio-text selection:bg-portfolio-accent/20 selection:text-portfolio-accent overflow-x-hidden antialiased">

        {/* 1. Sleek Navigation Header */}
        <header className="w-full h-16 border-b border-portfolio-border/40 bg-[#030303]/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 flex items-center justify-between select-none">
          <span className="text-[16px] md:text-[18px] font-black tracking-tight text-portfolio-text">
            Stackfold
          </span>
          <Link
            href="/auth"
            className="text-[13px] font-bold border border-portfolio-border/60 bg-portfolio-card/40 hover:bg-portfolio-card hover:border-portfolio-border px-4 py-1.5 rounded-lg transition-all duration-200"
          >
            Sign In
          </Link>
        </header>

        {/* 2. Hero Context Viewport Container - Adjusted pb-20 to pb-12 */}
        <section className="relative pt-36 pb-12 px-6 sm:px-12 max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Subtle Ambient Obsidian Radial Backglow */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-125 h-62.5 bg-portfolio-accent/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Product Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-portfolio-border/40 bg-portfolio-card/30 backdrop-blur-xs mb-6 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-portfolio-accent animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-portfolio-muted">
              The Next-Gen Portfolio SaaS
            </span>
          </div>

          {/* High-Impact Main Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-3xl leading-[1.1] mb-6 text-transparent bg-clip-text bg-linear-to-b from-white to-zinc-400">
            Build a portfolio that commands attention.
          </h1>

          {/* Clear, Single-Sentence Product Informational Copy */}
          <p className="text-[15px] sm:text-[17px] text-portfolio-muted/80 font-medium tracking-tight max-w-xl leading-relaxed mb-10">
            The minimalist developer platform to launch, monitor, and scale a spectacular, elite showcase site with infinite speed.
          </p>

          {/* Master Primary Call To Action (CTA) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/auth"
              className="group relative w-full sm:w-auto px-6 py-3.5 rounded-xl bg-portfolio-accent text-[#030303] font-bold text-[14px] tracking-tight hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(var(--color-portfolio-accent),0.15)]"
            >
              Claim Your Username
              <FiArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        {/* 3. High-End Mockup / Feature Showcase Anchor Layout - Optimized pb-24 to responsive spacing */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto pb-16 md:pb-24">
          <div className="relative border border-portfolio-border/60 bg-portfolio-card/20 p-1 md:p-2 rounded-2xl shadow-2xl backdrop-blur-xs">
            <div className="aspect-16/10 relative w-full overflow-hidden rounded-xl bg-portfolio-bg">
              <LazyImage
                src="/images/mockup-dashboard.png"
                alt="Stackfold Platform Core View Dashboard Application Workspace Mockup Screen"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* 4. Modular Feature Track System - Standardized padding top/bottom */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto pb-24 border-t border-portfolio-border/20 pt-12 md:pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Feature 1 */}
            <div className="flex flex-col space-y-3 p-5 rounded-2xl border border-portfolio-border/30 bg-portfolio-card/10 hover:border-portfolio-accent/20 transition-colors">
              <div className="w-9 h-9 rounded-lg border border-portfolio-border/60 bg-portfolio-card flex items-center justify-center text-portfolio-accent shadow-sm">
                <FiLayers className="w-4 h-4" />
              </div>
              <h3 className="text-[14.5px] font-bold tracking-tight text-portfolio-text">Custom Styling</h3>
              <p className="text-[13px] text-portfolio-muted leading-relaxed">
                Personalize your space with fluid dark and light themes. Adjust your colors and profile details to match your personal brand instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col space-y-3 p-5 rounded-2xl border border-portfolio-border/30 bg-portfolio-card/10 hover:border-portfolio-accent/20 transition-colors">
              <div className="w-9 h-9 rounded-lg border border-portfolio-border/60 bg-portfolio-card flex items-center justify-center text-portfolio-accent shadow-sm">
                <FiActivity className="w-4 h-4" />
              </div>
              <h3 className="text-[14.5px] font-bold tracking-tight text-portfolio-text">Simple Analytics</h3>
              <p className="text-[13px] text-portfolio-muted leading-relaxed">
                See exactly how many people visit your live portfolio and track where your audience is coming from on a clean dashboard.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col space-y-3 p-5 rounded-2xl border border-portfolio-border/30 bg-portfolio-card/10 hover:border-portfolio-accent/20 transition-colors">
              <div className="w-9 h-9 rounded-lg border border-portfolio-border/60 bg-portfolio-card flex items-center justify-center text-portfolio-accent shadow-sm">
                <FiShield className="w-4 h-4" />
              </div>
              <h3 className="text-[14.5px] font-bold tracking-tight text-portfolio-text">Fast Image Hosting</h3>
              <p className="text-[13px] text-portfolio-muted leading-relaxed">
                Upload your project images and screenshots seamlessly. Built-in optimization keeps your page loading instantly.
              </p>
            </div>

          </div>
        </section>

      </div>
    </AuthProvider>
  );
}
