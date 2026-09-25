"use client"

import { getQuery } from "@/app/api/services/queries"
import { DocumentWorkspace } from "@/app/components/documents/DocumentWorkspace"
import { Query } from "@/app/types/queries"
import { Document } from "@/app/types/document"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { DotLoading } from "@/app/components/global/DotLoading"

function DocumentsLoading() {
    return (
        <div className="flex flex-col gap-2">
            <div className="h-8 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-[#282828]" />
            <div className="h-8 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-[#282828]" />
        </div>
    )
}

function QuestionLoading() {
    return (
        <div className="flex justify-end">
            <div className="h-12 w-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#282828]" />
        </div>
    )
}

export default function QueryPage() {
    const t = useTranslations('Query')
    const [query, setQuery] = useState<Query | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [animateQuery, setAnimateQuery] = useState(false)
    const [animationFinished, setAnimationFinished] = useState(false)
    const [questionWidth, setQuestionWidth] = useState<number | null>(null)
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

    const params = useParams()
    const queryId = params.id as string

    const initialNewQuery = (() => {
        if (typeof window === "undefined") return null

        const storedQuery = sessionStorage.getItem("new-query")

        if (!storedQuery) return null

        const parsedQuery = JSON.parse(storedQuery)

        return parsedQuery.id === queryId ? parsedQuery : null
    })()

    const [newQuery, setNewQuery] = useState<{
        id: string,
        question: string,
        keywords: string[]
    } | null>(initialNewQuery)

    const questionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const storedQuery = sessionStorage.getItem("new-query")

        if (storedQuery) {
            const parsedQuery = JSON.parse(storedQuery)

            if (parsedQuery.id === queryId) {
                setNewQuery(parsedQuery)
                sessionStorage.removeItem("new-query")
            }
        }

        const fetchQuery = async () => {
            try {
                const data = await getQuery(queryId)
                setQuery(data)
            } finally {
                setIsLoading(false)
            }
        }

        fetchQuery()
    }, [queryId])

    function getQuestionWidth(element: HTMLDivElement) {
        const availableWidth = element.parentElement?.clientWidth ?? 0

        const previousWidth = element.style.width
        const previousMaxWidth = element.style.maxWidth

        element.style.width = "max-content"
        element.style.maxWidth = "none"

        const naturalWidth = element.getBoundingClientRect().width
        const width = Math.min(naturalWidth, availableWidth * 0.8)

        element.style.width = previousWidth
        element.style.maxWidth = previousMaxWidth

        return width
    }

    useEffect(() => {
        if (!newQuery || !questionRef.current) return

        const width = getQuestionWidth(questionRef.current)

        setQuestionWidth(width)

        let frame1: number | undefined
        let frame2: number | undefined
        let finishTimeout: ReturnType<typeof setTimeout> | undefined

        frame1 = requestAnimationFrame(() => {
            frame2 = requestAnimationFrame(() => {
                setAnimateQuery(true)

                finishTimeout = setTimeout(() => {
                    setAnimationFinished(true)
                }, 400)
            })
        })

        return () => {
            if (frame1 !== undefined) cancelAnimationFrame(frame1)
            if (frame2 !== undefined) cancelAnimationFrame(frame2)
            if (finishTimeout !== undefined) clearTimeout(finishTimeout)
        }
    }, [newQuery])

    if (!query && !newQuery && !isLoading) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center">
                {t('queryNotFound')}
            </div>
        )
    }

    return (
        <DocumentWorkspace document={selectedDocument} onCloseViewer={() => setSelectedDocument(null)}>
            <main className={`flex min-h-0 flex-1 flex-col px-6 py-6 ${newQuery && !animationFinished ? "overflow-y-hidden" : "overflow-y-auto  small-scrollbar"}`}>
                <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8">

                    {/* QUESTION */}
                    <div className={`relative ${newQuery && !animationFinished ? "min-h-full" : ""}`}>
                        <div style={newQuery ? {
                            position: animationFinished ? "relative" : "absolute",
                            left: animationFinished ? undefined : 0,
                            right: animationFinished ? undefined : 0,
                            top: animationFinished ? undefined : (animateQuery ? 0 : "50%"),
                            transform: animationFinished
                                ? undefined
                                : (animateQuery ? "translateY(0)" : "translateY(-50%)"),
                            transition: "top 400ms ease-out, transform 400ms ease-out",
                        } : undefined}>

                            {query?.question || newQuery?.question ? (
                                <div className="flex justify-end">
                                    <div
                                        ref={questionRef}
                                        style={newQuery
                                            ? {
                                                width: animateQuery
                                                    ? `${questionWidth}px`
                                                    : "100%",
                                            } : undefined}
                                        className={`
                                            ${newQuery ? "max-w-[100%]" : "max-w-[80%]"}
                                            transition-[width] duration-[300ms] ease-out
                                            rounded-2xl bg-gray-100
                                            px-5 py-3
                                            text-sm leading-6
                                            text-gray-900
                                            dark:bg-[#282828]
                                            dark:text-[#eeeeee]
                                        `}
                                    >
                                        {newQuery ? newQuery.question : query?.question}
                                    </div>
                                </div>
                            ) : (<QuestionLoading />)}
                        </div>
                    </div>

                    <div className={`transition-opacity duration-400 ease-out ${newQuery && !animationFinished ? "opacity-0" : "opacity-100"}`}>

                        {/* ANSWER */}
                        {query ? (
                            <div>
                                <div className="
                                    whitespace-pre-wrap
                                    text-sm leading-7
                                    text-gray-800
                                    dark:text-[#dddddd]
                                ">
                                    {query.answer}
                                </div>

                                {query.keywords?.length > 0 && (
                                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                                        <span className="text-gray-500 dark:text-[#888888]">
                                            Keywords:
                                        </span>

                                        {query.keywords.map((keyword) => (
                                            <span
                                                key={keyword}
                                                className="
                                                    rounded-full
                                                    bg-gray-100
                                                    px-2.5 py-1
                                                    text-gray-500
                                                    dark:bg-[#303030]
                                                    dark:text-[#aaaaaa]
                                                "
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (<DotLoading />)}

                        {/* DOCUMENTS */}
                        <div className="flex flex-col gap-3">
                            <div className="
                                border-t
                                border-gray-200
                                mt-6
                                pt-4
                                text-sm font-medium
                                text-gray-500
                                dark:border-[#2e2e2e]
                                dark:text-[#aaaaaa]
                            ">
                                {t('documents')}
                            </div>

                            {query ? (
                                <div className="flex flex-col gap-2">
                                    {query.documents.map((document) => (
                                        <button
                                            key={document.id}
                                            type="button"
                                            onClick={() => setSelectedDocument(document)}
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
                                                dark:bg-[#404040]
                                                dark:text-[#dddddd]
                                                dark:hover:bg-[#505050]
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
                            ) : (<DocumentsLoading />)}
                        </div>
                    </div>
                </div>
            </main>
        </DocumentWorkspace>
    )
}