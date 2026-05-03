"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import {
  createChatMessage,
  createConversation,
  type ChatMessage,
  type Conversation,
} from "../types/conversation";

const MOCK_ASSISTANT_REPLIES = [
  "Got it — here’s a quick thought on that.",
  "Interesting point. Can you say more about what you’re trying to build?",
  "Thanks for the context. I’d approach this in two steps.",
  "Noted. One caveat: watch out for race conditions if calls overlap.",
  "Here’s a concise summary of what I’d try next.",
];

function mockAssistantReply(): Promise<string> {
  const delayMs = 700 + Math.floor(Math.random() * 900);
  const text =
    MOCK_ASSISTANT_REPLIES[
      Math.floor(Math.random() * MOCK_ASSISTANT_REPLIES.length)
    ] ?? "OK.";
  return new Promise((resolve) => setTimeout(() => resolve(text), delayMs));
}

export type UseConversationResult = {
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: Dispatch<SetStateAction<string>>;
  messages: ChatMessage[];
  isAwaitingAssistant: boolean;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleNewChat: () => void;
  sendMessage: () => void;
  deleteConversation: (conversationId: string) => void;
  setConversationTitle: (conversationId: string, title: string) => void;
};

export function useConversation(): UseConversationResult {
  const initialConversation = useMemo(() => createConversation(), []);
  const [conversations, setConversations] = useState<Conversation[]>([
    initialConversation,
  ]);
  const [activeConversationId, setActiveConversationId] = useState(
    initialConversation.id,
  );
  const [input, setInput] = useState("");
  const [awaitingAssistantByConversationId, setAwaitingAssistantByConversationId] =
    useState<Record<string, boolean>>({});

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const messages = activeConversation?.messages ?? [];
  const isAwaitingAssistant =
    Boolean(activeConversationId) &&
    Boolean(awaitingAssistantByConversationId[activeConversationId]);

  function handleNewChat() {
    const next = createConversation();
    setConversations((prev) => [next, ...prev]);
    setActiveConversationId(next.id);
    setInput("");
  }

  /** Removes the conversation locally. Future: DELETE /api/conversations/:id */
  function deleteConversation(conversationId: string) {
    setAwaitingAssistantByConversationId((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });

    const filtered = conversations.filter((c) => c.id !== conversationId);
    const nextList =
      filtered.length === 0 ? [createConversation()] : filtered;
    setConversations(nextList);

    if (activeConversationId === conversationId) {
      if (filtered.length === 0) {
        setActiveConversationId(nextList[0].id);
      } else {
        const deletedIndex = conversations.findIndex(
          (c) => c.id === conversationId,
        );
        const neighbor =
          filtered[deletedIndex] ??
          filtered[deletedIndex - 1] ??
          filtered[0];
        setActiveConversationId(neighbor.id);
      }
      setInput("");
    }
  }

  /** Future: PATCH /api/conversations/:id { title } */
  function setConversationTitle(conversationId: string, title: string) {
    const nextTitle = title.trim() || "New chat";
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, title: nextTitle } : c,
      ),
    );
  }

  function sendMessage() {
    const trimmedInput = input.trim();
    if (!trimmedInput || isAwaitingAssistant) return;

    const convId = activeConversationId;
    const userMessage = createChatMessage(trimmedInput, "user");
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, userMessage] }
          : c,
      ),
    );
    setAwaitingAssistantByConversationId((prev) => ({
      ...prev,
      [convId]: true,
    }));
    setInput("");

    void (async () => {
      const replyText = await mockAssistantReply();
      const assistantMessage = createChatMessage(replyText, "assistant");
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMessage] }
            : c,
        ),
      );
      setAwaitingAssistantByConversationId((prev) => {
        const next = { ...prev };
        delete next[convId];
        return next;
      });
    })();
  }

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    isAwaitingAssistant,
    input,
    setInput,
    handleNewChat,
    sendMessage,
    deleteConversation,
    setConversationTitle,
  };
}
