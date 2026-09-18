"use client"

import { Document } from "@/app/types/document"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

type DocumentViewerProps = {
    document: Document
    onClose: () => void
    showMetadata?: boolean
}

export function DocumentViewer({
    document,
    onClose,
    showMetadata = false
}: DocumentViewerProps) {
    const t = useTranslations('Documents.Table')
    const [displayedDocument, setDisplayedDocument] = useState(document)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        if (document.id === displayedDocument.id) return

        setIsVisible(false)

        const timeout = setTimeout(() => {
            setDisplayedDocument(document)

            requestAnimationFrame(() => {
                setIsVisible(true)
            })
        }, 150)

        return () => clearTimeout(timeout)
    }, [document, displayedDocument.id])

    return (
        <div className="flex h-full min-h-0 flex-col border-l border-gray-200 bg-white dark:border-[#2e2e2e] dark:bg-[#1c1c1c]">
            <div
                className={`
                    flex min-h-0 flex-1 flex-col
                    transition-opacity ease-in-out
                    ${isVisible ? "duration-200 opacity-100" : "duration-120 opacity-0"}
                `}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-[#2e2e2e]">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-[#eeeeee]">
                        {`${t('document')} ${displayedDocument.id} (${t('roll')} ${displayedDocument.roll.id}, ${t('page')} ${displayedDocument.page})`}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close document"
                        className="rounded-md px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-[#888888] dark:hover:bg-[#2a2a2a] dark:hover:text-[#dddddd]"
                    >
                        ✕
                    </button>
                </div>

                {showMetadata && (
                    <div className="flex shrink-0 flex-wrap gap-x-5 gap-y-2 border-b border-gray-100 px-5 py-3 text-xs dark:border-[#2e2e2e]">
                        {displayedDocument.roll?.name && (
                            <div>
                                <span className="text-gray-400 dark:text-[#777777]">
                                    {t('rowHeaders.roll')}
                                </span>
                                <span className="ml-1.5 text-gray-600 dark:text-[#aaaaaa]">
                                    {displayedDocument.roll.name}
                                </span>
                            </div>
                        )}

                        {displayedDocument.page != null && (
                            <div>
                                <span className="text-gray-400 dark:text-[#777777]">
                                    {t('rowHeaders.page')}
                                </span>
                                <span className="ml-1.5 text-gray-600 dark:text-[#aaaaaa]">
                                    {displayedDocument.page}
                                </span>
                            </div>
                        )}

                        {displayedDocument.version != null && (
                            <div>
                                <span className="text-gray-400 dark:text-[#777777]">
                                    {t('rowHeaders.version')}
                                </span>
                                <span className="ml-1.5 text-gray-600 dark:text-[#aaaaaa]">
                                    {displayedDocument.version}
                                </span>
                            </div>
                        )}

                        {displayedDocument.score != null && (
                            <div>
                                <span className="text-gray-400 dark:text-[#777777]">
                                    {t('rowHeaders.score')}
                                </span>
                                <span className="ml-1.5 text-gray-600 dark:text-[#aaaaaa]">
                                    {displayedDocument.score}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 small-scrollbar">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-[#cccccc]">
                        {displayedDocument.text ?? "No text available."}
                    </p>
                </div>
            </div>
        </div>
    )
}
