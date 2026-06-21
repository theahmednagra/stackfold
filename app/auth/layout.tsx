import { AuthProvider } from "@/context/auth-context";
import Navigation from "@/components/dashboard/nav";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <AuthProvider>
            <Navigation isAuthPage={true} />
            <main className="flex-1 w-full md:pl-64 pt-14 md:pt-0 min-w-0 flex flex-col min-h-screen bg-portfolio-bg">
                <div className="w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6">
                    <div className="w-full mx-auto animate-fadeIn flex flex-col justify-center">
                        {children}
                    </div>
                </div>
            </main>
        </AuthProvider>
    );
}