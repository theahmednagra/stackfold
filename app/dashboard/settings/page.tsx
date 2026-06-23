"use client";

import ConfirmDialog from "@/components/dashboard/confirm-dialog";
import { useToast } from "@/context/toast-context";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FiUser, FiEyeOff, FiMoon, FiSun, FiActivity, FiGlobe, FiPlusCircle, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { HiOutlineCpuChip } from "react-icons/hi2";

interface SettingsState {
  username: string;
  email: string;
  theme: "default-dark" | "default-light";
  isActive: boolean;
}

export default function SettingsPage() {
  const { showToast } = useToast();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>("");
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [pendingUpdate, setPendingUpdate] = useState<Partial<SettingsState> | null>(null);
  const [dialogConfig, setDialogConfig] = useState({ title: "", description: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Check for valid data
        if (data && !data.error && data.username) {
          setSettings(data);
          setUsernameInput(data.username);
        }
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        setLoading(false); // Guarantees the spinner stops no matter what
      });
  }, []);


  const triggerMutationRequest = (fields: Partial<SettingsState>) => {
    setPendingUpdate(fields);

    if (fields.username !== undefined) {
      setDialogConfig({
        title: "Alter System Handle?",
        description: `This changes your live portfolio URL to yourdomain.com/p/${fields.username}. Old pathways will instantly stop routing.`,
      });
    } else if (fields.theme !== undefined) {
      setDialogConfig({
        title: "Switch UI Theme Layout?",
        description: "Are you sure you want to alter the default color scheme theme for your public viewers?",
      });
    } else if (fields.isActive !== undefined) {
      setDialogConfig({
        title: fields.isActive ? "Publish Portfolio Online?" : "Make Portfolio Private?",
        description: fields.isActive
          ? "This actions your portfolio showcase to go live on public discovery grids."
          : "This safely locks down access. Guest visits will return an off-grid state error page.",
      });
    }
  };

  const handleConfirmedMutation = async () => {
    if (!settings || !pendingUpdate) return;
    setActionLoading(true);

    const previousState = { ...settings };

    setSettings((prev) => (prev ? { ...prev, ...pendingUpdate } : null));
    setPendingUpdate(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingUpdate),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mutation rejected");

      showToast("success", "System settings synced successfully.");
    } catch (err: any) {
      setSettings(previousState);
      showToast("error", err.message || "Failed to update configuration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === settings?.username) return;
    triggerMutationRequest({ username: usernameInput.trim() });
  };

  // 1. ASYNC RUNTIME SKELETON LOADER
  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 space-y-6 animate-pulse pt-8">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-portfolio-card/50 rounded-lg" />
          <div className="h-4 w-64 bg-portfolio-card/50 rounded-lg" />
        </div>
        <div className="h-56 w-full bg-portfolio-card/50 border border-portfolio-border/40 rounded-2xl" />
        <div className="h-24 w-full bg-portfolio-card/50 border border-portfolio-border/40 rounded-2xl" />
        <div className="h-24 w-full bg-portfolio-card/50 border border-portfolio-border/40 rounded-2xl" />
      </div>
    );
  }

  // 2. EMPTY STATE LAYER (Profile does not exist yet)
  if (!settings) {
    return (
      <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 flex items-center justify-center min-h-[65vh] select-none">
        <div className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-xl animate-fadeIn relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-portfolio-accent/20 to-transparent" />

          <div className="w-12 h-12 rounded-xl bg-portfolio-bg border border-portfolio-border/80 flex items-center justify-center text-portfolio-muted mx-auto shadow-inner">
            <FiPlusCircle className="w-5 h-5 text-portfolio-accent" />
          </div>

          <div className="space-y-2">
            <h2 className="text-[16px] font-bold text-portfolio-text tracking-tight">Setup Your Profile First</h2>
            <p className="text-[13px] text-portfolio-muted leading-relaxed">
              Before adjusting system system parameters, routing handles, or themes, you need to create your core identity footprint data shell.
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
  if (error || !settings) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 text-center py-20">
        <div className="w-12 h-12 rounded-xl bg-red-950/20 border border-red-900/40 flex items-center justify-center mx-auto text-red-400 mb-4">
          <FiAlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-[16px] font-bold text-portfolio-text">Failed to load</h3>
        <p className="text-[13px] text-portfolio-muted mt-1 max-w-sm mx-auto">
          {error || "Failed to load active system configurations safely."}
        </p>
      </div>
    );
  }

  // 4. SECURE CONFIGURATION WORKSPACE
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4 sm:py-6 relative pb-20">

      <ConfirmDialog
        isOpen={pendingUpdate !== null}
        title={dialogConfig.title}
        description={dialogConfig.description}
        isLoading={actionLoading}
        onClose={() => setPendingUpdate(null)}
        onConfirm={handleConfirmedMutation}
      />

      <div className="border-b border-portfolio-border/60 pb-4">
        <h1 className="text-[20px] font-bold text-portfolio-text tracking-tight flex items-center gap-2.5">
          <HiOutlineCpuChip className="w-5 h-5 text-portfolio-accent" />
          <span>System Configurations</span>
        </h1>
        <p className="text-[13px] text-portfolio-muted mt-0.5">Manage your public account profile routing vectors and identity attributes.</p>
      </div>

      <div className="space-y-5">

        {/* IDENTITY MANAGEMENT CONTROL BLOCK */}
        <section className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-start sm:items-center gap-3 border-b border-portfolio-border/60 pb-4">
              <div className="w-9 h-9 rounded-xl bg-portfolio-bg border border-portfolio-border/80 flex items-center justify-center text-portfolio-muted shrink-0 shadow-inner">
                <FiUser className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-[14.5px] font-bold text-portfolio-text tracking-tight">Profile Routing Handle</h3>
                <p className="text-[12.5px] text-portfolio-muted">Customize how viewers resolve your developer directory footprint.</p>
              </div>
            </div>

            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className={`flex flex-col sm:flex-row rounded-xl overflow-hidden border transition-all bg-portfolio-bg shadow-inner focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-portfolio-card
                  ${usernameError
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20'
                    : 'border-portfolio-border focus-within:border-portfolio-accent/60 focus-within:ring-portfolio-accent/20'
                  }`}
                >
                  <span className="bg-portfolio-card/40 text-portfolio-text/40 px-3.5 py-2.5 sm:py-0 text-[13px] font-bold select-none border-b sm:border-b-0 sm:border-r border-portfolio-border/80 flex items-center font-mono">
                    {`${baseUrl}/p/`}
                  </span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUsernameInput(val);

                      const trimmed = val.trim();
                      if (trimmed === "") {
                        setUsernameError(null);
                      } else if (trimmed.length < 3) {
                        setUsernameError("Username must be at least 3 characters.");
                      } else if (trimmed.length > 20) {
                        setUsernameError("Username cannot exceed 20 characters.");
                      } else if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
                        setUsernameError("Username can only contain letters, numbers, and underscores.");
                      } else {
                        setUsernameError(null);
                      }
                    }}
                    minLength={3}
                    maxLength={20}
                    pattern="^[a-zA-Z0-9_]*$"
                    className="bg-transparent px-3.5 py-2.5 text-[13.5px] text-portfolio-text font-mono outline-none flex-1 placeholder:text-portfolio-text/20"
                    placeholder="username"
                  />
                </div>

                {usernameError && (
                  <p className="text-[11.5px] text-red-400 font-medium pl-1 animate-fadeIn">
                    {usernameError}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-portfolio-border/40 gap-3">
                <p className="text-[11.5px] text-portfolio-muted/60 font-medium order-2 sm:order-1">
                  Alphanumerics or underscores allowed.
                </p>
                <button
                  type="submit"
                  disabled={
                    usernameInput.trim() === settings.username ||
                    actionLoading ||
                    usernameError !== null
                  }
                  className="h-9 px-4 text-[12px] font-bold text-portfolio-bg bg-portfolio-text hover:bg-portfolio-text/90 disabled:bg-portfolio-text/10 disabled:text-portfolio-text/30 rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed select-none order-1 sm:order-2 w-full sm:w-auto text-center"
                >
                  Save Handle
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* THEME ENGINE SWITCH PANEL */}
        <section className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-portfolio-bg border border-portfolio-border/80 flex items-center justify-center text-portfolio-muted shrink-0 shadow-inner">
              {settings.theme === "default-dark" ? <FiMoon className="w-4.5 h-4.5" /> : <FiSun className="w-4.5 h-4.5" />}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-[14.5px] font-bold text-portfolio-text tracking-tight">Display Interface Theme</h3>
              <p className="text-[12.5px] text-portfolio-muted max-w-md">Toggle target dynamic template viewport palettes for guest nodes.</p>
            </div>
          </div>

          <div className="p-1 bg-portfolio-bg border border-portfolio-border/60 rounded-xl flex gap-1 w-full sm:w-auto shadow-inner">
            <button
              onClick={() => { if (settings.theme !== "default-dark") triggerMutationRequest({ theme: "default-dark" }); }}
              className={`h-8 flex-1 sm:flex-initial px-4 text-[11.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${settings.theme === "default-dark"
                ? "bg-portfolio-card text-portfolio-text shadow-md"
                : "text-portfolio-muted hover:text-portfolio-text"
                }`}
            >
              <FiMoon className="w-3.5 h-3.5" /> Dark
            </button>
            <button
              onClick={() => { if (settings.theme !== "default-light") triggerMutationRequest({ theme: "default-light" }); }}
              className={`h-8 flex-1 sm:flex-initial px-4 text-[11.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${settings.theme === "default-light"
                ? "bg-portfolio-card text-portfolio-text shadow-md"
                : "text-portfolio-muted hover:text-portfolio-text"
                }`}
            >
              <FiSun className="w-3.5 h-3.5" /> Light
            </button>
          </div>
        </section>

        {/* SAFETY & PORTFOLIO PRIVACY SCOPE SLIDER */}
        <section className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-portfolio-bg border border-portfolio-border/80 flex items-center justify-center text-portfolio-muted shrink-0 shadow-inner">
              {settings.isActive ? <FiGlobe className="w-4.5 h-4.5 text-portfolio-accent" /> : <FiEyeOff className="w-4.5 h-4.5" />}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-[14.5px] font-bold text-portfolio-text tracking-tight">Visibility Privacy Matrix</h3>
              <p className="text-[12.5px] text-portfolio-muted max-w-md">Control whether your showcase index routes public web traffic arrays or remains private.</p>
            </div>
          </div>

          <button
            onClick={() => triggerMutationRequest({ isActive: !settings.isActive })}
            disabled={actionLoading}
            className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors duration-300 border shrink-0 select-none cursor-pointer disabled:cursor-not-allowed ${settings.isActive
              ? "bg-portfolio-accent/10 border-portfolio-accent/40"
              : "bg-portfolio-bg border-portfolio-border"
              }`}
            aria-label="Toggle public visibility"
          >
            <div className={`w-4.5 h-4.5 rounded-full shadow-sm transition-transform duration-300 ${settings.isActive
              ? "bg-portfolio-accent translate-x-5.5"
              : "bg-portfolio-muted/60 translate-x-0"
              }`}
            />
          </button>
        </section>
      </div>
    </div>
  );
}