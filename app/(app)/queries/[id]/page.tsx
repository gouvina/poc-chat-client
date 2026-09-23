"use client"

import { getQuery } from "@/app/api/services/queries"
import { loremIpsum, secondLoremIpsum } from "@/app/types/mock-data"
import { Query } from "@/app/types/queries"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function QueryPage() {
    const t = useTranslations('Query')
    const [query, setQuery] = useState<Query | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const params = useParams()
    const queryId = params.id as string

    useEffect(() => {
        const fetchQuery = async () => {
            try {
                const data = await getQuery(queryId)
                console.log("Query: ", data)
                setQuery(data)
            } finally {
                setIsLoading(false)
            }
        }

        fetchQuery()
    }, [queryId])

    if (isLoading) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center">
                {t('loading')}
            </div>
        )
    }

    if (!query) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center">
                {t('queryNotFound')}
            </div>
        )
    }

    return (
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6 small-scrollbar">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
                <div className="flex justify-end">
                    <div className="
                        max-w-[80%]
                        rounded-2xl
                        bg-gray-100
                        px-5 py-3
                        text-sm leading-6
                        text-gray-900
                        dark:bg-[#282828]
                        dark:text-[#eeeeee]
                    ">
                        {query.question}
                    </div>
                </div>

                <div className="
                    whitespace-pre-wrap
                    text-sm leading-7
                    text-gray-800
                    dark:text-[#dddddd]
                ">
                    {secondLoremIpsum}{/* {query.answer} */}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="
                        border-t
                        border-gray-200
                        pt-4
                        text-sm font-medium
                        text-gray-600
                        dark:border-[#2e2e2e]
                        dark:text-[#aaaaaa]
                    ">
                        Documents
                    </div>

                    <div className="flex flex-col gap-2">
                        {query.documents.map((document) => (
                            <button
                                key={document.id}
                                type="button"
                                className="
                                    flex w-full items-center
                                    rounded-xl
                                    border border-gray-200
                                    bg-gray-50
                                    px-3 py-1
                                    text-left text-sm
                                    text-gray-800
                                    transition-colors
                                    hover:bg-gray-100
                                    dark:border-[#383838]
                                    dark:bg-[#282828]
                                    dark:text-[#dddddd]
                                    dark:hover:bg-[#303030]
                                "
                            >
                                <span className="mr-3 text-base">
                                    📄
                                </span>

                                <span>
                                    {`${t('document')} ${document.id} (${t('roll')} ${document.roll.id}, ${t('page')} ${document.page})`}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}