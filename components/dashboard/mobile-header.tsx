"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiUser, FiBarChart2, FiSettings, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/auth-context";
import LogoutButton from "./logout-button";

export default function DashboardMobileHeader() {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const navItems = [
        { label: "Overview", href: "/dashboard", icon: FiGrid },
        { label: "Portfolio", href: "/dashboard/portfolio", icon: FiUser },
        { label: "Analytics", href: "/dashboard/analytics", icon: FiBarChart2 },
        { label: "Settings", href: "/dashboard/settings", icon: FiSettings },
    ];

    return (
        <>
            <div className="md:hidden w-full h-16 border-b border-portfolio-border bg-portfolio-bg fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between select-none">
                <span className="text-[16px] font-bold tracking-tight text-portfolio-accent font-sans">
                    Stackfold
                </span>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-portfolio-text p-1 hover:bg-portfolio-card rounded-lg transition-colors cursor-pointer"
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                </button>
            </div>

            <div className={`fixed inset-0 z-30 md:hidden transition-all duration-300 ${isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}>
                <div className={`absolute inset-0 bg-[#030303]/60 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsOpen(false)} />
                <aside className={`absolute top-0 bottom-0 left-0 w-64 bg-[#070707] border-r border-portfolio-border p-6 pt-24 flex flex-col justify-between transition-transform duration-300 ease-out transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium border transition-all duration-200 ${isActive ? "bg-portfolio-card border-portfolio-border text-portfolio-accent" : "text-portfolio-muted/70 border-transparent active:bg-portfolio-card/30"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

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
            </div>
        </>
    );
}