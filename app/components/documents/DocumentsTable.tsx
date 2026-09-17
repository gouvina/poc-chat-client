"use client"

import { Document } from "@/app/types/document"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type DocumentsTableProps = {
    documents: Document[]
    isLoading?: boolean
}

export function DocumentsTable({
    documents,
    isLoading = false
}: DocumentsTableProps) {
    const t = useTranslations("Documents.Table")
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(1)

    const containerRef = useRef<HTMLDivElement>(null)
    const tableHeaderRef = useRef<HTMLTableSectionElement>(null)
    const tableRowRef = useRef<HTMLTableRowElement>(null)
    const paginationRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current

        if (!container) return

        const calculatePageSize = () => {
            const containerHeight = container.clientHeight
            const headerHeight = tableHeaderRef.current?.offsetHeight ?? 0
            const rowHeight = tableRowRef.current?.offsetHeight ?? 0
            const paginationHeight = paginationRef.current?.offsetHeight ?? 0

            if (!rowHeight) return

            const availableHeight = containerHeight - headerHeight - paginationHeight - 12

            const rowsThatFit = Math.max(1, Math.floor(availableHeight / rowHeight))

            setPageSize(rowsThatFit)
        }

        calculatePageSize()

        const observer = new ResizeObserver(calculatePageSize)
        observer.observe(container)

        return () => observer.disconnect()
    }, [documents])

    useEffect(() => {
        setCurrentPage(1)
    }, [pageSize])

    const totalPages = Math.max(1, Math.ceil(documents.length / pageSize))

    const startIndex = (currentPage - 1) * pageSize
    const paginateDocuments = documents.slice(
        startIndex,
        startIndex + pageSize,
    )

    const goToPage = (page: number) => {
        setCurrentPage(Math.min(Math.max(page, 1), totalPages))
    }

    const onClickRow = (id: number) => {
        router.push(`/documents/${id}`)
    }

    return (
        <div ref={containerRef} className="flex h-full min-h-0 w-full flex-col">
            {isLoading ? (
                <div className="flex min-h-40 flex-1 items-center justify-center rounded-lg border border-gray-200 dark:border-[#2e2e2e]">
                    <div className="flex item-center gap-3 text-sm text-gray-400 dark:text-[#888888]">
                        <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-[#444444] dark:border-t-[#aaaaaa]" />
                        <span>{t('loading')}</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="w-full">
                        <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-[#2e2e2e]">
                            <table className="w-full text-left text-sm">
                                <thead ref={tableHeaderRef} className="bg-gray-50 dark:bg-[#2e2e2e]">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-[#aaaaaa]">
                                            {t('rowHeaders.id')}
                                        </th >
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-[#aaaaaa]">
                                            {t('rowHeaders.rollNumber')}
                                        </th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-[#aaaaaa]">
                                            {t('rowHeaders.page')}
                                        </th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-[#aaaaaa]">
                                            {t('rowHeaders.version')}
                                        </th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-[#aaaaaa]">
                                            {t('rowHeaders.score')}
                                        </th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-[#aaaaaa]">
                                            {t('rowHeaders.rollName')}
                                        </th>
                                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-[#aaaaaa]">
                                            {t('rowHeaders.text')}
                                        </th>
                                    </tr >
                                </thead >

                                <tbody className="divide-y divide-gray-100 dark:divide-[#2e2e2e]">
                                    {paginateDocuments.map((document, index) => (
                                        <tr
                                            key={document.id}
                                            ref={index === 0 ? tableRowRef : undefined}
                                            className="hover:bg-gray-50 dark:hover:bg-[#222222]"
                                            onClick={() => onClickRow(document.id)}
                                        >
                                            <td className="px-4 py-3 text-gray-800 dark:text-[#dddddd]">
                                                {document.id}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-[#aaaaaa]">
                                                {document.roll.id}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-[#aaaaaa]">
                                                {document.page ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-[#aaaaaa]">
                                                {document.version ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-[#aaaaaa]">
                                                {document.score ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-[#aaaaaa]">
                                                {document.roll?.name ?? "—"}
                                            </td>
                                            <td className="max-w-md px-4 py-3 text-gray-600 dark:text-[#aaaaaa]">
                                                <p className="truncate">
                                                    {document.text ?? "—"}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table >
                        </div>
                    </div>

                    <div ref={paginationRef} className="mt-3 flex shrink-0 items-center justify-between">
                        <p className="text-xs text-gray-400 dark:text-[#777777]">
                            {documents.length === 0
                                ? t('noDocuments')
                                : `${startIndex + 1}-${Math.min(
                                    startIndex + pageSize,
                                    documents.length,
                                )} ${t('of')} ${documents.length}`}
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded-md px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#aaaaaa] dark:hover:bg-[#222222]"
                            >
                                {t('previous')}
                            </button>

                            <span className="px-2 text-xs text-gray-500 dark:text-[#888888]">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="rounded-md px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#aaaaaa] dark:hover:bg-[#222222]"
                            >
                                {t('next')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div >
    )
}