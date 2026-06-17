"use client";

import React, { useEffect, useState } from "react";
import ProfileInfoForm from "@/components/dashboard/profileForm";

export default function ProfilePage() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getProfile() {
            try {
                const res = await fetch("/api/profile");
                if (!res.ok) throw new Error("Failed to communicate with profile data layers.");

                const data = await res.json();
                setProfileData(data.profile);
            } catch (err: any) {
                console.error("Failed to load profile", err);
                setError(err.message || "Could not retrieve your profile configuration.");
            } finally {
                setLoading(false);
            }
        }
        getProfile();
    }, []);

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
                {/* Sleek Skeleton Loader matching your structural layout */}
                <div className="h-14 border-b border-zinc-200 pb-5">
                    <div className="h-6 w-48 bg-zinc-200 rounded mb-2" />
                    <div className="h-4 w-72 bg-zinc-100 rounded" />
                </div>
                <div className="h-96 bg-zinc-50 border border-zinc-200 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            {/* Upper Dashboard Configuration Toolbar */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Core Profile Setup</h1>
                    <p className="text-sm text-gray-500">
                        Configure your professional identity, contact entry-points, and meta headlines.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            {/* Main Wrapped Form Component Grid Container */}
            <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-1 sm:p-2 bg-zinc-50/50 border-b border-zinc-100 px-6 py-4">
                    <h3 className="text-sm font-semibold text-zinc-700">Account Identity Matrix</h3>
                </div>
                <div className="p-6">
                    {/* Pass the data cleanly down to your form component */}
                    <ProfileInfoForm initialData={profileData} />
                </div>
            </div>
        </div>
    );
}