"use client"

import { usePathname } from "next/navigation";
import { AppSidebar } from "../components/layout/AppSidebar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Section, sectionRoutes } from "../types/app";
import { LoginModal } from "../components/auth/LoginModal";

export default function AppLayout({
    children,
}: { children: React.ReactNode }) {
    const pathname = usePathname()

    const { user, isAuthenticated, isLoading, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()

    const isDark = theme === "dark"

    const activeSection =
        (Object.entries(sectionRoutes).find(
            ([, route]) => pathname.startsWith(route)
        )?.[0] as Section) ?? "chat";

    if (isLoading) {
        return null
    }

    return (
        <>
            <div className={`flex h-screen min-w-0 overflow-hidden bg-white dark:bg-[#1c1c1c] ${isAuthenticated ? "" : "pointer-events-none select-none blur-sm"}`}>
                <AppSidebar
                    user={user}
                    onLogout={logout}
                    isDark={isDark}
                    onToggleTheme={toggleTheme}
                    activeSection={activeSection}
                />
                <main className="flex min-w-0 flex-1">
                    {children}
                </main>
            </div>

            {!isAuthenticated ? <LoginModal /> : null}

        </>
    );
}
