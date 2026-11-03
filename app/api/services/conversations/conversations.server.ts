
import "server-only"

import type { Conversation } from "@/app/types/conversation"
import { apiFetch } from "@/app/api/server-client"

export async function getConversation(
    id: string,
    returnTo = `/chat/${id}`,
) {
    return apiFetch<Conversation>(
        `/conversations/${id}`,
        returnTo,
    )
}

export async function getConversations() {
    return apiFetch<Conversation[]>(
        `/conversations}`,
    )
}
