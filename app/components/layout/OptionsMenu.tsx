"use client"

import { User } from "@/app/types/user"
import { locales } from "@/i18n/config"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"

type OptionsMenuProps = {
    user: User | null
    isDark: boolean
    onLogout: () => void
    onToggleTheme: () => void
}

export function OptionsMenu({
    user,
    isDark,
    onLogout,
    onToggleTheme
}: OptionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations('Sidebar.Options')

    function handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const nextLocale = event.target.value

        document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`

        router.refresh()
    }
    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between px-3 py-2 transition-colors border-y border-gray-200 dark:border-[#2e2e2e] hover:bg-gray-100 dark:hover:bg-[#222222]"
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-[#888888]">
                        ⚙
                    </span>

                    <span className="text-sm text-gray-500 dark:text-[#888888]">
                        {t('title')}
                    </span>
                </div>

                <span className={`text-xs text-gray-400 transition-transform duration-200 ${isOpen ? "" : "rotate-180"}`}>
                    ▼
                </span>
            </button>

            <div className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="bg-gray-50 px-3 py-4 dark:bg-[#161616]">
                        {/* Theme Selector */}
                        <button
                            type="button"
                            onClick={onToggleTheme}
                            className="flex w-full items-center gap-3 rounded-md py-1.5 transition-colors"
                        >
                            <div className={`relative h-6 w-[52px] rounded-full transition-colors duration-300 ${isDark ? "bg-[#555555]" : "bg-gray-300"}`}>
                                <span className="absolute inset-0 flex items-center justify-between px-1.5 text-[11px]">
                                    <span>🌙</span>
                                    <span>☀️</span>
                                </span>

                                <div className={`
                                    absolute
                                    left-0.5 top-0.5
                                    h-5 w-5
                                    rounded-full
                                    bg-white
                                    shadow
                                    transition-transform
                                    duration-300
                                    ${isDark ? "translate-x-7" : "translate-x-0"}`
                                } />
                            </div>

                            <span className="text-sm text-gray-500 dark:text-[#888888]">
                                {isDark ? t('darkTheme') : t('lightTheme')}
                            </span>
                        </button>

                        {/* Language Selector */}
                        <div className="mt-3 flex items-center justify-between gap-2">
                            <label htmlFor="language" className="shrink-0 text-sm text-gray-500 dark:text-[#888888]">
                                {t('language')}
                            </label>

                            <select
                                id="language"
                                value={locale}
                                onChange={handleLanguageChange}
                                className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none dark:border-[#3a3a3a] dark:bg-[#292929] dark:text-[#cccccc]"
                            >
                                {locales.map((locale) => (
                                    <option key={locale} value={locale}>
                                        {t(`languages.${locale}`)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Log Out */}
                        {user ? (
                            <div className="mt-4 rounded-md bg-white px-2.5 py-2 dark:bg-[#292929]">
                                <p className="truncate text-xs text-gray-500 dark:text-[#777777]">
                                    {user.email}
                                </p>

                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className="mt-2 text-sm text-gray-500 hover:text-gray-800 dark:text-[#888888] dark:hover:text-[#cccccc]"
                                >
                                    {t('signOut')}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    )
}