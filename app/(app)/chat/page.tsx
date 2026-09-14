"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConversationContext } from "../../context/ConversationContext";
import { MessageThread } from "../../components/chat/MessageThread";
import { LoginModal } from "../../components/auth/LoginModal";

export default function ChatPage() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const {
        isLoading,
        messages,
        isAwaitingAssistant,
        input,
        setInput,
        sendMessage,
    } = useConversationContext();

    const messageInputRef = useRef<HTMLInputElement>(null);
    const prevAwaitingAssistant = useRef(isAwaitingAssistant);

    useEffect(() => {
        const wasAwaiting = prevAwaitingAssistant.current;
        prevAwaitingAssistant.current = isAwaitingAssistant;

        if (!wasAwaiting || isAwaitingAssistant) return;

        queueMicrotask(() => {
            messageInputRef.current?.focus();
        });
    }, [isAwaitingAssistant]);

    if (isAuthLoading) {
        return (
            <div className="flex h-full min-w-0 flex-1 items-center justify-center bg-white text-sm text-gray-400 dark:bg-[#1c1c1c] dark:text-[#888888]">
                Loading…
            </div>
        );
    }

    const isChatDisabled = !isAuthenticated;

    return (
        <div className="relative flex h-full min-w-0 flex-1 bg-white dark:bg-[#1c1c1c]">
            <div
                className={`flex min-h-0 min-w-0 flex-1 flex-col ${isChatDisabled
                    ? "pointer-events-none select-none blur-sm"
                    : ""
                    }`}
                aria-hidden={isChatDisabled}
            >
                <main className="flex min-w-0 flex-1 flex-col">
                    {isLoading ? (
                        <div className="flex flex-1 items-center justify-center text-sm text-gray-400 dark:text-[#888888]">
                            Loading conversations…
                        </div>
                    ) : (
                        <MessageThread
                            messages={messages}
                            isAwaitingAssistant={isAwaitingAssistant}
                        />
                    )}

                    <div className="border-t border-gray-100 p-4 dark:border-[#2e2e2e]">
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 dark:border-[#2e2e2e] dark:bg-[#161616]">
                            <input
                                ref={messageInputRef}
                                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#cccccc] dark:placeholder-[#555555]"
                                placeholder={
                                    isAwaitingAssistant
                                        ? "Waiting for reply…"
                                        : "Type a message..."
                                }
                                value={input}
                                disabled={isLoading || isChatDisabled}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        void sendMessage();
                                    }
                                }}
                            />

                            <button
                                className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:opacity-40 dark:bg-[#444444] dark:text-[#cccccc] dark:hover:bg-[#4a4a4a]"
                                disabled={
                                    isLoading ||
                                    !input.trim() ||
                                    isAwaitingAssistant ||
                                    isChatDisabled
                                }
                                onClick={() => void sendMessage()}
                            >
                                ↑
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {isChatDisabled ? <LoginModal /> : null}
        </div>
    );
}