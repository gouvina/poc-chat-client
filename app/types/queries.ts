import { User } from "./user"
import { Document } from "./document"

export type Query = {
    id: string
    question: string
    answer: string
    user: User
    documents: Document[]
}