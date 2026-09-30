"use client"

import { useConversationContext } from "@/app/context/ConversationContext";
import { useTranslations } from "next-intl";

export function RenameConversationModal() {
  const t = useTranslations('Chat.Rename')
  const {
    renameConversationId,
    renameTitleDraft,
    setRenameTitleDraft,
    confirmRename,
    cancelRename,
  } = useConversationContext();

  if (!renameConversationId) { return null; }

  return (
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
          {t('renameConversation')}
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
            placeholder={t('placeholderTitle')}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-[#cccccc] dark:hover:bg-[#2a2a2a]"
              onClick={cancelRename}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 dark:bg-[#444444] dark:hover:bg-[#4a4a4a]"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}