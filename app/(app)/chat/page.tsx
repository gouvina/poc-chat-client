"use client"

import { createConversation } from "@/app/api/services/conversations"
import { useAuth } from "@/app/context/AuthContext"
import { SenderType } from "@/app/types/message"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ChatPage() {
    const t = useTranslations('Chat')
    const router = useRouter()
    const { user, isLoading: isAuthLoading } = useAuth()

    const [input, setInput] = useState("")
    const [isSending, setIsSending] = useState(false)

    async function sendMessage() {
        const trimmedInput = input.trim()

        if (!trimmedInput || !user || isSending) {
            return
        }

        setIsSending(true)

        const createConversationUser = { id: user.id, email: user.email }

        try {
            const conversation = await createConversation(
                createConversationUser,
                trimmedInput,
                { content: trimmedInput, sender: SenderType.USER }
            )

            router.push(`/chat/${conversation.id}`)
        } catch (err) {
            console.error(t("errors.messageSendFail"), err)
            setIsSending(false)
        }
    }

    if (isAuthLoading) {
        return (
            <div className="flex h-full min-w-0 flex-1 items-center justify-center bg-white text-sm text-gray-400 dark:bg-[#1c1c1c] dark:text-[#888888]">
                {t('loading')}
            </div>
        )
    }

    return (
        <div className="flex h-full min-w-0 flex-1 items-center justify-center bg-white dark:bg-[#1c1c1c]">
            <div className="w-full max-w-2xl px-6">
                <div className="
                    flex items-center gap-2
                    rounded-2xl border border-gray-200
                    bg-gray-50 px-4 py-3
                    dark:border-[#2e2e2e] dark:bg-[#222222]
                ">
                    <input
                        className="
                            flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 
                            disabled:cursor-not-allowed disabled:opacity-60 
                            dark:text-[#cccccc] dark:placeholder-[#555555]
                        "
                        placeholder={t('messagePlaceholder')}
                        value={input}
                        disabled={isSending}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                void sendMessage()
                            }
                        }}
                    />

                    <button
                        type="button"
                        className="
                            flex items-center justify-center
                            rounded-full w-9 h-9 text-sm text-white
                            bg-blue-500 hover:bg-blue-600 
                            disabled:opacity-40 disabled:hover:bg-blue-500 disabled:cursor-not-allowed
                        "
                        disabled={!input.trim() || isSending}
                        onClick={sendMessage}
                    >
                        <span className="-translate-y-0.5">↑</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
