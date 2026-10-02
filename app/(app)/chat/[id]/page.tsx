"use client"

import { getConversation } from "@/app/api/services/conversations";
import { MessageThread } from "@/app/components/chat/MessageThread";
import { useAuth } from "@/app/context/AuthContext";
import { Conversation } from "@/app/types/conversation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sendMessage as sendMessageApi } from "@/app/api/services/messages"

export default function ConversationPage() {
    const t = useTranslations('Chat')
    const { isLoading: isAuthLoading } = useAuth();
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [input, setInput] = useState("")
    const [isAwaitingAssistant, setIsAwaitingAssistant] = useState(false)

    const params = useParams()
    const conversationId = params.id as string

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchConversation = async () => {
            try {
                const data = await getConversation(conversationId)
                setConversation(data)
            } finally {
                setIsLoading(false)
            }
        }

        fetchConversation()
    }, [conversationId])

    useEffect(() => {
        if (!isAwaitingAssistant) {
            inputRef.current?.focus()
        }
    }, [isAwaitingAssistant])

    async function sendMessage() {
        const trimmedInput = input.trim()

        if (!trimmedInput) {
            return
        }

        setIsAwaitingAssistant(true)
        setInput("")

        try {
            const message = await sendMessageApi(conversationId, trimmedInput)
            setConversation((prev) => prev ? { ...prev, messages: [...prev.messages, message] } : prev)

            window.dispatchEvent(
                new CustomEvent("conversation-updated", {
                    detail: { conversationId }
                })
            )
        } catch (err) {
            console.error(t('errors.messageSendFail'), err)
        } finally {
            setIsAwaitingAssistant(false)
        }
    }

    if (isAuthLoading || isLoading || !conversation) {
        return (
            <div className="flex h-full min-w-0 flex-1 items-center justify-center bg-white text-sm text-gray-400 dark:bg-[#1c1c1c] dark:text-[#888888]">
                {t('loading')}
            </div>
        );
    }

    return (
        <div className="relative flex h-full min-w-0 flex-1 bg-white dark:bg-[#1c1c1c]">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <main className="flex min-w-0 flex-1 flex-col">
                    <MessageThread
                        messages={conversation.messages}
                        isAwaitingAssistant={isAwaitingAssistant}
                    />

                    <div className="border-t border-gray-100 p-4 dark:border-[#2e2e2e]">
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 dark:border-[#2e2e2e] dark:bg-[#161616]">
                            <input
                                ref={inputRef}
                                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#cccccc] dark:placeholder-[#555555]"
                                placeholder={
                                    isAwaitingAssistant
                                        ? t('messageWaiting')
                                        : t('messagePlaceholder')
                                }
                                value={input}
                                disabled={isAwaitingAssistant}
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
                                    !input.trim() ||
                                    isAwaitingAssistant
                                }
                                onClick={() => void sendMessage()}
                            >
                                ↑
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
