"use client";

import React, { useState, useRef, useEffect } from "react";
import { BiBot } from "react-icons/bi";
import { FiCornerDownLeft, FiCode, FiCpu, FiAlertTriangle } from "react-icons/fi";

interface LocalMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    error?: boolean;
}

// ---------------------------------------------------------------------------
// MARKDOWN RENDERER
// Handles bold, italic, inline code, code blocks, headers, and bullet lists.
// Keeps raw text clean - no asterisks or backticks visible to the user.
// ---------------------------------------------------------------------------
function renderMarkdown(text: string): React.ReactNode[] {
    const lines = text.split("\n");
    const nodes: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Fenced code block
        if (line.trimStart().startsWith("```")) {
            const lang = line.replace(/```/, "").trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
                codeLines.push(lines[i]);
                i++;
            }
            nodes.push(
                <div key={i} className="my-2 rounded-lg overflow-hidden border border-portfolio-border/60">
                    {lang && (
                        <div className="px-3 py-1 bg-portfolio-card/60 text-[10px] font-mono text-portfolio-muted border-b border-portfolio-border/40 uppercase tracking-widest">
                            {lang}
                        </div>
                    )}
                    <pre className="p-3 overflow-x-auto bg-portfolio-card/30 text-[12px] font-mono text-portfolio-text/90 leading-relaxed">
                        <code>{codeLines.join("\n")}</code>
                    </pre>
                </div>
            );
            i++;
            continue;
        }

        // Heading h1
        if (line.startsWith("# ")) {
            nodes.push(
                <p key={i} className="text-[14px] sm:text-[15px] font-bold text-portfolio-text mt-3 mb-1">
                    {inlineFormat(line.slice(2))}
                </p>
            );
            i++;
            continue;
        }

        // Heading h2
        if (line.startsWith("## ")) {
            nodes.push(
                <p key={i} className="text-[13px] sm:text-[14px] font-bold text-portfolio-text mt-2.5 mb-1">
                    {inlineFormat(line.slice(3))}
                </p>
            );
            i++;
            continue;
        }

        // Heading h3
        if (line.startsWith("### ")) {
            nodes.push(
                <p key={i} className="text-[12.5px] sm:text-[13px] font-semibold text-portfolio-text mt-2 mb-0.5">
                    {inlineFormat(line.slice(4))}
                </p>
            );
            i++;
            continue;
        }

        // Bullet list item (- or *)
        if (/^[\-\*] /.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[\-\*] /.test(lines[i])) {
                items.push(lines[i].replace(/^[\-\*] /, ""));
                i++;
            }
            nodes.push(
                <ul key={i} className="my-1.5 space-y-1 pl-3">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[13px] sm:text-[13.5px] text-portfolio-text leading-relaxed">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-portfolio-accent/70 shrink-0" />
                            <span>{inlineFormat(item)}</span>
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // Numbered list
        if (/^\d+\. /.test(line)) {
            const items: string[] = [];
            let num = 1;
            while (i < lines.length && /^\d+\. /.test(lines[i])) {
                items.push(lines[i].replace(/^\d+\. /, ""));
                i++;
                num++;
            }
            nodes.push(
                <ol key={i} className="my-1.5 space-y-1 pl-3">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-[13px] sm:text-[13.5px] text-portfolio-text leading-relaxed">
                            <span className="text-[10px] font-mono text-portfolio-accent/70 shrink-0 mt-0.5 w-4 text-right">{idx + 1}.</span>
                            <span>{inlineFormat(item)}</span>
                        </li>
                    ))}
                </ol>
            );
            continue;
        }

        // Horizontal rule
        if (/^---+$/.test(line.trim())) {
            nodes.push(<hr key={i} className="my-3 border-portfolio-border/40" />);
            i++;
            continue;
        }

        // Empty line → spacing
        if (line.trim() === "") {
            nodes.push(<div key={i} className="h-1.5" />);
            i++;
            continue;
        }

        // Regular paragraph
        nodes.push(
            <p key={i} className="text-[13px] sm:text-[13.5px] text-portfolio-text leading-relaxed">
                {inlineFormat(line)}
            </p>
        );
        i++;
    }

    return nodes;
}

// Handles **bold**, *italic*, `inline code` within a single line
function inlineFormat(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    // Pattern: **bold**, *italic*, `code`
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let last = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) {
            parts.push(text.slice(last, match.index));
        }
        const token = match[0];
        if (token.startsWith("**")) {
            parts.push(<strong key={match.index} className="font-bold text-portfolio-text">{token.slice(2, -2)}</strong>);
        } else if (token.startsWith("`")) {
            parts.push(
                <code key={match.index} className="px-1.5 py-0.5 rounded bg-portfolio-card/50 border border-portfolio-border/40 text-[11.5px] font-mono text-portfolio-accent">
                    {token.slice(1, -1)}
                </code>
            );
        } else {
            parts.push(<em key={match.index} className="italic text-portfolio-text/80">{token.slice(1, -1)}</em>);
        }
        last = match.index + token.length;
    }

    if (last < text.length) parts.push(text.slice(last));
    return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

// ---------------------------------------------------------------------------
// THINKING INDICATOR
// Shown between the moment the user sends and the first token arriving.
// Cycles through realistic status phrases so it feels like the agent is working.
// ---------------------------------------------------------------------------
const THINKING_PHRASES = [
    "Reading your portfolio...",
    "Thinking...",
    "Working on it...",
    "Querying the database...",
    "Analyzing your request...",
];

function ThinkingIndicator() {
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2.5 py-0.5">
            {/* Animated dots */}
            <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-portfolio-accent/70 animate-bounce"
                        style={{ animationDelay: `${i * 200}ms` }}
                    />
                ))}
            </div>
            {/* Cycling phrase */}
            <span
                key={phraseIndex}
                className="text-[11.5px] sm:text-[12px] text-portfolio-muted font-medium animate-fadeIn"
            >
                {THINKING_PHRASES[phraseIndex]}
            </span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// QUICK LAUNCH PROMPTS
// ---------------------------------------------------------------------------
const QUICK_PROMPTS = [
    "Show me a snapshot of my entire portfolio.",
    "Rewrite my bio to sound punchy and tailored to full-stack engineering.",
    "Add a new project called Stackfold - a portfolio builder SaaS with Next.js.",
    "How many visits has my portfolio gotten this week?",
];

// ---------------------------------------------------------------------------
// PAGE COMPONENT
// ---------------------------------------------------------------------------
export default function AIAssistantPage() {
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // isThinking: true from the moment the user sends until the first token arrives.
    // Drives the "thinking" indicator that appears before any assistant message is seeded.
    const [isThinking, setIsThinking] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const quickLaunch = (command: string) => {
        if (isLoading) return;
        setInput(command);
        inputRef.current?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userPrompt = input.trim();
        setInput("");
        setIsLoading(true);
        setIsThinking(true);

        const userMessage: LocalMessage = {
            id: Date.now().toString(),
            role: "user",
            content: userPrompt,
        };

        const updatedMessages: LocalMessage[] = [...messages, userMessage];
        setMessages(updatedMessages);

        const assistantMessageId = (Date.now() + 1).toString();

        try {
            const response = await fetch("/api/copilot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            // Non-2xx response - surface a clean error message
            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                let errorMessage = "Something went wrong. Please try again.";
                if (response.status === 401) errorMessage = "Your session has expired. Please sign in again.";
                else if (response.status === 429) errorMessage = "Rate limit reached. Wait a moment before sending another message.";
                else if (response.status >= 500) errorMessage = "The server ran into an issue. Try again in a few seconds.";
                else if (errorText) errorMessage = errorText;

                setIsThinking(false);
                setMessages((prev) => [
                    ...prev,
                    { id: assistantMessageId, role: "assistant", content: errorMessage, error: true },
                ]);
                return;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                setIsThinking(false);
                setMessages((prev) => [
                    ...prev,
                    { id: assistantMessageId, role: "assistant", content: "No response stream received.", error: true },
                ]);
                return;
            }

            // First token is about to arrive - hide thinking indicator, seed message slot
            setIsThinking(false);
            setMessages((prev) => [
                ...prev,
                { id: assistantMessageId, role: "assistant", content: "" },
            ]);

            let runningText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                runningText += decoder.decode(value, { stream: true });
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantMessageId ? { ...m, content: runningText } : m
                    )
                );
            }

            // Guard: if stream ended with empty content, show fallback
            if (!runningText.trim()) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantMessageId
                            ? { ...m, content: "No response was returned. Try rephrasing your request.", error: true }
                            : m
                    )
                );
            }
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMessageId,
                    role: "assistant",
                    content: "Connection interrupted. Check your network and try again.",
                    error: true,
                },
            ]);
        } finally {
            setIsThinking(false);
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full py-4 sm:py-6 overflow-hidden">

            {/* ── HEADER ── */}
            <div className="shrink-0 pb-4 border-b border-portfolio-border/40">
                <div className="flex items-center justify-between py-1">
                    <div className="space-y-0.5">
                        <h1 className="text-[17px] sm:text-[19px] font-bold text-portfolio-text tracking-tight flex items-center gap-2">
                            <BiBot className="w-4 h-4 sm:w-5 sm:h-5 text-portfolio-accent shrink-0" />
                            <span>Copilot</span>
                        </h1>
                        <p className="text-[11.5px] sm:text-[12.5px] text-portfolio-muted leading-snug">
                            Manage your portfolio with natural language.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── SCROLLABLE CHAT AREA ── */}
            <div className="flex-1 overflow-y-auto min-h-0 pt-5 pb-20 scrollbar-none">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col justify-center max-w-lg mx-auto space-y-5 px-1 select-none">
                        <div className="space-y-1">
                            <p className="text-[12.5px] font-semibold sm:text-[13px] text-portfolio-text/90 leading-relaxed">
                                Ask anything about your portfolio, or pick a suggestion below to get started.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            {QUICK_PROMPTS.map((cmd, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => quickLaunch(cmd)}
                                    className="w-full text-left px-3.5 py-3 border border-portfolio-border/50 bg-portfolio-card/10 hover:bg-portfolio-card/30 hover:border-portfolio-accent/30 rounded-xl flex items-center justify-between gap-3 group transition-all duration-150 cursor-pointer"
                                >
                                    <span className="text-[12px] sm:text-[12.5px] font-medium text-portfolio-muted group-hover:text-portfolio-text transition-colors line-clamp-2 leading-snug">
                                        {cmd}
                                    </span>
                                    <FiCornerDownLeft className="w-3.5 h-3.5 text-portfolio-muted/30 group-hover:text-portfolio-accent transition-colors shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-7 sm:space-y-9 max-w-3xl mx-auto px-1">
                        {messages.map((message) => (
                            <div key={message.id} className="space-y-2 animate-fadeIn">
                                {/* Role label */}
                                <div className="flex items-center gap-1.5 select-none">
                                    {message.role === "user" ? (
                                        <FiCode className="w-3 h-3 text-portfolio-muted/50 shrink-0" />
                                    ) : message.error ? (
                                        <FiAlertTriangle className="w-3 h-3 text-amber-500/80 shrink-0" />
                                    ) : (
                                        <FiCpu className="w-3 h-3 text-portfolio-accent shrink-0" />
                                    )}
                                    <span className={`text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-widest ${message.role === "user"
                                        ? "text-portfolio-muted/50"
                                        : message.error
                                            ? "text-amber-500/80"
                                            : "text-portfolio-accent"
                                        }`}>
                                        {message.role === "user" ? "you" : message.error ? "error" : "copilot"}
                                    </span>
                                </div>

                                {/* Message body */}
                                <div className={`pl-3.5 border-l text-[13px] sm:text-[13.5px] leading-relaxed wrap-break-word ${message.role === "user"
                                    ? "border-portfolio-border/40 text-portfolio-text/70 font-mono"
                                    : message.error
                                        ? "border-amber-500/30 text-portfolio-muted"
                                        : "border-portfolio-accent/30 text-portfolio-text"
                                    }`}>
                                    {message.role === "user" ? (
                                        // User messages shown as plain text
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    ) : message.error ? (
                                        // Error messages shown as plain text with amber styling
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    ) : message.content === "" ? (
                                        // Streaming not started yet - pulse dots
                                        <div className="flex items-center gap-1 pt-0.5">
                                            {[0, 1, 2].map((i) => (
                                                <span
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full bg-portfolio-accent/60 animate-bounce"
                                                    style={{ animationDelay: `${i * 120}ms` }}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        // Assistant responses rendered as markdown
                                        <div className="space-y-0.5">
                                            {renderMarkdown(message.content)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Thinking indicator - shown between send and first token */}
                        {isThinking && (
                            <div className="space-y-2 animate-fadeIn">
                                <div className="flex items-center gap-1.5 select-none">
                                    <FiCpu className="w-3 h-3 text-portfolio-accent shrink-0" />
                                    <span className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-portfolio-accent">
                                        copilot
                                    </span>
                                </div>
                                <div className="pl-3.5 border-l border-portfolio-accent/30">
                                    <ThinkingIndicator />
                                </div>
                            </div>
                        )}

                        {/* Streaming indicator - shown while tokens are arriving */}
                        {isLoading && !isThinking && messages[messages.length - 1]?.role === "assistant" &&
                            messages[messages.length - 1]?.content !== "" && (
                                <div className="flex items-center gap-2 select-none pl-3.5">
                                    <FiCpu className="w-3 h-3 text-portfolio-accent animate-spin [animation-duration:3s] shrink-0" />
                                    <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-portfolio-accent/60">
                                        writing...
                                    </span>
                                </div>
                            )}
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* ── PINNED INPUT ── */}
            {/* Container Wrapper - Locked via explicit positioning boundaries to match your main viewport panel space */}
            <div className="fixed bottom-0 left-0 md:left-64 right-0 z-40 w-full md:w-[calc(100vw-16rem)] flex justify-center py-4 border-t border-portfolio-border/40 bg-portfolio-bg/95 backdrop-blur-sm px-4 sm:px-6">
                <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
                    <div className="flex rounded-xl w-full border border-portfolio-border bg-portfolio-bg shadow-inner focus-within:ring-1 focus-within:border-portfolio-accent/60 focus-within:ring-portfolio-accent/20 transition-all items-center pr-1.5 sm:pr-2">
                        <span className="bg-portfolio-card/40 text-portfolio-text/30 px-3 sm:px-4 py-3 text-[12px] sm:text-[13px] font-bold select-none border-r border-portfolio-border/80 flex items-center font-mono shrink-0">
                            $
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask anything about your portfolio..."
                            disabled={isLoading}
                            className="bg-transparent px-3 sm:px-4 py-3 text-[13px] sm:text-[13.5px] text-portfolio-text outline-none flex-1 placeholder:text-portfolio-text/20 font-medium min-w-0 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="h-7 sm:h-8 px-2.5 sm:px-4 text-[11px] font-bold text-portfolio-bg bg-portfolio-text hover:bg-portfolio-text/90 disabled:bg-portfolio-text/10 disabled:text-portfolio-text/30 rounded-lg transition-all shadow-md cursor-pointer disabled:cursor-not-allowed select-none flex items-center gap-1 shrink-0"
                        >
                            <span className="hidden sm:inline">Send</span>
                            <FiCornerDownLeft className="w-3.5 sm:w-3 h-3" />
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}