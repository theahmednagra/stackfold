"use client";

import ConfirmDialog from "@/components/dashboard/confirm-dialog";
import { useToast } from "@/context/toast-context";
import React, { useState, useEffect } from "react";
import { FiUser, FiEye, FiEyeOff, FiMoon, FiSun, FiActivity, FiGlobe } from "react-icons/fi";

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
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [pendingUpdate, setPendingUpdate] = useState<Partial<SettingsState> | null>(null);
  const [dialogConfig, setDialogConfig] = useState({ title: "", description: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings(data);
          setUsernameInput(data.username);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-pulse pt-8">
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

  if (!settings) return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4 sm:p-6 relative pb-20">

      {/* Premium Reusable Intercept Confirmation Firewall Dialog */}
      <ConfirmDialog
        isOpen={pendingUpdate !== null}
        title={dialogConfig.title}
        description={dialogConfig.description}
        isLoading={actionLoading}
        onClose={() => setPendingUpdate(null)}
        onConfirm={handleConfirmedMutation}
      />

      {/* Header Profile Title Panel Area */}
      <div className="border-b border-portfolio-border/60 pb-4">
        <h1 className="text-[20px] font-bold text-portfolio-text tracking-tight flex items-center gap-2.5">
          <FiActivity className="w-5 h-5 text-portfolio-accent" />
          <span>System Configurations</span>
        </h1>
        <p className="text-[13px] text-portfolio-muted mt-0.5">Manage your public account profile routing vectors and identity attributes.</p>
      </div>

      <div className="space-y-5">

        {/* 1. IDENTITY MANAGEMENT CONTROL BLOCK */}
        <section className="bg-portfolio-card border border-portfolio-border/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-portfolio-border/60 pb-4">
              <div className="w-9 h-9 rounded-xl bg-portfolio-bg border border-portfolio-border/80 flex items-center justify-center text-portfolio-muted shadow-inner">
                <FiUser className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-[14.5px] font-bold text-portfolio-text tracking-tight">Profile Routing Handle</h3>
                <p className="text-[12.5px] text-portfolio-muted">Customize how viewers resolve your developer directory footprint.</p>
              </div>
            </div>

            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className={`flex rounded-xl overflow-hidden border transition-all bg-portfolio-bg group shadow-inner focus-within:ring-1
                  ${usernameError
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/30'
                    : 'border-portfolio-border focus-within:border-portfolio-accent/60 focus-within:ring-portfolio-accent/30'
                  }`}
                >
                  <span className="bg-portfolio-card/40 text-portfolio-text/40 px-3.5 py-2.5 text-[13px] font-bold select-none border-r border-portfolio-border/80 flex items-center font-mono">
                    {`${baseUrl}/p/`}
                  </span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUsernameInput(val);

                      // Real-time client side validation loop matching your Zod configuration
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
                    // Native browser validation hooks supporting schema limits
                    minLength={3}
                    maxLength={20}
                    pattern="^[a-zA-Z0-9_]*$"
                    className="bg-transparent px-3.5 py-2.5 text-[13.5px] text-portfolio-text font-mono outline-none w-full placeholder:text-portfolio-text/20"
                    placeholder="username"
                  />
                </div>

                {/* Real-time Inline Error Validation Message Banner */}
                {usernameError && (
                  <p className="text-[11.5px] text-red-400 font-medium pl-1 animate-fadeIn">
                    {usernameError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-portfolio-border/40 gap-4">
                <p className="text-[11.5px] text-portfolio-muted/60 font-medium">
                  Alphanumerics or underscores allowed.
                </p>
                <button
                  type="submit"
                  disabled={
                    usernameInput.trim() === settings.username ||
                    actionLoading ||
                    usernameError !== null
                  }
                  className="h-8 px-4 text-[12px] font-bold text-portfolio-bg bg-portfolio-text hover:bg-portfolio-text/90 disabled:bg-portfolio-text/20 disabled:text-portfolio-text/30 rounded-lg transition-all shadow-md cursor-pointer disabled:cursor-not-allowed select-none"
                >
                  Save Handle
                </button>
              </div>
            </form>

          </div>
        </section>

        {/* 2. THEME ENGINE SWITCH PANEL */}
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

          <div className="p-1 bg-portfolio-bg border border-portfolio-border/60 rounded-xl flex gap-1 self-start sm:self-auto shadow-inner">
            <button
              onClick={() => { if (settings.theme !== "default-dark") triggerMutationRequest({ theme: "default-dark" }); }}
              className={`h-7 px-3 text-[11.5px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${settings.theme === "default-dark"
                ? "bg-portfolio-card text-portfolio-text shadow-md border border-portfolio-border/40"
                : "text-portfolio-muted hover:text-portfolio-text"
                }`}
            >
              <FiMoon className="w-3.5 h-3.5" /> Dark
            </button>
            <button
              onClick={() => { if (settings.theme !== "default-light") triggerMutationRequest({ theme: "default-light" }); }}
              className={`h-7 px-3 text-[11.5px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${settings.theme === "default-light"
                ? "bg-portfolio-card text-portfolio-text shadow-md border border-portfolio-border/40"
                : "text-portfolio-muted hover:text-portfolio-text"
                }`}
            >
              <FiSun className="w-3.5 h-3.5" /> Light
            </button>
          </div>
        </section>

        {/* 3. SAFETY & PORTFOLIO PRIVACY SCOPE SLIDER */}
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
            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 border shrink-0 select-none cursor-pointer disabled:cursor-not-allowed ${settings.isActive
              ? "bg-portfolio-accent/10 border-portfolio-accent/40 justify-end"
              : "bg-portfolio-bg border-portfolio-border justify-start"
              }`}
          >
            <div className={`w-4 h-4 rounded-full shadow-md transition-all duration-300 ${settings.isActive ? "bg-portfolio-accent" : "bg-portfolio-muted/60"
              }`} />
          </button>
        </section>

      </div>
    </div>
  );
}