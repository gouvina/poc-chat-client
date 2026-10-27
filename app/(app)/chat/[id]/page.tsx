import { getConversation } from "@/app/api/services/conversations/conversations.server"
import ConversationClientPage from "./page.client"

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

    const conversation = await getConversation(id)

    return (
        <ConversationClientPage
            key={id}
            initialConversation={conversation}
        />
    )
}
