"use client"

import { getConversation } from "@/app/api/services/conversations";
import { MessageThread } from "@/app/components/chat/MessageThread";
import { useAuth } from "@/app/context/AuthContext";
import { Conversation } from "@/app/types/conversation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { sendMessage as sendMessageApi } from "@/app/api/services/messages"

const MAX_INPUT_LINES = 5

export default function ConversationPage() {
    const t = useTranslations('Chat')
    const { isLoading: isAuthLoading } = useAuth();
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [input, setInput] = useState("")
    const [isAwaitingAssistant, setIsAwaitingAssistant] = useState(false)
    const [inputContainerHeight, setInputContainerHeight] = useState(0)

    const params = useParams()
    const conversationId = params.id as string

    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const inputContainerRef = useCallback((element: HTMLDivElement | null) => {
        if (!element) return

        setInputContainerHeight(element.getBoundingClientRect().height)
    }, [])

    // fetch conversation
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

    // Return focus to input after message sent
    useEffect(() => {
        if (!isAwaitingAssistant) {
            inputRef.current?.focus()
        }
    }, [isAwaitingAssistant])

    // Scroll message thread to last message
    useEffect(() => {
        const container = messagesContainerRef.current

        if (!container) return

        container.scrollTop = container.scrollHeight
    }, [conversation?.messages])

    async function sendMessage() {
        const trimmedInput = input.trim()

        if (!trimmedInput) {
            return
        }

        inputRef.current?.style.setProperty("height", "auto")
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


    console.log("Input Container Height: ", inputContainerHeight)


    return (
        <div className="relative flex h-full min-w-0 flex-1 bg-white dark:bg-[#1c1c1c]">
            <div ref={messagesContainerRef} className="flex min-h-0 min-w-0 flex-1 overflow-y-auto small-scrollbar">
                <main className="mx-auto w-[60%] min-w-0">
                    <MessageThread
                        messages={conversation.messages}
                        isAwaitingAssistant={isAwaitingAssistant}
                    />
                    <div style={{ height: inputContainerHeight }} />
                </main>

                <div className="pointer-events-none absolute inset-x-0 bottom-0">
                    <div ref={inputContainerRef} className="mx-auto w-[60%] pb-4">
                        <div className="pointer-events-auto flex items-end gap-2 rounded-xl bg-[#161616] px-4 py-2">
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                disabled={isAwaitingAssistant}
                                placeholder={
                                    isAwaitingAssistant
                                        ? t('messageWaiting')
                                        : t('messagePlaceholder')
                                }
                                onChange={(e) => {
                                    setInput(e.target.value)

                                    const lineHeight = parseFloat(
                                        getComputedStyle(e.target).lineHeight
                                    )
                                    const maxHeight = lineHeight * MAX_INPUT_LINES

                                    e.target.style.height = "auto"
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, maxHeight)}px`
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        void sendMessage();
                                    }
                                }}
                                className="
                                    flex-1 resize-none mb-1
                                    bg-transparent pr-2 text-sm outline-none
                                    overflow-y-auto small-scrollbar
                                    text-gray-800 placeholder-gray-400 
                                    disabled:cursor-not-allowed disabled:opacity-60 
                                    dark:text-[#cccccc] dark:placeholder-[#555555]
                                "
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
                </div>
            </div>
        </div>
    )
}
