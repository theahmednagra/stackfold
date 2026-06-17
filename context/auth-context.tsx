"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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

        // If user IS logged in, and tries to visit the auth page -> push them away to dashboard
        if (user && pathname.startsWith("/auth")) {
            router.replace("/dashboard");
        }

        // If user is NOT logged in, and tries to visit a protected dashboard path -> push them to auth
        if (!user && pathname.startsWith("/dashboard")) {
            router.replace("/auth");
        }
    }, [user, isLoading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
            {/* Show a clean global loading screen while verifying the initial cookie state */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
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