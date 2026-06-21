"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardInitialSkeleton from "@/components/dashboard/initial-skeleton";

// Define what our User object looks like
interface User {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
}

// Define everything our application can read from this Context
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();

    // The function to check session status from our "me" API
    const refreshUser = async () => {
        try {
            const response = await fetch("/api/auth/me");
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth context fetch failed:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Run the session check once when the entire app first mounts
    useEffect(() => {
        refreshUser();
    }, []);

    // Centralized Route Guard Logic
    useEffect(() => {
        if (isLoading) return;

        if (user && pathname === "/") {
            router.replace("/dashboard");
        }

        if (user && pathname.startsWith("/auth")) {
            router.replace("/dashboard");
        }

        if (!user && pathname.startsWith("/dashboard")) {
            router.replace("/auth");
        }
    }, [user, isLoading, pathname, router]);

    // Determine if we are currently in an active redirect phase to block flashing
    const isRedirecting = !isLoading && (
        (user && pathname === "/") ||
        (user && pathname.startsWith("/auth")) ||
        (!user && pathname.startsWith("/dashboard"))
    );

    return (
        <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
            {isLoading || isRedirecting ? (
                <DashboardInitialSkeleton />
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

// Custom hook to easily grab auth data inside any sub-component
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}