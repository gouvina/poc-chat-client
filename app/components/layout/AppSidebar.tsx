"use client";

import { useRouter } from "next/navigation";
import type { User } from "../../types/user";
import { ConversationList } from "../chat/ConversationList";
import { Section, sectionRoutes } from "@/app/types/app";
import { useTranslations } from "next-intl";
import { OptionsMenu } from "./OptionsMenu";
import { QueryList } from "../query/QueryList";

export type AppSidebarProps = {
    activeSection: Section
    user: User | null;
    onLogout: () => void;
    isDark: boolean;
    onToggleTheme: () => void;
};

export function AppSidebar({
    activeSection,
    user,
    onLogout,
    isDark,
    onToggleTheme,
}: AppSidebarProps) {
    const router = useRouter()
    const t = useTranslations("Sidebar")

    const navigateToSection = (section: Section) => {
        router.push(sectionRoutes[section]);
    }

    return (
        <aside className="flex min-h-0 w-52 shrink-0 flex-col border-r border-gray-200 bg-gray-50 p-3 dark:border-[#2e2e2e] dark:bg-[#161616]">
            <nav className="mb-3 space-y-1">
                <button
                    type="button"
                    onClick={() => navigateToSection("queries")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${activeSection === "queries"
                        ? "bg-gray-200 text-gray-900 dark:bg-[#2a2a2a] dark:text-[#eeeeee]"
                        : "text-gray-600 hover:bg-gray-100 dark:text-[#aaaaaa] dark:hover:bg-[#222222]"
                        }`
                    }
                >
                    {t('queries')}
                </button>

                <button
                    type="button"
                    onClick={() => navigateToSection("chat")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${activeSection === "chat"
                        ? "bg-gray-200 text-gray-900 dark:bg-[#2a2a2a] dark:text-[#eeeeee]"
                        : "text-gray-600 hover:bg-gray-100 dark:text-[#aaaaaa] dark:hover:bg-[#222222]"
                        }`
                    }
                >
                    {t('chat')}
                </button>

                <button
                    type="button"
                    onClick={() => navigateToSection("documents")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${activeSection === "documents"
                        ? "bg-gray-200 text-gray-900 dark:bg-[#2a2a2a] dark:text-[#eeeeee]"
                        : "text-gray-600 hover:bg-gray-100 dark:text-[#aaaaaa] dark:hover:bg-[#222222]"
                        }`
                    }
                >
                    {t('documents')}
                </button>
            </nav>

            <div className="mb-3 border-t border-gray-200 dark:border-[#2e2e2e]" />

            {activeSection === "chat" && (<ConversationList />)}

            {activeSection === "queries" && (<QueryList />)}

            {activeSection === "documents" && (<div className="flex-1" />)}

            <div className="-mx-3 -mb-3">
                <OptionsMenu
                    user={user}
                    isDark={isDark}
                    onLogout={onLogout}
                    onToggleTheme={onToggleTheme}
                />
            </div>
        </aside>
    );
}