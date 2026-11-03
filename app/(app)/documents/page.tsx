import { getDocuments } from "@/app/api/services/documents"
import { DocumentsClientPage } from "./page.client"

type Props = {
    searchParams: Promise<{
        text?: string;
        version?: string;
        rollId?: string;
        scoregt?: string;
        scorelt?: string;
        auth?: string
    }>
}

export default async function DocumentsPage({ searchParams }: Props) {
    const params = await searchParams

    if (params.auth === "expired") {
        return <DocumentsClientPage initialDocuments={[]} />
    }

    const queryString = new URLSearchParams(
        Object.entries(params).filter(
            ([, value]) => value !== undefined
        ) as [string, string][]
    ).toString()

    const returnTo = `/documents${queryString ? `?${queryString}` : ""}`

    const documents = await getDocuments(returnTo, {
        text: params.text || undefined,
        version: Number(params.version) || undefined,
        rollId: params.rollId || undefined,
        scoreGt: Number(params.scoregt) || undefined,
        scoreLt: Number(params.scorelt) || undefined
    })

    return <DocumentsClientPage initialDocuments={documents} />
}
