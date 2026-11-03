import { getConversation } from "@/app/api/services/conversations/conversations.server"
import ConversationClientPage from "./page.client"
import { ApiError } from "@/app/api/client"
import { redirect } from "next/navigation"

type Props = {
    params: Promise<{
        id: string
        auth?: string
    }>
    searchParams: Promise<{
        auth?: string
    }>
}

export default async function ConversationPage({ params, searchParams }: Props) {
    const [{ id }, { auth }] = await Promise.all([params, searchParams])

    if (auth === "expired") {
        return null
    }

    try {
        const conversation = await getConversation(id)


        return (
            <ConversationClientPage
                key={id}
                initialConversation={conversation}
            />
        )
    } catch (error) {
        if (
            error instanceof ApiError &&
            [400, 404].includes(error.status)
        ) {
            redirect("/chat")
        }

        throw error
    }
}
