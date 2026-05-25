"use client";
import { useEffect, useRef, useState } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { MessageThread } from "./components/MessageThread";
import { useTheme } from "./context/ThemeContext";
import { useConversation } from "./hooks/useConversation";

export default function Home() {
  const {
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

  function handleDeleteConversation(conversationId: string) {
    deleteConversation(conversationId);
    // Future: await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' })
  }

  function confirmRename() {
    if (!renameConversationId) return;
    setConversationTitle(renameConversationId, renameTitleDraft);
    setRenameConversationId(null);
    setRenameTitleDraft("");
    // Future: PATCH /api/conversations/:id { title }
  }

  function cancelRename() {
    setRenameConversationId(null);
    setRenameTitleDraft("");
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#1c1c1c]">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewChat={handleNewChat}
        onRenameRequest={requestRename}
        onDeleteConversation={handleDeleteConversation}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main area */}
      <main className="flex min-w-0 flex-1 flex-col">
        <MessageThread
          messages={messages}
          isAwaitingAssistant={isAwaitingAssistant}
        />

        {/* Input bar */}
        <div className="p-4 border-t border-gray-100 dark:border-[#2e2e2e]">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#2e2e2e] rounded-xl px-4 py-2">
            <input
              ref={messageInputRef}
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
    </div>
  );
}
