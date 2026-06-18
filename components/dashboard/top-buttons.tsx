"use client"

import React, { useState } from 'react'
import { FiCopy, FiCheck, FiNavigation2 } from 'react-icons/fi'
import ThemeToggleIconOnly from '../global/theme-toggle'
import Tooltip from '../global/tooltip'
import { useAuth } from '@/context/auth-context'

const TopButtons = () => {
    const { user } = useAuth();
    const username = user?.username;
    const [copied, setCopied] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const portfolioUrl = `${baseUrl}/p/${username}`

    const onCopy = async () => {
        if (!username) return;

        try {
            await navigator.clipboard.writeText(portfolioUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy URL: ", error);
        }
    }

    return (
        <div className="flex justify-end pr-6">
            <div className="flex gap-3">
                {/* Copy Link Button */}
                <Tooltip content={copied ? "Copied!" : "Copy Link"}>
                    <button
                        onClick={onCopy}
                        disabled={copied}
                        aria-label={copied ? "Copied portfolio link" : "Copy portfolio link"}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-sm
                            bg-portfolio-card border-portfolio-border/60
                            ${copied
                                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                                : 'text-portfolio-muted hover:text-portfolio-accent hover:border-portfolio-accent/60'
                            }`}
                    >
                        {copied ? (
                            <FiCheck className="w-4.25 h-4.25" />
                        ) : (
                            <FiCopy className="w-4.25 h-4.25" />
                        )}
                    </button>
                </Tooltip>

                {/* Visit Portfolio Link */}
                <Tooltip content="Visit Portfolio">
                    <a
                        href={portfolioUrl}
                        target='_blank'
                        rel="noopener noreferrer"
                        aria-label="Visit live portfolio"
                        className="w-9 h-9 rounded-xl border bg-portfolio-card border-portfolio-border/60 text-portfolio-muted hover:text-portfolio-accent hover:border-portfolio-accent/60 flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                        <FiNavigation2 className="w-4.25 h-4.25 relative left-[-0.5px] top-[-0.5px]" />
                    </a>
                </Tooltip>

                {/* Theme Toggle */}
                <ThemeToggleIconOnly />
            </div>
        </div>
    )
}

export default TopButtons
