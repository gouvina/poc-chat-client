import { apiFetch } from "../client";
import { Document } from "@/app/types/document"

type DocumentFilters = {
    text?: string
    version?: number
    rollId?: string
    scoreGt?: number
    scoreLt?: number
}

export async function getDocuments(filters?: DocumentFilters) {
    const params = new URLSearchParams()

    if (filters?.text) params.set("text", filters.text)
    if (filters?.version !== undefined) params.set("version", `v${String(filters.version)}`)
    if (filters?.rollId) params.set("rollId", filters.rollId)
    if (filters?.scoreGt !== undefined) params.set("scoregt", String(filters.scoreGt))
    if (filters?.scoreLt !== undefined) params.set("scorelt", String(filters.scoreLt))

    const query = params.toString()

    return apiFetch<Document[]>(`/documents${query ? `?${query}` : ""}`)
}
