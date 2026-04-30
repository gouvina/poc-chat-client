"use client";
import { useState } from "react";
import { useTheme } from "./context/ThemeContext";

const pastChats = [
  { id: 1, title: "Chat about Next.js" },
  { id: 2, title: "React hooks question" },
  { id: 3, title: "CSS layout help" },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const sendMessage = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    setMessages((prevMessages) => [...prevMessages, trimmedInput]);
    setInput("");
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#1c1c1c]">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-gray-200 dark:border-[#2e2e2e] bg-gray-50 dark:bg-[#161616] flex flex-col p-3">
        <button className="w-full text-left px-3 py-2 rounded-md border border-gray-200 dark:border-[#2e2e2e] bg-white dark:bg-[#222222] text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] mb-2">
          + New chat
        </button>

        <p className="text-xs text-gray-400 dark:text-[#666666] mt-2 px-1 mb-1">
          Today
        </p>

        {pastChats.map((chat) => (
          <button
            key={chat.id}
            className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 dark:text-[#aaaaaa] hover:bg-gray-100 dark:hover:bg-[#222222] truncate"
          >
            {chat.title}
          </button>
        ))}

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
              {messages.map((message, index) => (
                <div key={`${message}-${index}`} className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm bg-blue-500 text-white dark:bg-[#444444] dark:text-[#f1f1f1] break-words">
                    {message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-gray-100 dark:border-[#2e2e2e]">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#2e2e2e] rounded-xl px-4 py-2">
            <input
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-[#cccccc] outline-none placeholder-gray-400 dark:placeholder-[#555555]"
              placeholder="Type a message..."
              value={input}
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
              disabled={!input.trim()}
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
