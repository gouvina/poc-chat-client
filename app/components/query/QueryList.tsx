"use client"

import { getQueries } from "@/app/api/services/queries"
import { useAuth } from "@/app/context/AuthContext"
import { Query } from "@/app/types/queries"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ScrollingText } from "../layout/ScrollingText"

export function QueryList() {
    const t = useTranslations('Query')
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAuthenticated } = useAuth();

    const [queries, setQueries] = useState<Query[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchQueries = async () => {
            if (!user || !isAuthenticated) return

            try {
                const data = await getQueries(user.id)
                setQueries(data)
            } finally {
                setIsLoading(false)
            }
        }

        fetchQueries()
    }, [user, isAuthenticated])

    const handleNewQuery = () => {
        router.push("/queries")
    }

    const handleSelectQuery = (queryId: string) => {
        router.push(`/queries/${queryId}`)
    }

    const sortedQueries = [...queries].sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <button
                type="button"
                onClick={handleNewQuery}
                className="
                    mb-3 flex w-full shrink-0 items-center
                    rounded-lg px-3 py-2
                    text-sm text-gray-700
                    transition-colors
                    hover:bg-gray-100
                    dark:text-[#cccccc]
                    dark:hover:bg-[#222222]
                "
            >
                <span className="mr-2 text-base leading-none">+</span>
                {t('newQuery')}
            </button>

            <p className="mb-1 mt-2 px-1 text-xs text-gray-400 dark:text-[#666666]">
                Recents{/* {t('recents')} */}
            </p>

            <div className="min-h-0 flex-1 overflow-y-auto small-scrollbar">
                {isLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-400">
                        {t('loading')}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {sortedQueries.map((query) => (
                            <button
                                key={query.id}
                                type="button"
                                onClick={() => handleSelectQuery(query.id)}
                                className={`
                                    w-full rounded-lg px-3 py-2
                                    text-left text-sm
                                    transition-colors
                                    ${pathname === `/queries/${query.id}`
                                        ? "bg-gray-100 text-gray-900 dark:bg-[#222222] dark:text-[#eeeeee]"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-[#aaaaaa] dark:hover:bg-[#222222] dark:hover:text-[#dddddd]"
                                    }
                                `}
                            >
                                <ScrollingText>
                                    {query.question}
                                </ScrollingText>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}