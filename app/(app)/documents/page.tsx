"use client"

import { LoginModal } from "@/app/components/auth/LoginModal";
import { DocumentsTable } from "@/app/components/documents/DocumentsTable";
import { useAuth } from "@/app/context/AuthContext";
import { Document } from "@/app/types/document"
import { useEffect, useState } from "react";
import { getDocuments } from "@/app/api/services/documents";
import { dummyDocuments } from "@/app/types/temp-lorem-ipsum"
import { useTranslations } from "next-intl";
import { DocumentWorkspace } from "@/app/components/documents/DocumentWorkspace";

export default function DocumentsPage() {
    const t = useTranslations('Documents')

    const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
    const [documents, setDocuments] = useState<Document[]>([])
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoading(false)
            return
        }

        async function loadDocuments() {
            try {
                const data = await getDocuments()
                setDocuments(data)
            } finally {
                setIsLoading(false)
            }
        }

        loadDocuments()
    }, [isAuthenticated])

    if (isAuthLoading) {
        return (
            <div className="flex h-full min-w-0 flex-1 items-center justify-center bg-white text-sm text-gray-400 dark:bg-[#1c1c1c] dark:text-[#888888]">
                Loading…
            </div>
        )
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-[#1c1c1c]">
            <div
                className={`flex min-h-0 flex-1 flex-col px-6 py-6 ${isAuthenticated
                    ? ""
                    : "pointer-events-none select-none blur-sm"
                    }`}
                aria-hidden={!isAuthenticated}
            >
                <DocumentWorkspace document={selectedDocument} onCloseViewer={() => setSelectedDocument(null)}>
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-[#eeeeee]">
                            {t('title')}
                        </h1>

                        <p className="mt-1 text-gray-500 dark:text-[#888888]">
                            {t("subtitle")}
                        </p>
                    </div>

                    <div className="min-h-0 flex-1">
                        <DocumentsTable documents={dummyDocuments} isLoading={isLoading} onClickDocument={setSelectedDocument} selectedDocumentId={selectedDocument?.id} />
                    </div>
                </DocumentWorkspace>
            </div>

            {!isAuthenticated ? <LoginModal /> : null}
        </div>
    )
}