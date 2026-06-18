"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiLayers } from "react-icons/fi";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    timestamp: number;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);
const TOAST_DURATION = 4000;
const MAX_VISIBLE = 4;

// 1. TOAST NODE (GRAVITY DROP WITH MICRO-TILT) 
function ToastNode({
    toast,
    index,
    totalCount,
    onDismiss,
}: {
    toast: Toast;
    index: number;
    totalCount: number;
    onDismiss: (id: string) => void;
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [barWidth, setBarWidth] = useState("100%");

    const triggerExit = useCallback(() => {
        setIsExiting(true);
        // Matches the fast gravity-drop timeline window exactly
        setTimeout(() => onDismiss(toast.id), 220);
    }, [toast.id, onDismiss]);

    useEffect(() => {
        const animationFrame = requestAnimationFrame(() => {
            setBarWidth("0%");
        });
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    useEffect(() => {
        if (isHovered || isExiting) return;
        const timer = setTimeout(triggerExit, TOAST_DURATION);
        return () => clearTimeout(timer);
    }, [isHovered, isExiting, triggerExit]);

    const isStackedHidden = totalCount > MAX_VISIBLE && index < totalCount - MAX_VISIBLE;
    const distanceFromTopVisible = totalCount - 1 - index;

    const transformStyle = isStackedHidden
        ? "scale(0.8) translateY(24px)"
        : `scale(${1 - distanceFromTopVisible * 0.035}) translateY(${distanceFromTopVisible * 8}px)`;

    return (
        <div
            role="status"
            aria-live="polite"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                transform: isExiting ? undefined : transformStyle,
                zIndex: index + 10,
                opacity: isStackedHidden ? 0 : 1,
            }}
            className={`pointer-events-auto flex flex-col w-full max-w-87.5 bg-portfolio-card/95 backdrop-blur-md border border-portfolio-border/60 rounded-xl shadow-2xl origin-bottom relative overflow-hidden group 
        ${isStackedHidden ? "pointer-events-none touch-none" : ""}
        
        /* 🚀 Tight Spring Entrance */
        ${!isExiting ? "animate-[toastIn_380ms_cubic-bezier(0.34,1.56,0.64,1)_forwards] transition-all duration-380 cubic-bezier-[0.34,1.56,0.64,1]" : ""}
        
        /* 📉 High-End Gravity Drop + Micro-Skew Exit */
        ${isExiting ? "animate-[toastOut_220ms_cubic-bezier(0.32,0,0.67,0)_forwards]" : "max-h-30"}
      `}
        >
            <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                <div className="flex items-start gap-2.5 pl-0.5">
                    <div className={`shrink-0 mt-0.5 text-[15px] ${toast.type === "success" ? "text-emerald-400" :
                        toast.type === "error" ? "text-rose-400" : "text-portfolio-accent"
                        }`}>
                        {toast.type === "success" && <FiCheckCircle />}
                        {toast.type === "error" && <FiAlertCircle />}
                        {toast.type === "info" && <FiInfo />}
                    </div>
                    <span className="text-portfolio-text text-[13px] font-medium leading-relaxed tracking-tight wrap-break-word pr-2 select-none">
                        {toast.message}
                    </span>
                </div>

                <button
                    onClick={triggerExit}
                    aria-label="Dismiss message"
                    className="text-portfolio-muted/40 hover:text-portfolio-text hover:scale-105 active:scale-95 transition-all duration-200 p-1 rounded-md hover:bg-portfolio-bg cursor-pointer shrink-0"
                >
                    <FiX className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* ⏳ Smooth Base-anchored Progress Tracker */}
            <div className="w-full h-[2.5px] bg-portfolio-bg mt-auto overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                <div
                    className={`h-full origin-left ${toast.type === "success" ? "bg-emerald-500" :
                        toast.type === "error" ? "bg-rose-500" : "bg-portfolio-accent"
                        }`}
                    style={{
                        width: isExiting ? "0%" : isHovered ? "100%" : barWidth,
                        transition: isExiting
                            ? "width 160ms ease-in"
                            : isHovered
                                ? "none"
                                : `width ${TOAST_DURATION}ms linear`
                    }}
                />
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                        2. MAIN CONTEXT PROVIDER LAYER                      */
/* -------------------------------------------------------------------------- */
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const clearAll = useCallback(() => setToasts([]), []);

    const showToast = useCallback((type: ToastType, message: string) => {
        const now = Date.now();
        setToasts((prev) => {
            if (prev.some((t) => t.message === message && t.type === type && now - t.timestamp < 800)) return prev;
            return [...prev, { id: crypto.randomUUID(), type, message, timestamp: now }];
        });
    }, []);

    const totalToastsCount = toasts.length;
    const overflowCount = totalToastsCount - MAX_VISIBLE;

    return (
        <ToastContext.Provider value={{ showToast, removeToast, clearAll }}>
            {children}

            {/* 🛠️ OPTIMIZED FRAME POSITIONING: Moved right into the corner (bottom-3 right-3) */}
            <div
                aria-label="Notifications System Overlay"
                className="fixed bottom-3 right-3 z-100 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none items-end preserve-3d p-4 pr-1 pl-12 pb-12"
            >
                {overflowCount > 0 && (
                    <div className="px-2.5 py-1 mb-1 rounded-full bg-portfolio-bg/80 border border-portfolio-border backdrop-blur-md text-[10px] font-mono font-bold text-portfolio-muted flex items-center gap-1.5 shadow-md pointer-events-auto select-none animate-[toastIn_300ms_cubic-bezier(0.34,1.56,0.64,1)]">
                        <FiLayers className="w-3 h-3 text-portfolio-accent animate-pulse" />
                        <span>+{overflowCount} MORE ACTIONS COLLAPSED</span>
                    </div>
                )}

                <div className="w-full relative flex flex-col gap-2.5 items-end justify-end min-h-15">
                    {toasts.map((toast, index) => (
                        <ToastNode
                            key={toast.id}
                            toast={toast}
                            index={index}
                            totalCount={totalToastsCount}
                            onDismiss={removeToast}
                        />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be wrapped inside a <ToastProvider /> Node.");
    return context;
}