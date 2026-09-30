"use client";

import { useConversationContext } from "@/app/context/ConversationContext";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function ConversationList() {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    handleNewChat,
    deleteConversation,
    requestRename,
  } = useConversationContext();

  const [conversationMenuOpenId, setConversationMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    const list = conversationListRef.current;

    if (!list) return;

    const handleScroll = () => {
      setConversationMenuOpenId(null);
      setMenuPosition(null);
    };

    list.addEventListener("scroll", handleScroll);

    return () => {
      list.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!conversationMenuOpenId) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (
        target instanceof Element && (
          target.closest("[data-conversation-actions]") ||
          target.closest("[data-conversation-menu]")
        )
      ) {
        return;
      }
      setConversationMenuOpenId(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [conversationMenuOpenId]);

  const conversationListRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={conversationListRef} className="conversation-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto">
        <button
          type="button"
          onClick={handleNewChat}
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
              className={`flex items-center gap-0.5 rounded-md transition-colors ${isActive
                ? "bg-gray-200 dark:bg-[#2a2a2a]"
                : "hover:bg-gray-100 dark:hover:bg-[#222222]"
                }`}
            >
              <button
                type="button"
                onClick={() => {
                  setConversationMenuOpenId(null);
                  selectConversation(chat.id);
                }}
                className={`min-w-0 flex-1 truncate rounded-md px-3 py-2 text-left text-sm ${isActive
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

                    if (conversationMenuOpenId === chat.id) {
                      setConversationMenuOpenId(null);
                      setMenuPosition(null);
                      return;
                    }

                    const rect = e.currentTarget.getBoundingClientRect();

                    setConversationMenuOpenId(chat.id);
                    setMenuPosition({
                      top: rect.top,
                      left: rect.right + 4,
                    });
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
              </div>
            </div>
          );
        })}
      </div>

      {conversationMenuOpenId && menuPosition
        ? createPortal(
          <div
            role="menu"
            data-conversation-menu
            className="fixed z-[200] w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-[#2e2e2e] dark:bg-[#222222]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]"
              onClick={() => {
                const chat = conversations.find(
                  (conversation) => conversation.id === conversationMenuOpenId
                );

                setConversationMenuOpenId(null);
                setMenuPosition(null);

                if (chat) {
                  requestRename(chat.id, chat.title);
                }
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
                setMenuPosition(null);
                void deleteConversation(conversationMenuOpenId);
              }}
            >
              Delete conversation
            </button>
          </div>,
          document.body,
        )
        : null}
    </>
  );
}
