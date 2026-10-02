"use client";

import {
  getConversations,
  deleteConversation as deleteConversationApi,
  updateConversation as updateConversationApi,
} from "@/app/api/services/conversations";
import { useAuth } from "@/app/context/AuthContext";
import { Conversation } from "@/app/types/conversation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RenameConversationModal } from "./RenameConversationModal";
import { ScrollingText } from "../layout/ScrollingText";

export function ConversationList() {
  const t = useTranslations('Chat')
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [conversationMenuOpenId, setConversationMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [renameConversationId, setRenameConversationId] = useState<string | null>(null)
  const [renameTitle, setRenameTitle] = useState("");

  const conversationListRef = useRef<HTMLDivElement>(null);
  const conversationRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || !isAuthenticated) return

      try {
        const data = await getConversations(user.id)
        setConversations(data)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [user, isAuthenticated, pathname])

  // Handle menus when scrolling
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

  // Handle menu close
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

  const moveConversationToTop = useCallback((conversationId: string) => {
    const elements = conversationRefs.current;

    const firstPositions = new Map<string, number>();

    Object.entries(elements).forEach(([id, element]) => {
      if (element) {
        firstPositions.set(id, element.getBoundingClientRect().top);
      }
    });

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, updatedAt: new Date().toISOString() }
          : conversation
      )
    );

    requestAnimationFrame(() => {
      Object.entries(elements).forEach(([id, element]) => {
        if (!element) return;

        const firstTop = firstPositions.get(id);
        if (firstTop === undefined) return;

        const lastTop = element.getBoundingClientRect().top;
        const deltaY = firstTop - lastTop;

        if (deltaY === 0) return;

        element.style.transform = `translateY(${deltaY}px)`;
        element.style.transition = "none";

        requestAnimationFrame(() => {
          element.style.transform = "";
          element.style.transition = "transform 160ms ease-out";
        });
      });
    });
  }, [])

  // Handle conversation update on message
  useEffect(() => {
    const handleConversationUpdated = (event: Event) => {
      const { conversationId } = (event as CustomEvent<{ conversationId: string }>).detail

      moveConversationToTop(conversationId)
    }

    window.addEventListener("conversation-updated", handleConversationUpdated)

    return () => {
      window.removeEventListener(
        "conversation-updated",
        handleConversationUpdated
      )
    }
  }, [moveConversationToTop])

  const handleNewConversation = () => {
    router.push("/chat")
  }

  const handleSelectConversation = (conversationId: string) => {
    router.push(`/chat/${conversationId}`)
  }

  async function deleteConversation(conversationId: string) {
    try {
      await deleteConversationApi(conversationId);

      setConversations((prev) => prev.filter((conversation) => conversation.id !== conversationId))
    } catch (err) {
      console.error(t('errors.deleteConversationFail'), err);
    }
  }

  async function renameConversation(title: string,) {
    if (!renameConversationId) return

    try {
      await updateConversationApi(renameConversationId, title)

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === renameConversationId
            ? { ...conversation, title }
            : conversation
        )
      )

      setRenameTitle("")
      setRenameConversationId(null)
    } catch (err) {
      console.error(t("errors.renameConversationFail"), err)
    }
  }

  const sortedConversations = [...conversations].sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())

  return (
    <>
      <div ref={conversationListRef} className="small-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto">

        {/* New Chat Button */}
        <button
          type="button"
          onClick={handleNewConversation}
          className="mb-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 dark:border-[#2e2e2e] dark:bg-[#222222] dark:text-gray-300 dark:hover:bg-[#2a2a2a]"
        >
          {`+ ${t('newChat')}`}
        </button>

        <p className="mb-1 mt-2 px-1 text-xs text-gray-400 dark:text-[#666666]">
          {t('recents')}
        </p>

        {/* Conversation List */}
        {isLoading ? (
          <div className="px-3 py-2 text-sm text-gray-400">
            {t('loading')}
          </div>
        ) : (
          <div>
            {sortedConversations.map((chat) => {
              return (
                <div
                  key={chat.id}
                  ref={(element) => {
                    conversationRefs.current[chat.id] = element
                  }}
                  className={`
                    flex items-center gap-0.5 rounded-md transition-colors
                    ${pathname === `/chat/${chat.id}`
                      ? "bg-gray-200 dark:bg-[#2a2a2a]"
                      : "hover:bg-gray-100 dark:hover:bg-[#222222]"
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setConversationMenuOpenId(null);
                      handleSelectConversation(chat.id);
                    }}
                    className={`
                      min-w-0 flex-1 truncate rounded-md px-3 py-2 text-left text-sm
                      ${pathname === `/chat/${chat.id}`
                        ? "text-gray-900 dark:text-[#eeeeee]"
                        : "text-gray-600 dark:text-[#aaaaaa]"
                      }
                    `}
                  >
                    <ScrollingText>
                      {chat.title}
                    </ScrollingText>
                  </button>

                  {/* Menu Button */}
                  <div
                    className="relative shrink-0 py-1 pr-1"
                    data-conversation-actions
                  >
                    <button
                      type="button"
                      aria-label={t('conversationOptions')}
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
        )}
      </div>

      {/* Conversation Menu*/}
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
                  setRenameTitle(chat.title);
                  setRenameConversationId(chat.id)
                }
              }}
            >
              {t('rename')}
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
              {t('deleteConversation')}
            </button>
          </div>,
          document.body,
        )
        : null}

      {renameConversationId && (
        <RenameConversationModal
          title={renameTitle}
          onChangeTitle={setRenameTitle}
          onSave={() => void renameConversation(renameTitle)}
          onCancel={() => {
            setConversationMenuOpenId(null)
            setRenameConversationId(null)
          }}
        />
      )}
    </>
  );
}
