"use client";

import LazyImage from "@/components/portfolio/lazy-image";
import Link from "next/link";
import { FiArrowRight, FiActivity, FiLayers, FiShield, FiCpu } from "react-icons/fi";
import { AuthProvider } from "@/context/auth-context";

const FEATURES = [
  {
    icon: FiCpu,
    label: "01",
    title: "AI Copilot",
    description:
      "Tell the copilot to add a project, update your bio, or switch your theme. It reads and writes your portfolio through natural language - no forms, no clicking around.",
    highlight: true,
  },
  {
    icon: FiLayers,
    label: "02",
    title: "Theme & Branding",
    description:
      "Switch between dark and light themes instantly. Your colors, bio, and social links update live across your public portfolio the moment you save.",
  },
  {
    icon: FiActivity,
    label: "03",
    title: "Visitor Analytics",
    description:
      "See total visits, weekly trends, and a breakdown of where your audience is coming from - all without third-party scripts or external dashboards.",
  },
  {
    icon: FiShield,
    label: "04",
    title: "Instant Image Hosting",
    description:
      "Drag in a project screenshot and it's live. Cloudinary handles optimization and delivery so your portfolio loads fast on any device.",
  },
];

export default function LandingPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#030303] text-portfolio-text selection:bg-portfolio-accent/20 selection:text-portfolio-accent overflow-x-hidden antialiased">

        {/* ── NAV ── */}
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

        {/* ── HERO ── */}
        <section className="relative pt-36 pb-12 px-6 sm:px-12 max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-125 h-62.5 bg-portfolio-accent/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-portfolio-border/40 bg-portfolio-card/30 backdrop-blur-xs mb-6 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-portfolio-accent animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-portfolio-muted">
              The Next-Gen Portfolio SaaS
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-3xl leading-[1.1] mb-6 text-transparent bg-clip-text bg-linear-to-b from-white to-zinc-400">
            Build a portfolio that commands attention.
          </h1>

          <p className="text-[15px] sm:text-[17px] text-portfolio-muted/80 font-medium tracking-tight max-w-xl leading-relaxed mb-10">
            The minimalist developer platform to launch, monitor, and scale a spectacular, elite showcase site with infinite speed.
          </p>

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

        {/* ── MOCKUP ── */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto pb-16 md:pb-24">
          <div className="relative border border-portfolio-border/60 bg-portfolio-card/20 p-1 md:p-2 rounded-2xl shadow-2xl backdrop-blur-xs">
            <div className="aspect-16/10 relative w-full overflow-hidden rounded-xl bg-portfolio-bg">
              <LazyImage
                src="/images/mockup-dashboard.png"
                alt="Stackfold dashboard"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto pb-24 border-t border-portfolio-border/20 pt-12 md:pt-16">

          {/* Section header */}
          <div className="mb-10 md:mb-12">
            <p className="text-[12px] font-mono font-bold uppercase tracking-widest text-portfolio-accent mb-2">
              What's inside
            </p>
            <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-portfolio-text max-w-md leading-snug">
              Everything you need to own your presence online.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className={`relative flex flex-col space-y-3 p-5 md:p-6 rounded-2xl border transition-colors group
                    ${feature.highlight
                      ? "border-portfolio-accent/25 bg-portfolio-accent/4 hover:border-portfolio-accent/40"
                      : "border-portfolio-border/30 bg-portfolio-card/10 hover:border-portfolio-border/60"
                    }`}
                >
                  {/* Number label */}
                  <span className="absolute top-5 right-5 text-[10px] font-mono font-bold text-portfolio-muted/30 select-none">
                    {feature.label}
                  </span>

                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shadow-sm shrink-0
                    ${feature.highlight
                      ? "border-portfolio-accent/40 bg-portfolio-accent/10 text-portfolio-accent"
                      : "border-portfolio-border/60 bg-portfolio-card text-portfolio-accent"
                    }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <h3 className="text-[14.5px] font-bold tracking-tight text-portfolio-text">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] text-portfolio-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </AuthProvider>
  );
}