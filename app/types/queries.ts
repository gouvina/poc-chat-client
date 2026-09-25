import { User } from "./user"
import { Document } from "./document"

export type Query = {
    id: string
    question: string
    keywords: string[]
    answer: string
    user: User
    documents: Document[]
    createdAt?: string
    updatedAt?: string
}