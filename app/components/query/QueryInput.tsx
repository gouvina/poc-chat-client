"use client"

import { Query } from "@/app/types/queries";
import { useTranslations } from "next-intl";
import { useState } from "react";

type QueryInputProps = {
    onSubmit: (query: Query) => void
}

export function QueryInput({ onSubmit }: QueryInputProps) {
    const t = useTranslations('Query')
    const [question, setQuestion] = useState("")
    const [keywordInput, setKeywordInput] = useState("")
    const [keywords, setKeywords] = useState<string[]>([])
    const [isQuestionMultiline, setIsQuestionMultiline] = useState(false)

    const addKeyword = () => {
        const keyword = keywordInput.trim()

        if (!keyword || keywords.includes(keyword)) return

        setKeywords((current) => [...current, keyword])
        setKeywordInput("")
    }

    const removeKeyword = (keyword: string) => {
        setKeywords((current) => current.filter((item) => item !== keyword))
    }

    const handleKeywordKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault()
            addKeyword()
        }
    }

    const handleQuestionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = event.target

        textarea.style.height = "auto"

        const maxHeight = 360
        const height = Math.min(textarea.scrollHeight, maxHeight)

        textarea.style.height = `${height}px`
        textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden"

        setIsQuestionMultiline(height > 48)
        setQuestion(textarea.value)
    }

    const handleSubmit = () => {
        if (!question.trim()) return

        console.log({
            query: question.trim(),
            keywords
        })
    }

    return (
        <div className="relative w-full">
            <div className="flex items-center gap-3">
                <div className="relative min-w-0 flex-1">
                    <textarea
                        value={question}
                        onChange={handleQuestionChange}
                        placeholder={t('questionInput')}
                        rows={1}
                        className="
                            block w-full resize-none
                            min-h-12 max-h-[360px]
                            overflow-y-hidden small-scrollbar
                            rounded-2xl border border-gray-200
                            bg-white px-5 py-3
                            text-sm leading-6 text-gray-900 outline-none
                            placeholder:text-gray-400
                            dark:border-[#2e2e2e]
                            dark:bg-[#222222]
                            dark:text-[#eeeeee]
                            dark:placeholder:text-[#777777]
                            pr-20
                        "
                    />


                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!question.trim()}
                        aria-label={t('aria-label.sendQuestion')}
                        className={`
                            absolute right-3 mr-1
                            flex h-9 items-center justify-center
                            ${isQuestionMultiline ? "bottom-3" : "top-1/2 -translate-y-1/2"}
                            rounded-full w-9
                            text-sm font-medium
                            transition-colors
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                            bg-blue-500 text-white hover:bg-blue-600
                        `}
                    >
                        <span className="-translate-y-0.5">↑</span>
                    </button>
                </div>
            </div>

            <div className="absolute left-0 right-0 top-full mt-3">
                <div className="flex min-w-0 items-start gap-2">
                    <div className="shrink-0">
                        <div className="flex h-9 items-center rounded-full border border-gray-200 bg-white px-3 dark:border-[#2e2e2e] dark:bg-[#222222]">
                            <input
                                value={keywordInput}
                                onChange={(event) => setKeywordInput(event.target.value)}
                                onKeyDown={handleKeywordKeyDown}
                                placeholder={t('keywordsPlaceholder')}
                                className="
                                    min-w-0 flex-1
                                    bg-transparent
                                    text-xs text-gray-700
                                    outline-none
                                    placeholder:text-gray-400
                                    dark:text-[#cccccc]
                                    dark:placeholder:text-[#777777]
                                "
                            />

                            <button
                                type="button"
                                onClick={addKeyword}
                                aria-label={t('aria-label.addKeyword')}
                                className={`
                                ml-1
                                flex h-5 w-5 shrink-0
                                items-center justify-center
                                rounded-full
                                text-sm leading-none
                                text-gray-400
                                transition-colors
                                hover:bg-gray-100
                                hover:text-gray-700
                                dark:text-[#888888]
                                dark:hover:bg-[#2e2e2e]
                                dark:hover:text-[#dddddd]
                                ${keywordInput.trim() ? "opacity-100" : "pointer-events-none opacity-0"}
                            `}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {keywords.length > 0 && (
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                {keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="
                                            flex shrink-0 items-center gap-1.5
                                            rounded-full
                                            bg-gray-100 px-3 py-1.5
                                            text-xs text-gray-600
                                            dark:bg-[#2e2e2e]
                                            dark:text-[#cccccc]
                                        "
                                    >
                                        {keyword}

                                        <button
                                            type="button"
                                            onClick={() => removeKeyword(keyword)}
                                            aria-label={`${t('aria-label.remove')} ${keyword}`}
                                            className="
                                                text-gray-400
                                                hover:text-gray-700
                                                dark:text-[#888888]
                                                dark:hover:text-[#dddddd]
                                            "
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}