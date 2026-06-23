"use client";

import React, { useState, useRef, useEffect } from "react";
import { BiBot } from "react-icons/bi";
import { FiCornerDownLeft, FiCode, FiCpu } from "react-icons/fi";

interface LocalMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const quickLaunch = (command: string) => {
        if (isLoading) return;
        setInput(command);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userPrompt = input.trim();
        setInput("");
        setIsLoading(true);

        const updatedMessages: LocalMessage[] = [
            ...messages,
            { id: Date.now().toString(), role: "user", content: userPrompt }
        ];
        setMessages(updatedMessages);

        try {
            const response = await fetch("/api/copilot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) }),
            });

            if (!response.ok) throw new Error("Stream dropped.");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) return;

            const assistantMessageId = (Date.now() + 1).toString();
            setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);

            let runningText = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                runningText += decoder.decode(value, { stream: true });

                setMessages((prev) =>
                    prev.map((m) => m.id === assistantMessageId ? { ...m, content: runningText } : m)
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto h-full flex flex-col justify-between relative overflow-hidden py-4 sm:py-6">

            {/* ── HEADER ── */}
            <div className="pb-4 border-b border-portfolio-border/40 shrink-0 bg-portfolio-bg z-20">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h1 className="text-[18px] sm:text-[20px] font-bold text-portfolio-text tracking-tight flex items-center gap-2.5">
                            <BiBot className="w-4 h-4 sm:w-5 sm:h-5 text-portfolio-accent" />
                            <span>Copilot Engine</span>
                        </h1>
                        <p className="text-[12px] sm:text-[13px] text-portfolio-muted mt-0.5">
                            Execute mutations against production graphs using natural inputs.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── CONTENT CANVAS ── */}
            <div className="flex-1 overflow-y-auto py-4 sm:py-8 space-y-6 sm:space-y-8 scrollbar-none min-h-0">
                {messages.length === 0 ? (
                    /* Locked empty state dimensions to perfectly block micro-scrolling layout drift */
                    <div className="h-full w-full flex flex-col justify-center max-w-xl mx-auto space-y-5 sm:space-y-6 select-none animate-fadeIn overflow-hidden">
                        <div className="space-y-1 sm:space-y-2">
                            <h2 className="text-[15px] sm:text-[16px] font-bold text-portfolio-text tracking-tight">
                                Active Core Execution Thread
                            </h2>
                            <p className="text-[12.5px] sm:text-[13px] text-portfolio-muted leading-relaxed">
                                No active layout instructions loaded. Supply a prompt below or trigger a quick macro launch sequence.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            {[
                                "Rewrite my portfolio biography statement to be highly punchy and tailored to full-stack web engineering.",
                                "Append a live deployment project node named Stackfold highlighting Next.js and tool-calling mechanics."
                            ].map((cmd, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => quickLaunch(cmd)}
                                    className="w-full text-left p-3 sm:p-3.5 border border-portfolio-border/50 bg-portfolio-card/10 hover:bg-portfolio-card/30 hover:border-portfolio-accent/30 rounded-xl flex items-center justify-between group transition-all duration-200 cursor-pointer text-ellipsis overflow-hidden"
                                >
                                    <span className="text-[12px] sm:text-[12.5px] font-medium text-portfolio-muted group-hover:text-portfolio-text transition-colors truncate pr-4">
                                        {cmd}
                                    </span>
                                    <FiCornerDownLeft className="w-3.5 h-3.5 text-portfolio-muted/30 group-hover:text-portfolio-accent transition-colors shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
                        {messages.map((message) => (
                            <div key={message.id} className="space-y-2 animate-fadeIn">
                                <div className="flex items-center gap-2 select-none">
                                    {message.role === "user" ? (
                                        <FiCode className="w-3.5 h-3.5 text-portfolio-muted/50" />
                                    ) : (
                                        <FiCpu className="w-3.5 h-3.5 text-portfolio-accent" />
                                    )}
                                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${message.role === "user" ? "text-portfolio-muted/50" : "text-portfolio-accent"
                                        }`}>
                                        {message.role === "user" ? "dev_input" : "system_output"}
                                    </span>
                                </div>

                                <div className={`text-[13px] sm:text-[13.5px] font-medium leading-relaxed wrap-break-word whitespace-pre-wrap pl-3.5 border-l ${message.role === "user" ? "border-portfolio-border/40 text-portfolio-text/70 font-mono" : "border-portfolio-accent/30 text-portfolio-text"
                                    }`}>
                                    {message.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Streaming Operational Pipeline State Indicator */}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="max-w-3xl mx-auto flex items-center gap-2 select-none pt-1 pl-3.5 animate-pulse">
                        <FiCpu className="w-3.5 h-3.5 text-portfolio-accent animate-spin [animation-duration:3s]" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-portfolio-accent">
                            streaming_graph_tokens...
                        </span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* ── PINNED INPUT TERMINAL ── */}
            <footer className="pb-4 pt-3 shrink-0 bg-portfolio-bg border-t border-portfolio-border/40 z-20">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="flex rounded-xl border border-portfolio-border bg-portfolio-bg shadow-inner focus-within:ring-1 focus-within:border-portfolio-accent/60 focus-within:ring-portfolio-accent/20 transition-all items-center pr-1.5 sm:pr-2">
                        <span className="bg-portfolio-card/40 text-portfolio-text/30 px-3 sm:px-4 py-3 text-[12px] sm:text-[13px] font-bold select-none border-r border-portfolio-border/80 flex items-center font-mono">
                            $
                        </span>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Query matrix parameters or code additions..."
                            disabled={isLoading}
                            className="bg-transparent px-3 sm:px-4 py-3 text-[13px] sm:text-[13.5px] text-portfolio-text outline-none flex-1 placeholder:text-portfolio-text/20 font-medium min-w-0"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="h-7 sm:h-8 px-2.5 sm:px-4 text-[11px] font-bold text-portfolio-bg bg-portfolio-text hover:bg-portfolio-text/90 disabled:bg-portfolio-text/10 disabled:text-portfolio-text/30 rounded-lg transition-all shadow-md cursor-pointer disabled:cursor-not-allowed select-none flex items-center gap-1 shrink-0"
                        >
                            <span className="hidden sm:inline">Execute</span>
                            <FiCornerDownLeft className="w-3.5 sm:w-3 h-3" />
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
}