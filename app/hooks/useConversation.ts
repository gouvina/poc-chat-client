"use client";

import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  createConversation as createConversationApi,
  deleteConversation as deleteConversationApi,
  getConversations,
  updateConversation as updateConversationApi,
} from "../api/services/conversations";
import {
  getMessages,
  sendMessage as sendMessageApi,
  waitForAssistantReply,
} from "../api/services/messages";
import { useAuth } from "../context/AuthContext";
import { type Conversation } from "../types/conversation";
import { SenderType } from "../types/message";

const DRAFT_CONVERSATION_ID = "__draft__";

export type UseConversationResult = {
  conversations: Conversation[];
  activeConversationId: string;
  selectConversation: (conversationId: string) => void;
  messages: Conversation["messages"];
  isAwaitingAssistant: boolean;
  isLoading: boolean;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleNewChat: () => void;
  sendMessage: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  setConversationTitle: (
    conversationId: string,
    title: string,
  ) => Promise<void>;
};

function normalizeConversation(conversation: Conversation): Conversation {
  return {
    ...conversation,
    messages: conversation.messages ?? [],
  };
}

function createDraftConversation(): Conversation {
  return {
    id: DRAFT_CONVERSATION_ID,
    title: "New chat",
    messages: [],
  };
}

export function useConversation(): UseConversationResult {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState(
    DRAFT_CONVERSATION_ID,
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [
    awaitingAssistantByConversationId,
    setAwaitingAssistantByConversationId,
  ] = useState<Record<string, boolean>>({});

  const loadMessages = useCallback(async (conversationId: string) => {
    if (conversationId === DRAFT_CONVERSATION_ID) return;

    const messages = await getMessages(conversationId);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages }
          : conversation,
      ),
    );
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const activeUser = user;
    let cancelled = false;

    async function initialize() {
      setIsLoading(true);

      try {
        const response = await getConversations(activeUser.id);
        if (cancelled) return;

        const normalized = response.map(normalizeConversation);

        if (normalized.length === 0) {
          setConversations([createDraftConversation()]);
          setActiveConversationId(DRAFT_CONVERSATION_ID);
          return;
        }

        const firstConversation = normalized[0];
        const messages = await getMessages(firstConversation.id);
        if (cancelled) return;

        setConversations(
          normalized.map((conversation) =>
            conversation.id === firstConversation.id
              ? { ...conversation, messages }
              : conversation,
          ),
        );
        setActiveConversationId(firstConversation.id);
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const isSessionActive = isAuthenticated && user !== null;

  const activeConversation = isSessionActive
    ? conversations.find(
        (conversation) => conversation.id === activeConversationId,
      )
    : undefined;
  const messages = activeConversation?.messages ?? [];
  const isAwaitingAssistant =
    isSessionActive &&
    Boolean(activeConversationId) &&
    Boolean(awaitingAssistantByConversationId[activeConversationId]);

  function handleNewChat() {
    setConversations((prev) => {
      if (prev.some((conversation) => conversation.id === DRAFT_CONVERSATION_ID)) {
        return prev;
      }

      return [
        createDraftConversation(),
        ...prev.filter((conversation) => conversation.id !== DRAFT_CONVERSATION_ID),
      ];
    });
    setActiveConversationId(DRAFT_CONVERSATION_ID);
    setInput("");
  }

  function selectConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    void loadMessages(conversationId);
  }

  async function deleteConversation(conversationId: string) {
    if (conversationId === DRAFT_CONVERSATION_ID) {
      handleNewChat();
      return;
    }

    try {
      await deleteConversationApi(conversationId);
    } catch (err) {
      console.error("Failed to delete conversation", err);
      return;
    }

    setAwaitingAssistantByConversationId((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });

    const filtered = conversations.filter(
      (conversation) => conversation.id !== conversationId,
    );

    if (filtered.length === 0) {
      setConversations([createDraftConversation()]);
      setActiveConversationId(DRAFT_CONVERSATION_ID);
      setInput("");
      return;
    }

    setConversations(filtered);

    if (activeConversationId === conversationId) {
      const deletedIndex = conversations.findIndex(
        (conversation) => conversation.id === conversationId,
      );
      const neighbor =
        filtered[deletedIndex] ??
        filtered[deletedIndex - 1] ??
        filtered[0];
      setActiveConversationId(neighbor.id);
      void loadMessages(neighbor.id);
      setInput("");
    }
  }

  async function setConversationTitle(conversationId: string, title: string) {
    const nextTitle = title.trim() || "New chat";

    if (conversationId === DRAFT_CONVERSATION_ID) {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, title: nextTitle }
            : conversation,
        ),
      );
      return;
    }

    try {
      await updateConversationApi(conversationId, nextTitle);
    } catch (err) {
      console.error("Failed to rename conversation", err);
      return;
    }

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, title: nextTitle }
          : conversation,
      ),
    );
  }

  async function sendMessage() {
    const trimmedInput = input.trim();
    if (!trimmedInput || isAwaitingAssistant || !activeConversationId || !user) {
      return;
    }

    const convId = activeConversationId;
    let awaitingConversationId = convId;
    setAwaitingAssistantByConversationId((prev) => ({
      ...prev,
      [convId]: true,
    }));
    setInput("");

    try {
      let targetConversationId = convId;
      let userMessageId: string;

      if (convId === DRAFT_CONVERSATION_ID) {
        const title = trimmedInput.slice(0, 50) || "New chat";
        const createConversationUser = {id: user.id, email: user.email}
        const created = normalizeConversation(
          await createConversationApi(createConversationUser, title, {
            content: trimmedInput,
            sender: SenderType.USER,
          }),
        );
        const createdMessages = await getMessages(created.id);
        const userMessage =
          createdMessages.find(
            (message) => message.sender === SenderType.USER,
          ) ?? createdMessages[createdMessages.length - 1];

        if (!userMessage) {
          throw new Error("User message was not created");
        }

        userMessageId = userMessage.id;

        setConversations((prev) => [
          { ...created, messages: createdMessages },
          ...prev.filter(
            (conversation) => conversation.id !== DRAFT_CONVERSATION_ID,
          ),
        ]);
        setActiveConversationId(created.id);
        targetConversationId = created.id;
        awaitingConversationId = created.id;
      } else {
        const userMessage = await sendMessageApi(convId, trimmedInput);
        userMessageId = userMessage.id;

        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === convId
              ? {
                  ...conversation,
                  messages: [...conversation.messages, userMessage],
                }
              : conversation,
          ),
        );
      }

      await waitForAssistantReply(targetConversationId, userMessageId);
      await loadMessages(targetConversationId);
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setAwaitingAssistantByConversationId((prev) => {
        const next = { ...prev };
        delete next[convId];
        delete next[awaitingConversationId];
        return next;
      });
    }
  }

  return {
    conversations: isSessionActive ? conversations : [],
    activeConversationId: isSessionActive
      ? activeConversationId
      : DRAFT_CONVERSATION_ID,
    selectConversation,
    messages,
    isAwaitingAssistant,
    isLoading: isSessionActive ? isLoading : false,
    input: isSessionActive ? input : "",
    setInput,
    handleNewChat,
    sendMessage,
    deleteConversation,
    setConversationTitle,
  };
}
