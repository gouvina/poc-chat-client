import { DocumentDetails } from "@/app/components/documents/DocumentDetails"
import { loremIpsum } from "@/app/types/temp-lorem-ipsum"

type Props = {
    params: Promise<{
        id: number
    }>
}

export default async function DocumentViewPage({ params }: Props) {
    const { id } = await params
    const document = {
        id,
        page: 1,
        score: 85,
        version: 'v1',
        text: loremIpsum,
        roll: {
            id: 1,
            name: 'documentos 1997',
            number_documents: 1
        }
    }
    return (
        <div className="flex h-full w-full flex-col p-6">
            <DocumentDetails document={document} />
        </div>
    )
}