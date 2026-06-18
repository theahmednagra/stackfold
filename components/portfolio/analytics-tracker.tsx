"use client";

import { useEffect } from "react";

interface TrackerProps {
    ownerId: string;
}

export default function AnalyticsTracker({ ownerId }: TrackerProps) {
    useEffect(() => {
        const storageKey = `tracked_visit_${ownerId}`;
        const lastVisit = localStorage.getItem(storageKey);
        const now = Date.now();

        // 🛡️ Cooldown filter: Ignore refreshes within 4 hours
        if (lastVisit && now - parseInt(lastVisit) < 4 * 60 * 60 * 1000) {
            return;
        }

        // Record the verified visit hit
        fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ownerId }),
        })
            .then(() => localStorage.setItem(storageKey, now.toString()))
            .catch((err) => console.error("Tracking log error:", err));
    }, [ownerId]);

    return null;
}