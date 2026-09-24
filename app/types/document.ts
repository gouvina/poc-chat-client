import { Roll } from "./roll"

export type Document = {
    id: number
    page?: number
    score?: number
    version?: string
    text?: string
    roll: Roll
}