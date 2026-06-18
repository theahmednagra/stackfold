"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { useToast } from "@/context/toast-context";
import ConfirmDialog from "./confirm-dialog";
import Tooltip from "../global/tooltip";

export default function LogoutButton() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogoutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDialogOpen(true);
    };

    const handleConfirmLogout = async () => {
        setIsLoading(true);
        try {
            // 1. Fire your auth session termination endpoint
            const res = await fetch("/api/auth/logout", { method: "POST" });

            if (!res.ok) throw new Error("Failed to terminate session safely");

            showToast("success", "Signed out successfully.");

            // 2. Clear out client tab states and redirect back to gateway page
            router.push("/auth");
            router.refresh();
        } catch (error: any) {
            showToast("error", error.message || "An error occurred during sign out.");
            setIsDialogOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Tooltip content="Logout">
                <button
                onClick={handleLogoutClick}
                className="text-portfolio-muted/40 hover:text-portfolio-accent p-1.5 rounded-lg transition-colors cursor-pointer"
                aria-label="Sign Out"
                disabled={isLoading}
            >
                <FiLogOut className="w-4 h-4" />
            </button>
            </Tooltip>

            {/* Reusable Confirmation Dialog System Hook */}
            <ConfirmDialog
                isOpen={isDialogOpen}
                title="Sign Out of Your Account?"
                description="Are you sure you want to end your active workspace session? You will need to re-authenticate to access your dashboard settings again."
                confirmLabel="Sign Out"
                isLoading={isLoading}
                onClose={() => !isLoading && setIsDialogOpen(false)}
                onConfirm={handleConfirmLogout}
            />
        </>
    );
}