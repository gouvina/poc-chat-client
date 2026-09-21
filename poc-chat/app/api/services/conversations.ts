import { Conversation } from "@/app/types/conversation";
import { CreateMessagePayload } from "@/app/types/message";
import { User } from "@/app/types/user";
import { apiFetch } from "../client";

export async function getConversations() {
  return apiFetch<Conversation[]>("/conversations");
}

export async function getConversation(id: string) {
  return apiFetch<Conversation>(`/conversations/${id}`);
}

export async function createConversation(
  user: User,
  title: string,
  firstMessage: CreateMessagePayload,
) {
  return apiFetch<Conversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({ user, title, firstMessage }),
  });
}

export async function updateConversation(id: string, title: string) {
  return apiFetch<Conversation>(`/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(id: string) {
  return apiFetch<Conversation>(`/conversations/${id}`, {
    method: "DELETE",
  });
}
