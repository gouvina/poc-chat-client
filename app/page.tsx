"use client";
import { useEffect, useRef, useState } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { LoginModal } from "./components/LoginModal";
import { MessageThread } from "./components/MessageThread";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { useConversation } from "./hooks/useConversation";

export default function Home() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const {
    conversations,
    activeConversationId,
    selectConversation,
    isLoading,
    messages,
    isAwaitingAssistant,
    input,
    setInput,
    handleNewChat,
    sendMessage,
    deleteConversation,
    setConversationTitle,
  } = useConversation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [renameConversationId, setRenameConversationId] = useState<
    string | null
  >(null);
  const [renameTitleDraft, setRenameTitleDraft] = useState("");

  const messageInputRef = useRef<HTMLInputElement>(null);
  const prevAwaitingAssistant = useRef(isAwaitingAssistant);

  useEffect(() => {
    const wasAwaiting = prevAwaitingAssistant.current;
    prevAwaitingAssistant.current = isAwaitingAssistant;
    if (!wasAwaiting || isAwaitingAssistant || renameConversationId) return;
    queueMicrotask(() => {
      messageInputRef.current?.focus();
    });
  }, [isAwaitingAssistant, renameConversationId]);

  useEffect(() => {
    if (!renameConversationId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRenameConversationId(null);
        setRenameTitleDraft("");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [renameConversationId]);

  function requestRename(conversationId: string, currentTitle: string) {
    setRenameConversationId(conversationId);
    setRenameTitleDraft(currentTitle);
  }

  async function handleDeleteConversation(conversationId: string) {
    await deleteConversation(conversationId);
  }

  async function confirmRename() {
    if (!renameConversationId) return;
    await setConversationTitle(renameConversationId, renameTitleDraft);
    setRenameConversationId(null);
    setRenameTitleDraft("");
  }

  function cancelRename() {
    setRenameConversationId(null);
    setRenameTitleDraft("");
  }

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-sm text-gray-400 dark:bg-[#1c1c1c] dark:text-[#888888]">
        Loading…
      </div>
    );
  }

  const isChatDisabled = !isAuthenticated;

  return (
    <div className="relative flex h-screen bg-white dark:bg-[#1c1c1c]">
      <div
        className={`flex min-h-0 flex-1 ${isChatDisabled ? "pointer-events-none select-none blur-sm" : ""}`}
        aria-hidden={isChatDisabled}
      >
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onNewChat={handleNewChat}
          onRenameRequest={requestRename}
          onDeleteConversation={handleDeleteConversation}
          user={user}
          onLogout={logout}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400 dark:text-[#888888]">
              Loading conversations…
            </div>
          ) : (
            <MessageThread
              messages={messages}
              isAwaitingAssistant={isAwaitingAssistant}
            />
          )}

          <div className="border-t border-gray-100 p-4 dark:border-[#2e2e2e]">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 dark:border-[#2e2e2e] dark:bg-[#161616]">
              <input
                ref={messageInputRef}
                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#cccccc] dark:placeholder-[#555555]"
                placeholder={
                  isAwaitingAssistant ? "Waiting for reply…" : "Type a message..."
                }
                value={input}
                disabled={isLoading /*|| isAwaitingAssistant*/ || isChatDisabled}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <button
                className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:opacity-40 dark:bg-[#444444] dark:text-[#cccccc] dark:hover:bg-[#4a4a4a]"
                disabled={
                  isLoading || !input.trim() || isAwaitingAssistant || isChatDisabled
                }
                onClick={() => void sendMessage()}
              >
                ↑
              </button>
            </div>
          </div>
        </main>
      </div>

      {renameConversationId ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) cancelRename();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-conversation-title"
            className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-[#2e2e2e] dark:bg-[#222222]"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <h2
              id="rename-conversation-title"
              className="text-sm font-medium text-gray-900 dark:text-[#eeeeee]"
            >
              Rename conversation
            </h2>
            <form
              className="mt-3"
              onSubmit={(e) => {
                e.preventDefault();
                confirmRename();
              }}
            >
              <input
                autoFocus
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-[#3a3a3a] dark:bg-[#1a1a1a] dark:text-[#e0e0e0] dark:focus:border-[#555555]"
                value={renameTitleDraft}
                onChange={(e) => setRenameTitleDraft(e.target.value)}
                placeholder="Title"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-[#cccccc] dark:hover:bg-[#2a2a2a]"
                  onClick={cancelRename}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 dark:bg-[#444444] dark:hover:bg-[#4a4a4a]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isChatDisabled ? <LoginModal /> : null}
    </div>
  );
}
