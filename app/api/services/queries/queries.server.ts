import "server-only"

import type { Query } from "@/app/types/queries"
import { apiFetch } from "@/app/api/server-client"

export async function getQuery(
    id: string,
    returnTo = `/queries/${id}`,
) {
    return apiFetch<Query>(
        `/queries/${id}`,
        returnTo
    )
}
