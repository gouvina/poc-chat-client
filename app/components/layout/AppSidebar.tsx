"use client";

import type { User } from "../../types/user";
import { ConversationList } from "../chat/ConversationList";
import { Section } from "@/app/types/app";

export type AppSidebarProps = {
    activeSection: Section
    onSectionChange: (section: Section) => void
    user: User | null;
    onLogout: () => void;
    isDark: boolean;
    onToggleTheme: () => void;
};

export function AppSidebar({
    activeSection,
    onSectionChange,
    user,
    onLogout,
    isDark,
    onToggleTheme,
}: AppSidebarProps) {
    return (
        <aside className="flex min-h-0 w-52 shrink-0 flex-col border-r border-gray-200 bg-gray-50 p-3 dark:border-[#2e2e2e] dark:bg-[#161616]">
            <nav className="mb-3 space-y-1">
                <button
                    type="button"
                    onClick={() => onSectionChange("chat")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${activeSection === "chat"
                        ? "bg-gray-200 text-gray-900 dark:bg-[#2a2a2a] dark:text-[#eeeeee]"
                        : "text-gray-600 hover:bg-gray-100 dark:text-[#aaaaaa] dark:hover:bg-[#222222]"
                        }`
                    }
                >
                    Chat
                </button>

                <button
                    type="button"
                    onClick={() => onSectionChange("documents")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${activeSection === "documents"
                        ? "bg-gray-200 text-gray-900 dark:bg-[#2a2a2a] dark:text-[#eeeeee]"
                        : "text-gray-600 hover:bg-gray-100 dark:text-[#aaaaaa] dark:hover:bg-[#222222]"
                        }`
                    }
                >
                    Documents
                </button>
            </nav>

            <div className="mb-3 border-t border-gray-200 dark:border-[#2e2e2e]" />

            {activeSection === "chat" && (<ConversationList />)}

            {user ? (
                <div className="mb-2 rounded-md border border-gray-200 bg-white px-3 py-2 dark:border-[#2e2e2e] dark:bg-[#222222]">
                    <p className="truncate text-xs text-gray-500 dark:text-[#777777]">
                        {user.email}
                    </p>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="mt-2 text-xs text-gray-500 hover:text-gray-800 dark:text-[#888888] dark:hover:text-[#cccccc]"
                    >
                        Sign out
                    </button>
                </div>
            ) : null}

            <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-[#222222]"
            >
                <span className="text-sm text-gray-500 dark:text-[#888888]">
                    {isDark ? "🌙" : "☀️"}
                </span>

                <div className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${isDark ? "bg-[#555555]" : "bg-gray-300"}`}>
                    <div className={
                        `absolute 
                    left-0.5 
                    top-0.5 
                    h-4 w-4 
                    rounded-full 
                    bg-white 
                    shadow 
                    transition-transform 
                    duration-300 
                    ${isDark ? "translate-x-4" : "translate-x-0"}`
                    } />
                </div>

                <span className="text-xs text-gray-500 dark:text-[#888888]">
                    {isDark ? "Dark" : "Light"}
                </span>
            </button>
        </aside>
    );
}