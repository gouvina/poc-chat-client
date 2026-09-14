import { apiFetch } from "../client";
import { Document } from "@/app/types/document"

export async function getDocuments() {
    return apiFetch<Document[]>(`/documents`)
}