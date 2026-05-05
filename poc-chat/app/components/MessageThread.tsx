"use client";

import type { ChatMessage } from "../types/conversation";

export type MessageThreadProps = {
  messages: ChatMessage[];
  isAwaitingAssistant: boolean;
  /** Shown when there are no messages yet */
  emptyHint?: string;
};

export function MessageThread({
  messages,
  isAwaitingAssistant,
  emptyHint = "Start a conversation below",
}: MessageThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-base text-gray-400 dark:text-[#dddddd]">
            {emptyHint}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[75%] break-words rounded-2xl bg-blue-500 px-4 py-2 text-sm text-white dark:bg-[#444444] dark:text-[#f1f1f1]">
                  {message.content}
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex justify-start">
                <div className="max-w-[75%] break-words rounded-2xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-900 dark:border-[#2e2e2e] dark:bg-[#161616] dark:text-[#d4d4d4]">
                  {message.content}
                </div>
              </div>
            ),
          )}
          {isAwaitingAssistant ? (
            <div className="flex justify-start">
              <div className="animate-pulse rounded-2xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-500 dark:border-[#2e2e2e] dark:bg-[#161616] dark:text-[#888888]">
                …
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
