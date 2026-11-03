import { getQuery } from "@/app/api/services/queries/queries.server"
import QueryClientPage from "./page.client"
import { ApiError } from "@/app/api/client"
import { redirect } from "next/navigation"

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ auth?: string }>
}

export default async function QueryPage({ params, searchParams }: Props) {
    const [{ id }, { auth }] = await Promise.all([params, searchParams])

    if (auth === "expired") {
        return null
    }

    try {
        const query = await getQuery(id)

        return (
            <QueryClientPage
                key={id}
                initialQuery={query}
            />
        )
    } catch (error) {
        if (
            error instanceof ApiError &&
            [400, 404].includes(error.status)
        ) {
            redirect("/queries")
        }
    }
}
