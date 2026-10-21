"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { DocumentsTable } from "./components/DocumentsTable"
import { DocumentWorkspace } from "./components/DocumentWorkspace"
import { DocumentsFilter } from "./components/DocumentsFilter"
import type { Document } from "@/app/types/document"

type Props = {
    initialDocuments: Document[]
}

export function DocumentsClientPage({ initialDocuments }: Props) {
    const t = useTranslations("Documents")

    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-[#1c1c1c]">
            <div className={"flex min-h-0 flex-1 flex-col px-6 py-6"}>
                <DocumentWorkspace document={selectedDocument} onCloseViewer={() => setSelectedDocument(null)} showMetadata={false}>
                    <div className="mb-6 grid grid-cols-[4fr_6fr] items-end gap-6">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-[#eeeeee]">
                                {t('title')}
                            </h1>

                            <p className="mt-1 text-gray-500 dark:text-[#888888]">
                                {t("subtitle")}
                            </p>
                        </div>

                        <DocumentsFilter />
                    </div>

                    <div className="min-h-0 flex-1">
                        <DocumentsTable documents={initialDocuments} isLoading={false} onClickDocument={setSelectedDocument} selectedDocumentId={selectedDocument?.id} />
                    </div>
                </DocumentWorkspace>
            </div>
        </div>
    )
}
