import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import DashboardMobileHeader from "@/components/dashboard/mobile-header";
import { ToastProvider } from "@/context/toast-context";
import { AuthProvider } from "@/context/auth-context";
import { FiCopy, FiNavigation } from "react-icons/fi";
import ThemeToggleIconOnly from "@/components/global/theme-toggle";
import TopButtons from "@/components/dashboard/top-buttons";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (

        <AuthProvider>
            <div className="min-h-screen bg-portfolio-bg text-portfolio-text antialiased selection:bg-portfolio-accent/20 selection:text-portfolio-accent">

                {/* Structural Modular Components Layout */}
                <DashboardSidebar />
                <DashboardMobileHeader />


                {/* 🚀 MAIN WINDOW CONTENT VIEWPORT CONTAINER */}
                <ToastProvider>

                    <main className="flex-1 md:pl-64 pt-16 md:pt-0 min-w-0">
                        <div className="max-w-5xl mx-auto sm:p-4 md:p-6 lg:p-8 min-h-screen flex flex-col">
                            <TopButtons />
                            {children}
                        </div>
                    </main>
                </ToastProvider>

            </div>
        </AuthProvider>
    );
}