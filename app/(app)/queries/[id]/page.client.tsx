"use client"

import { DocumentWorkspace } from "@/app/(app)/documents/components/DocumentWorkspace"
import { Query } from "@/app/types/queries"
import { Document } from "@/app/types/document"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { QueryQuestion } from "@/app/(app)/queries/components/QueryQuestion"
import { FileText } from "lucide-react";

type Props = {
    initialQuery: Query
}

export default function QueryClientPage({ initialQuery }: Props) {
    const t = useTranslations('Query')
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

    return (
        <DocumentWorkspace document={selectedDocument} onCloseViewer={() => setSelectedDocument(null)}>
            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto small-scrollbar px-6 py-6">
                <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8">

                    <div className="flex justify-end">
                        <div className="
                            max-w-[80%]
                            rounded-2xl bg-gray-100
                            px-5 py-3
                            text-sm leading-6
                            text-gray-900
                            dark:bg-[#282828]
                            dark:text-[#eeeeee]
                        ">
                            {initialQuery.question}
                        </div>
                    </div>

                    {/* ANSWER */}
                    <div>
                        <div className="
                            whitespace-pre-wrap
                            text-sm leading-7
                            text-gray-800
                            dark:text-[#dddddd]
                        ">
                            {initialQuery.answer}
                        </div>

                        {initialQuery.keywords?.length > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-gray-500 dark:text-[#888888]">
                                    Keywords:
                                </span>

                                {initialQuery.keywords.map((keyword) => (
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

                    {/* DOCUMENTS */}
                    <div className="flex flex-col gap-3">
                        <div className="
                            border-t border-gray-200
                            mt-6 pt-4
                            text-sm font-medium
                            text-gray-500
                            dark:border-[#2e2e2e]
                            dark:text-[#aaaaaa]
                        ">
                            {t('documents')}
                        </div>

                        <div className="flex flex-col gap-2">
                            {initialQuery.documents.map((document) => (
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
                                        hover:bg-gray-100
                                        dark:border-[#383838]
                                        dark:bg-[#404040]
                                        dark:text-[#dddddd]
                                        dark:hover:bg-[#505050]
                                    "
                                >
                                    <FileText className="mr-3 size-4" />

                                    <span>
                                        {`${t('document')} ${document.id} (${t('roll')} ${document.roll.id}, ${t('page')} ${document.page})`}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </DocumentWorkspace >
    )
}
