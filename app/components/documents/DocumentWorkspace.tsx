import { Document } from "@/app/types/document"
import { DocumentViewer } from "./DocumentViewer"

type DocumentWorkspaceProps = {
    document: Document | null
    onCloseViewer: () => void
    children: React.ReactNode
}

export function DocumentWorkspace({
    document,
    onCloseViewer,
    children
}: DocumentWorkspaceProps) {
    return (
        <div className={`
            grid h-full w-full
            transition-[grid-template-columns] duration-300 ease-in-out
            ${document ? "grid-cols-[60%_40%]" : "grid-cols-[100%_0%]"}`
        }>
            <div className="flex flex-col min-w-0 overflow-hidden">
                {children}
            </div>

            <div className="min-w-0 overflow-hidden pl-2">
                {document && (
                    <DocumentViewer document={document} onClose={onCloseViewer} showMetadata={true} />
                )}
            </div>
        </div>
    )
}