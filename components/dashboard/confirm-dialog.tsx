"use client";

import React, { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel = "Confirm Changes",
    cancelLabel = "Cancel",
    isLoading = false,
    onClose,
    onConfirm,
}: ConfirmDialogProps) {

    // Accessibility: Lock body scrolling when the modal dialog is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 min-h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-portfolio-card border border-portfolio-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scaleUp relative overflow-hidden"
                onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
            >
                {/* Subtle top accent alert glow line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-portfolio-accent/50 to-transparent" />

                {/* Header Alert Title Wrapper */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-portfolio-accent/10 border border-portfolio-accent/20 flex items-center justify-center shrink-0 text-portfolio-accent">
                        <FiAlertTriangle className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-[16px] font-bold text-portfolio-text tracking-tight">{title}</h3>
                </div>

                {/* Description Body Text */}
                <p className="text-[13px] text-portfolio-muted leading-relaxed">
                    {description}
                </p>

                {/* Action Controls Section */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-portfolio-border/40">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="h-8 px-4 text-[12px] font-bold text-portfolio-text bg-portfolio-bg hover:bg-portfolio-bg/80 border border-portfolio-border rounded-lg transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed select-none"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="h-8 px-4 text-[12px] font-bold text-portfolio-bg bg-portfolio-text hover:bg-portfolio-text/90 disabled:bg-portfolio-text/20 disabled:text-portfolio-text/30 rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed select-none"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-portfolio-bg border-t-transparent rounded-full animate-spin" />
                                <span>Syncing Engine...</span>
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}