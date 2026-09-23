import { Query } from "@/app/types/queries";
import { apiFetch } from "../client";
import { User } from "@/app/types/user";

export async function getQueries(userId: string) {
    return apiFetch<Query[]>(`/queries?userId=${userId}`)
}

export async function getQuery(id: string) {
    return apiFetch<Query>(`/queries/${id}`)
}

export async function createQuery(
    user: User,
    question: string
) {
    return apiFetch<Query>("/queries", {
        method: "POST",
        body: JSON.stringify({ user, question })
    })
}

export async function deleteQuery(id: string) {
    return apiFetch<Query>(`/queries/${id}`, {
        method: "DELETE",
    })
}