"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiUser, FiBarChart2, FiSettings, FiLogOut } from "react-icons/fi";
import LogoutButton from "./logout-button";

export default function DashboardSidebar() {
    const { user } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { label: "Overview", href: "/dashboard", icon: FiGrid },
        { label: "Portfolio", href: "/dashboard/portfolio", icon: FiUser },
        { label: "Analytics", href: "/dashboard/analytics", icon: FiBarChart2 },
        { label: "Settings", href: "/dashboard/settings", icon: FiSettings },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-portfolio-border bg-portfolio-bg fixed top-0 bottom-0 left-0 z-30 p-6 justify-between select-none">
            <div className="space-y-8">
                {/* Branding Core */}
                <div className="px-3">
                    <span className="text-[11px] font-mono tracking-widest text-portfolio-muted/50 block uppercase">
                        Control Center
                    </span>
                    <span className="text-[20px] font-bold tracking-tight text-portfolio-text font-sans block mt-1">
                        Stackfold
                    </span>
                </div>

                {/* Navigation Track */}
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium tracking-tight transition-all duration-200 group border ${isActive
                                    ? "bg-portfolio-card border-portfolio-border text-portfolio-accent shadow-[0_4px_24px_var(--color-portfolio-glow)]"
                                    : "text-portfolio-muted/70 hover:text-portfolio-text hover:bg-portfolio-card/30 border-transparent"
                                    }`}
                            >
                                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-portfolio-accent" : "text-portfolio-muted/40 group-hover:text-portfolio-text/60"}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Footer Profile Node */}
            <div className="border-t border-portfolio-border/60 pt-4 px-2 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-portfolio-accent/10 border border-portfolio-accent/20 flex items-center justify-center font-mono text-[12px] font-bold text-portfolio-accent shrink-0">
                        {user?.email.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[13.5px] font-semibold truncate text-portfolio-text/90">{user?.email}</span>
                        <span className="text-[11px] font-mono text-portfolio-muted/40 truncate">{user?.username}</span>
                    </div>
                </div>
                
                <LogoutButton />
            </div>
        </aside>
    );
}