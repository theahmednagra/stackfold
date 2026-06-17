

import { redirect } from "next/navigation";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user.model";
import { Info } from "@/models/info.model";
import { Project } from "@/models/project.model";
import { Experience } from "@/models/experience.model";

export default async function DashboardPage() {

  await connectToDatabase();

  const username = "ahmed3"

  // 2. Fetch authenticated account context data safely
  const userAccount = await User.findOne({ username: username }).select("_id username");
  if (!userAccount) redirect("/login");

  // 3. Locate the relational metadata card model profile link
  const profile = await Info.findOne({ userId: userAccount._id });

  // Base numbers setup fallback if profile hasn't been instantiated yet
  let projectCount = 0;
  let experienceCount = 0;

  if (profile) {
    [projectCount, experienceCount] = await Promise.all([
      Project.countDocuments({ infoId: profile._id }),
      Experience.countDocuments({ infoId: profile._id }),
    ]);
  }

  return (
    <div className="min-h-screen bg-[#050506] text-[#f4f4f5] antialiased">
      {/* Sidebar Navigation Layout Wrapper */}
      <div className="flex h-screen overflow-hidden">

        {/* SIDEBAR BLOCK */}
        <aside className="w-64 border-r border-[#1e1e24] bg-[#0c0c0e] p-6 hidden md:flex flex-col justify-between">
          <div className="space-y-8">
            <div className="font-black tracking-tight text-lg text-blue-500">
              stackfold<span className="text-xs text-[#8e8e9f] font-mono">.panel</span>
            </div>
            <nav className="space-y-1.5 font-mono text-xs font-bold uppercase tracking-wider">
              <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#1e1e24] text-[#f4f4f5]">
                ■ Overview
              </Link>
              <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8e8e9f] hover:text-[#f4f4f5] hover:bg-[#1e1e24]/40 transition-all">
                □ Profile Data
              </Link>
              <Link href="/dashboard/projects" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8e8e9f] hover:text-[#f4f4f5] hover:bg-[#1e1e24]/40 transition-all">
                □ Manage Projects
              </Link>
              <Link href="/dashboard/experience" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8e8e9f] hover:text-[#f4f4f5] hover:bg-[#1e1e24]/40 transition-all">
                □ Career Nodes
              </Link>
            </nav>
          </div>

          {/* User Account Quick Link footer anchor */}
          <div className="pt-4 border-t border-[#1e1e24] flex items-center justify-between text-xs">
            <span className="font-mono text-[#8e8e9f]">@{userAccount.username}</span>
            <a href={`/${userAccount.username}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
              Live Site ↗
            </a>
          </div>
        </aside>

        {/* MAIN PANEL AREA */}
        <main className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-10">

          {/* TOP ADMINISTRATIVE APP HEADER WELCOME */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e1e24]/60 pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Command Center</h1>
              <p className="text-sm text-[#8e8e9f] mt-0.5">Control data points and active themes engine parameters easily.</p>
            </div>
            <Link href="/dashboard/profile" className="h-9 px-4 rounded-lg bg-blue-600 text-xs font-bold text-white flex items-center justify-center hover:bg-blue-500 transition-colors shadow-sm self-start sm:self-auto">
              Edit Live Profile
            </Link>
          </header>

          {/* DYNAMIC METRIC CARDS TRACKING ROW GRID */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 border border-[#1e1e24] bg-[#0c0c0e] rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#8e8e9f]">Active Projects</span>
              <p className="text-3xl font-black text-[#f4f4f5]">{projectCount}</p>
            </div>
            <div className="p-5 border border-[#1e1e24] bg-[#0c0c0e] rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#8e8e9f]">Timeline Nodes</span>
              <p className="text-3xl font-black text-[#f4f4f5]">{experienceCount}</p>
            </div>
            <div className="p-5 border border-[#1e1e24] bg-[#0c0c0e] rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#8e8e9f]">Theme Engine Configuration</span>
              <p className="text-sm font-mono font-bold text-emerald-400 pt-2 truncate uppercase tracking-wide">
                {profile?.theme || "default-dark"}
              </p>
            </div>
          </section>

          {/* QUICK INITIALIZATION PROFILE CHECK WARNING */}
          {!profile && (
            <div className="p-5 border border-amber-500/20 bg-amber-500/5 rounded-xl text-sm text-amber-200/80 leading-relaxed">
              <strong>Initialization Action Required:</strong> No profile configuration record dataset was located linked to this authentication instance identifier. Please navigate to the Profile Control center to synchronize data.
            </div>
          )}

        </main>
      </div>
    </div>
  );
}