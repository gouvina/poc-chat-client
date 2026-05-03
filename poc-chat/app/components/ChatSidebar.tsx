"use client";

import { useEffect, useState } from "react";
import type { Conversation } from "../types/conversation";

export type ChatSidebarProps = {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  onRenameRequest: (conversationId: string, currentTitle: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
};

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameRequest,
  onDeleteConversation,
  isDark,
  onToggleTheme,
}: ChatSidebarProps) {
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

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-gray-200 bg-gray-50 p-3 dark:border-[#2e2e2e] dark:bg-[#161616]">
      <button
        type="button"
        onClick={onNewChat}
        className="mb-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 dark:border-[#2e2e2e] dark:bg-[#222222] dark:text-gray-300 dark:hover:bg-[#2a2a2a]"
      >
        + New chat
      </button>

      <p className="mb-1 mt-2 px-1 text-xs text-gray-400 dark:text-[#666666]">
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
                onSelectConversation(chat.id);
              }}
              className={`min-w-0 flex-1 truncate rounded-md px-3 py-2 text-left text-sm ${
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
                    className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setConversationMenuOpenId(null);
                      onRenameRequest(chat.id, chat.title);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setConversationMenuOpenId(null);
                      onDeleteConversation(chat.id);
                    }}
                  >
                    Delete conversation
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      <div className="flex-1" />

      <button
        type="button"
        onClick={onToggleTheme}
        className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-[#222222]"
      >
        <span className="text-sm text-gray-500 dark:text-[#888888]">
          {isDark ? "🌙" : "☀️"}
        </span>
        <div
          className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${
            isDark ? "bg-[#555555]" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
              isDark ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
        <span className="text-xs text-gray-500 dark:text-[#888888]">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    </aside>
  );
}
