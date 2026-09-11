"use client"

import { RenameConversationModal } from "../components/chat/RenameConversationModal";
import { AppSidebar } from "../components/layout/AppSidebar";
import { useAuth } from "../context/AuthContext";
import { ConversationProvider } from "../context/ConversationContext";
import { useTheme } from "../context/ThemeContext";

export default function AppLayout({
    children,
}: { children: React.ReactNode }) {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()

    const isDark = theme === "dark"

    return (
        <ConversationProvider>
            <div className="flex h-screen bg-white dark:bg-[#1c1c1c]">
                <AppSidebar
                    user={user}
                    onLogout={logout}
                    isDark={isDark}
                    onToggleTheme={toggleTheme}
                    activeSection="chat"
                    onSectionChange={(section) => console.log("Section ", section)}
                />
                <main className="flex min-w-0 flex-1">
                    {children}
                </main>
            </div>

            <RenameConversationModal />

        </ConversationProvider>
    );
}