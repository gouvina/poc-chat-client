import { User } from "@/app/types/user";
import { apiFetch } from "../client";

const USER_STORAGE_KEY = "poc-chat-user";

export async function getOrCreateUser(): Promise<User> {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as User;
    }
  }

  const user = await apiFetch<User>("/users", {
    method: "POST",
    body: JSON.stringify({
      email: `user-${crypto.randomUUID()}@poc-chat.local`,
      password: crypto.randomUUID(),
    }),
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  return user;
}
