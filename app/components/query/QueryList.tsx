"use client"

import {
    getQueries,
    deleteQuery as deleteQueryApi,
    updateQuery as updateQueryApi
} from "@/app/api/services/queries"
import { useAuth } from "@/app/context/AuthContext"
import { Query } from "@/app/types/queries"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ScrollingText } from "../layout/ScrollingText"
import { createPortal } from "react-dom"
import { RenameModal } from "../chat/RenameConversationModal"
import { mockQueries } from "@/app/types/mock-data"

function groupQueriesByDate(queries: Query[]) {
    return queries.reduce<Record<string, Query[]>>(
        (groups, query) => {
            const date = new Date(query.updatedAt).toLocaleDateString("en-GB")

            if (!groups[date]) {
                groups[date] = []
            }

            groups[date].push(query)

            return groups
        },
        {}
    )
}

export function QueryList() {
    const t = useTranslations('Query')
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAuthenticated } = useAuth();

    const [queries, setQueries] = useState<Query[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [queryMenuOpenId, setQueryMenuOpenId] = useState<string | null>(null)
    const [menuPosition, setMenuPosition] = useState<{
        top: number
        left: number
    } | null>(null)

    const [renameQueryId, setRenameQueryId] = useState<string | null>(null)
    const [renameName, setRenameName] = useState("")

    const queryListRef = useRef<HTMLDivElement>(null)
    const queryRefs = useRef<Record<string, HTMLDivElement | null>>({})

    // Fetch Queries
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
    }, [user, isAuthenticated, pathname])

    // Handle menu when scrolling
    useEffect(() => {
        const list = queryListRef.current

        if (!list) return

        const handleScroll = () => {
            setQueryMenuOpenId(null)
            setMenuPosition(null)
        }

        list.addEventListener("scroll", handleScroll)

        return () => {
            list.removeEventListener("scroll", handleScroll)
        }
    }, [])

    // Handle menu close
    useEffect(() => {
        if (!queryMenuOpenId) return
        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target
            if (
                target instanceof Element && (
                    target.closest("[data-query-actions]") ||
                    target.closest("[data-query-menu]")
                )
            ) {
                return
            }
            setQueryMenuOpenId(null)
        }

        document.addEventListener("pointerdown", handlePointerDown)
        return () =>
            document.removeEventListener("pointerdown", handlePointerDown)
    }, [queryMenuOpenId])

    const handleNewQuery = () => {
        router.push("/queries")
    }

    const handleSelectQuery = (queryId: string) => {
        router.push(`/queries/${queryId}`)
    }

    async function deleteQuery(queryId: string) {
        try {
            await deleteQueryApi(queryId)

            setQueries((prev) => prev.filter((query) => query.id !== queryId))
        } catch (err) {
            console.error(t('errors.deleteQQueryFail'), err)
        }
    }

    async function renameQuery(name: string) {
        if (!renameQueryId) return

        try {
            await updateQueryApi(renameQueryId, name)

            setQueries((prev) =>
                prev.map((query) =>
                    query.id === renameQueryId
                        ? { ...query, name }
                        : query
                )
            )

            setRenameName("")
            setRenameQueryId(null)
        } catch (err) {
            console.error(t("errors.renameQueryFail"), err)
        }
    }

    const sortedQueries = [...queries].sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())

    const queriesByDate = groupQueriesByDate(sortedQueries)

    return (
        <>
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

                <div ref={queryListRef} className="min-h-0 flex-1 overflow-y-auto small-scrollbar">
                    {isLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-400">
                            {t('loading')}
                        </div>
                    ) : Object.entries(queriesByDate).map(([date, queries]) => (
                        <div key={date} className="mb-4">
                            <p className="mb-1 mt-2 text-xs text-gray-400 dark:text-[#666666]">
                                {date}
                            </p>
                            {queries.map((query) => (
                                <div
                                    key={query.id}
                                    ref={(element) => {
                                        queryRefs.current[query.id] = element
                                    }}
                                    className={`
                                        group flex items-center gap-0.5 rounded-md transition-colors
                                        ${pathname === `/queries/${query.id}`
                                            ? "bg-gray-200 dark:bg-[#2a2a2a]"
                                            : "hover:bg-gray-100 dark:hover:bg-[#222222]"
                                        }
                                    `}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQueryMenuOpenId(null)
                                            handleSelectQuery(query.id)
                                        }}
                                        className={`
                                            min-w-0 flex-1 truncate
                                            rounded-lg px-3 py-2
                                            text-left text-sm group-hover:pr-1
                                            transition-colors
                                            ${pathname === `/queries/${query.id}`
                                                ? "text-gray-900 dark:text-[#eeeeee]"
                                                : "text-gray-600 dark:text-[#aaaaaa]"
                                            }
                                        `}
                                    >
                                        <ScrollingText>
                                            {query.name}
                                        </ScrollingText>
                                    </button>

                                    {/* Menu Button */}
                                    <div
                                        className="relative shrink-0 py-1 pr-1"
                                        data-query-actions
                                    >
                                        <button
                                            type="button"
                                            aria-label={t('queryOptions')}
                                            aria-expanded={queryMenuOpenId === query.id}
                                            onClick={(e) => {
                                                e.stopPropagation()

                                                if (queryMenuOpenId === query.id) {
                                                    setQueryMenuOpenId(null)
                                                    setMenuPosition(null)
                                                    return
                                                }

                                                const rect = e.currentTarget.getBoundingClientRect()

                                                setQueryMenuOpenId(query.id)
                                                setMenuPosition({
                                                    top: rect.top,
                                                    left: rect.right + 4
                                                })
                                            }}
                                            className="
                                                flex h-8 w-0 items-center justify-center
                                                rounded-md text-gray-500
                                                opacity-0 transition-opacity
                                                group-hover:opacity-100 group-hover:w-8
                                                hover:text-gray-700
                                                dark:text-[#888888] dark:hover:text-[#dddddd]
                                            "
                                        >
                                            <svg
                                                aria-hidden
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 16 16"
                                            >
                                                <circle cx="3" cy="8" r="1.5" />
                                                <circle cx="8" cy="8" r="1.5" />
                                                <circle cx="13" cy="8" r="1.5" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {queryMenuOpenId && menuPosition
                ? createPortal(
                    <div
                        role="menu"
                        data-query-menu
                        className="fixed z-[200] w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#2e2e2e] dark:bg-[#222222]"
                        style={{
                            top: menuPosition.top,
                            left: menuPosition.left
                        }}
                    >
                        <button
                            type="button"
                            role="menuitem"
                            className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]"
                            onClick={() => {
                                const query = queries.find(
                                    (query) => query.id === queryMenuOpenId
                                )

                                setQueryMenuOpenId(null)
                                setMenuPosition(null)

                                if (query) {
                                    setRenameName(query.name)
                                    setRenameQueryId(query.id)
                                }
                            }}
                        >
                            {t('rename')}
                        </button>

                        <button
                            type="button"
                            role="menuitem"
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-[#2a2a2a]"
                            onClick={() => {
                                setQueryMenuOpenId(null)
                                setMenuPosition(null)
                                void deleteQuery(queryMenuOpenId)
                            }}
                        >
                            {t('deleteQuery')}
                        </button>
                    </div>,
                    document.body
                )
                : null}

            {renameQueryId && (
                <RenameModal
                    name={renameName}
                    onChangeName={setRenameName}
                    onSave={(() => void renameQuery(renameName))}
                    onCancel={() => {
                        setQueryMenuOpenId(null)
                        setRenameQueryId(null)
                    }}
                />
            )}
        </>
    )
}
