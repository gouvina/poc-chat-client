"use client"

import { createQuery } from "@/app/api/services/queries";
import { QueryInput } from "@/app/components/query/QueryInput";
import { useAuth } from "@/app/context/AuthContext";
import { sectionRoutes } from "@/app/types/app";
import { useRouter } from "next/navigation";

export default function QueryPage() {
    const { user } = useAuth()
    const router = useRouter()

    const onSubmit = async (question: string, keywords: string[]) => {
        if (!user) return

        const createQueryUser = { id: user.id, email: user.email }

        try {
            const data = await createQuery(createQueryUser, question, keywords)
            sessionStorage.setItem("new-query", JSON.stringify({ id: data.id, question, keywords }))

            router.push(`${sectionRoutes.queries}/${data.id}`)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-[#1c1c1c]">
            <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 py-6">
                <div className="flex w-full max-w-2xl flex-1 flex-col justify-center">
                    <QueryInput onSubmit={onSubmit} />
                </div>
            </main>
        </div>
    )
}