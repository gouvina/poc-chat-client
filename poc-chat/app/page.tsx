"use client";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "./context/ThemeContext";
import {
  createChatMessage,
  createConversation,
  type Conversation,
} from "./types/conversation";

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

export default function Home() {
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
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const messages = activeConversation?.messages ?? [];
  const isAwaitingAssistant =
    Boolean(activeConversationId) &&
    Boolean(awaitingAssistantByConversationId[activeConversationId]);

  const handleNewChat = () => {
    const next = createConversation();
    setConversations((prev) => [next, ...prev]);
    setActiveConversationId(next.id);
    setInput("");
  };

  const [conversationMenuOpenId, setConversationMenuOpenId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!conversationMenuOpenId) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (
        target instanceof Element &&
        target.closest("[data-conversation-actions]")
      ) {
        return;
      }
      setConversationMenuOpenId(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [conversationMenuOpenId]);

  function deleteConversationLocally(conversationId: string) {
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

  const handleDeleteConversation = (conversationId: string) => {
    setConversationMenuOpenId(null);
    deleteConversationLocally(conversationId);
    // Future: await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' })
  };

  const sendMessage = () => {
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
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#1c1c1c]">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-gray-200 dark:border-[#2e2e2e] bg-gray-50 dark:bg-[#161616] flex flex-col p-3">
        <button
          type="button"
          onClick={handleNewChat}
          className="w-full text-left px-3 py-2 rounded-md border border-gray-200 dark:border-[#2e2e2e] bg-white dark:bg-[#222222] text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] mb-2"
        >
          + New chat
        </button>

        <p className="text-xs text-gray-400 dark:text-[#666666] mt-2 px-1 mb-1">
          Today
        </p>

        {conversations.map((chat) => {
          const isActive = chat.id === activeConversationId;
          return (
            <div
              key={chat.id}
              className={`flex items-center gap-0.5 rounded-md transition-colors ${
                isActive
                  ? "bg-gray-200 dark:bg-[#2a2a2a]"
                  : "hover:bg-gray-100 dark:hover:bg-[#222222]"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setConversationMenuOpenId(null);
                  setActiveConversationId(chat.id);
                }}
                className={`flex-1 min-w-0 text-left px-3 py-2 rounded-md text-sm truncate ${
                  isActive
                    ? "text-gray-900 dark:text-[#eeeeee]"
                    : "text-gray-600 dark:text-[#aaaaaa]"
                }`}
              >
                {chat.title}
              </button>
              <div
                className="relative shrink-0 py-1 pr-1"
                data-conversation-actions
              >
                <button
                  type="button"
                  aria-label="Conversation options"
                  aria-expanded={conversationMenuOpenId === chat.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConversationMenuOpenId((id) =>
                      id === chat.id ? null : chat.id,
                    );
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-[#888888] dark:hover:bg-[#333333] dark:hover:text-[#cccccc]"
                >
                  <svg
                    aria-hidden
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <circle cx="3" cy="8" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                    <circle cx="13" cy="8" r="1.5" />
                  </svg>
                </button>
                {conversationMenuOpenId === chat.id ? (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-10 mt-0.5 min-w-[10rem] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#2e2e2e] dark:bg-[#222222]"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-[#2a2a2a]"
                      onClick={() => handleDeleteConversation(chat.id)}
                    >
                      Delete conversation
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
        >
          <span className="text-sm text-gray-500 dark:text-[#888888]">
            {isDark ? "🌙" : "☀️"}
          </span>

          {/* Track */}
          <div
            className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
              isDark ? "bg-[#555555]" : "bg-gray-300"
            }`}
          >
            {/* Thumb */}
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                isDark ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>

          <span className="text-xs text-gray-500 dark:text-[#888888]">
            {isDark ? "Dark" : "Light"}
          </span>
        </button>
      </aside>

      {/* Main area */}
      <main className="flex flex-col flex-1 min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400 dark:text-[#dddddd] text-base">
                Start a conversation below
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm bg-blue-500 text-white dark:bg-[#444444] dark:text-[#f1f1f1] break-words">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm bg-gray-100 text-gray-900 dark:bg-[#161616] dark:text-[#d4d4d4] border border-gray-200 dark:border-[#2e2e2e] break-words">
                      {message.content}
                    </div>
                  </div>
                ),
              )}
              {isAwaitingAssistant ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-2 text-sm bg-gray-100 dark:bg-[#161616] border border-gray-200 dark:border-[#2e2e2e] text-gray-500 dark:text-[#888888] animate-pulse">
                    …
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-gray-100 dark:border-[#2e2e2e]">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#2e2e2e] rounded-xl px-4 py-2">
            <input
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-[#cccccc] outline-none placeholder-gray-400 dark:placeholder-[#555555] disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder={
                isAwaitingAssistant
                  ? "Waiting for reply…"
                  : "Type a message..."
              }
              value={input}
              disabled={isAwaitingAssistant}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              className="text-sm px-3 py-1 rounded-lg bg-blue-500 dark:bg-[#444444] text-white dark:text-[#cccccc] hover:bg-blue-600 dark:hover:bg-[#4a4a4a] disabled:opacity-40"
              disabled={!input.trim() || isAwaitingAssistant}
              onClick={sendMessage}
            >
              ↑
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
