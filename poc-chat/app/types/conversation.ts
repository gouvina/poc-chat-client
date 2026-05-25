export type MessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  content: string;
  role: MessageRole;
  sentAt: Date;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

export function createConversation(title = "New chat"): Conversation {
  return {
    id: crypto.randomUUID(),
    title,
    messages: [],
  };
}

export function createChatMessage(
  content: string,
  role: MessageRole = "user",
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    content,
    role,
    sentAt: new Date(),
  };
}
