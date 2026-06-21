"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FiGrid, FiUser, FiBarChart2, FiSettings } from "react-icons/fi";
import { useAuth } from "@/context/auth-context";
import LogoutButton from "./logout-button";
import Link from "next/link";

const NAV_ITEMS = [
    { label: "Overview", href: "/dashboard", icon: FiGrid },
    { label: "Portfolio", href: "/dashboard/portfolio", icon: FiUser },
    { label: "Analytics", href: "/dashboard/analytics", icon: FiBarChart2 },
    { label: "Settings", href: "/dashboard/settings", icon: FiSettings },
];

interface NavigationProps {
    isAuthPage?: boolean;
}

export default function Navigation({ isAuthPage = false }: NavigationProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isOpen && !isAuthPage) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen, isAuthPage]);

    // Safety fallback: if it's a real dashboard environment and user state isn't active yet
    if (!user && !isAuthPage) return null;

    const NavigationLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
        <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-200 group border relative overflow-hidden ${isActive
                            ? "bg-portfolio-card border-portfolio-border text-portfolio-accent"
                            : "text-portfolio-muted/70 hover:text-portfolio-text hover:bg-portfolio-card/30 border-transparent"
                            }`}
                    >
                        {!isMobile && isActive && (
                            <div className="absolute left-0 top-2.5 bottom-2.5 w-0.75 bg-portfolio-accent rounded-r-full" />
                        )}
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-portfolio-accent" : "text-portfolio-muted/40 group-hover:text-portfolio-text/70"}`} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );

    const ProfileFooter = () => (
        <div className="border-t border-portfolio-border/60 pt-4 px-1.5 flex items-center justify-between gap-2 bg-portfolio-bg/50">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-portfolio-accent/10 border border-portfolio-accent/20 flex items-center justify-center font-mono text-[11px] font-bold text-portfolio-accent shrink-0 shadow-inner">
                    {user?.email?.slice(0, 1).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col min-w-0 space-y-0.5">
                    <span className="text-[12.5px] font-bold truncate text-portfolio-text tracking-tight">{user?.email}</span>
                    <span className="text-[10px] font-mono text-portfolio-muted/50 truncate">@{user?.username}</span>
                </div>
            </div>
            <LogoutButton />
        </div>
    );

    return (
        <>
            {/* 1. TOP MOBILE HEADER LAYER */}
            <header className="md:hidden w-full h-14 border-b border-portfolio-border/60 bg-portfolio-bg/80 backdrop-blur-md fixed top-0 left-0 right-0 z-40 px-4 flex items-center justify-between select-none">
                <Link
                    href="/dashboard"
                    className="font-black tracking-tight text-portfolio-text"
                >
                    Stackfold
                </Link>
                {!isAuthPage && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-portfolio-text p-1.5 hover:bg-portfolio-card border border-transparent hover:border-portfolio-border/40 rounded-lg transition-all cursor-pointer flex items-center justify-center w-8 h-8"
                        aria-label="Toggle Navigation Hub Menu"
                    >
                        <div className="flex flex-col gap-1 w-4.5 items-center justify-center">
                            <span className={`h-0.5 w-full bg-portfolio-text rounded-full transition-all duration-300 origin-center ${isOpen ? "rotate-45 translate-y-0.75" : ""}`} />
                            <span className={`h-0.5 w-full bg-portfolio-text rounded-full transition-all duration-300 origin-center ${isOpen ? "-rotate-45 -translate-y-0.75" : ""}`} />
                        </div>
                    </button>
                )}
            </header>

            {/* 2. MOBILE DRAWER OVERLAY */}
            {!isAuthPage && (
                <div className={`fixed inset-0 z-30 md:hidden ${isOpen ? "visible" : "invisible delay-300 pointer-events-none"}`}>
                    <div
                        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"}`}
                        onClick={() => setIsOpen(false)}
                    />
                    <aside className={`absolute top-0 bottom-0 left-0 w-64 bg-portfolio-bg border-r border-portfolio-border p-5 pt-20 flex flex-col justify-between transition-transform duration-300 ease-out transform will-change-transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        <NavigationLinks isMobile />
                        <ProfileFooter />
                    </aside>
                </div>
            )}

            {/* 3. DESKTOP SIDEBAR */}
            <aside className="hidden md:flex flex-col w-64 border-r border-portfolio-border/60 bg-portfolio-bg fixed top-0 bottom-0 left-0 z-30 p-5 justify-between select-none">
                <div className="space-y-7">
                    <div className="px-3 pt-2">
                        <span className="text-[10px] font-mono tracking-[0.2em] text-portfolio-muted/40 block uppercase">
                            Control Center
                        </span>
                        <Link
                            href="/dashboard"
                            className="text-[18px] font-black tracking-tight text-portfolio-text block mt-1"
                        >
                            Stackfold
                        </Link>
                    </div>
                    {!isAuthPage && <NavigationLinks />}
                </div>
                {!isAuthPage && <ProfileFooter />}
            </aside>
        </>
    );
}