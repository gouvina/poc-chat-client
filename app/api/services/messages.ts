import { Message, SenderType } from "@/app/types/message";
import { apiFetch } from "../client";

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 120;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMessages(conversationId: string) {
  return apiFetch<Message[]>(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId: string, content: string) {
  return apiFetch<Message>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content,
      sender: SenderType.USER,
    }),
  });
}

export async function waitForAssistantReply(
  conversationId: string,
  userMessageId: string,
): Promise<Message | null> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const messages = await getMessages(conversationId);
    const userIndex = messages.findIndex((message) => message.id === userMessageId);

    if (userIndex !== -1) {
      const assistantMessage = messages[userIndex + 1];
      if (assistantMessage?.sender === SenderType.ASSISTANT) {
        return assistantMessage;
      }
    }

    if (attempt < MAX_POLL_ATTEMPTS - 1) {
      await sleep(POLL_INTERVAL_MS);
    }
  }

  return null;
}
