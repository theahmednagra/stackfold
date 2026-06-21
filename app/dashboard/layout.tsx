"use client";

import { AuthProvider } from "@/context/auth-context";
import TopButtons from "@/components/dashboard/top-buttons";
import Navigation from "@/components/dashboard/nav";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <AuthProvider>
            <div className="min-h-screen w-full bg-portfolio-bg text-portfolio-text antialiased selection:bg-portfolio-accent/20 selection:text-portfolio-accent flex relative">

                {/* Left Side Dynamic Navigation Bar */}
                <Navigation />

                {/* Core Administrative Workspace Frame */}
                <main className="flex-1 w-full min-w-0 pt-14 md:pt-0 md:pl-64 flex flex-col min-h-screen">
                    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-1 flex flex-col">

                        {/* Child Node Form / Metrics Views Render Injection Point */}
                        <div className="flex-1 w-full animate-fadeIn [animation-duration:300ms]">
                            {children}
                        </div>

                    </div>
                </main>

            </div>
        </AuthProvider>
    );
}