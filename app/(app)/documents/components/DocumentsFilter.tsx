"use client"

import { Search, ListFilter, Trash, ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function DocumentsFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [text, setText] = useState("")
    const [version, setVersion] = useState("")
    const [roll, setRoll] = useState("")
    const [score, setScore] = useState("")
    const [scoreOperator, setScoreOperator] = useState<"<" | ">">("<")

    function applyFilters() {
        const params = new URLSearchParams(searchParams.toString())

        params.delete("text")
        params.delete("version")
        params.delete("rollId")
        params.delete("scoregt")
        params.delete("scorelt")

        if (text.trim()) {
            params.set("text", text.trim())
        }

        if (version !== "") {
            params.set("version", version)
        }

        if (roll !== "") {
            params.set("rollId", roll)
        }

        if (score !== "") {
            scoreOperator === "<" ? params.set("scorelt", score) : params.set("scoregt", score)
        }

        const queryString = params.toString()
        router.push(queryString ? `${pathname}?${queryString}` : pathname)
    }

    function clearFilters() {
        setText("")
        setVersion("")
        setRoll("")
        setScore("")
    }

    return (
        <div className="flex w-full justify-self-end items-center gap-3 rounded-md p-2 bg-[#222222]">
            {/* Text search */}
            <div className="relative min-w-0 flex-1 mr-3">
                <Search
                    size={15}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#888888]"
                />

                <input
                    type="text"
                    placeholder="Search document text..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="h-8 w-full rounded-md border border-gray-200 bg-gray-100 pl-8 pr-2 text-sm text-gray-800 outline-none focus:border-gray-300 dark:border-[#2e2e2e] dark:bg-[#333333] dark:text-[#dddddd] dark:placeholder:text-[#888888]"
                />
            </div>

            {/* Version */}
            <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-sm text-gray-500 dark:text-[#888888]">
                    Version
                </span>
                <input
                    type="number"
                    min="0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="
                        h-7 w-9 rounded-md border border-gray-200 
                        bg-gray-100 px-1.5 text-sm text-gray-800 outline-none 
                        focus:border-gray-300 
                        dark:border-[#2e2e2e] dark:bg-[#333333] dark:text-[#dddddd]"
                />
            </div>

            {/* Roll */}
            <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-sm text-gray-500 dark:text-[#888888]">
                    Roll
                </span>
                <input
                    type="number"
                    min="0"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                    className="
                        h-7 w-9 rounded-md border border-gray-200 
                        bg-gray-100 px-1.5 text-sm text-gray-800 outline-none 
                        focus:border-gray-300 
                        dark:border-[#2e2e2e] dark:bg-[#333333] dark:text-[#dddddd]"
                />
            </div>

            {/* Score */}
            <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-sm text-gray-500 dark:text-[#888888]">
                    Score
                </span>

                <button
                    type="button"
                    onClick={() =>
                        setScoreOperator((prev) => prev === "<" ? ">" : "<")
                    }
                    aria-label="Toggle score comparison operator"
                    className="
                        flex h-6 w-6 items-center justify-center rounded-md
                        border border-gray-300/50 bg-gray-200/20 text-gray-500 
                        transition-colors hover:bg-gray-200/60 hover:text-gray-800 
                        dark:border-[#ffffff0a] dark:bg-[#ffffff05] dark:text-[#aaaaaa] 
                        dark:hover:border-[#ffffff15] dark:hover:bg-[#ffffff0d] dark:hover:text-[#dddddd]"
                >
                    {scoreOperator === "<" ? (
                        <ChevronLeft size={16} strokeWidth={2} />
                    ) : (
                        <ChevronRight size={16} strokeWidth={2} />
                    )}
                </button>

                <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="
                        h-7 w-11 rounded-md border border-gray-200 
                        bg-gray-100 px-1.5 text-sm text-gray-800 outline-none 
                        focus:border-gray-300 
                        dark:border-[#2e2e2e] dark:bg-[#333333] dark:text-[#dddddd]"
                />
            </div>

            {/* Apply filters */}
            <button
                type="button"
                aria-label="Apply filters"
                title="Apply filters"
                onClick={applyFilters}
                className="
                    flex h-8 w-8 shrink-0 items-center justify-center rounded-md 
                    text-gray-500 transition-colors 
                    hover:bg-gray-100 hover:text-gray-800 
                    dark:text-[#888888] dark:hover:bg-[#292929] dark:hover:text-[#dddddd]"
            >
                <ListFilter size={17} strokeWidth={1.8} />
            </button>

            {/* Clear filters */}
            <button
                type="button"
                aria-label="Clear filters"
                title="Clear filters"
                onClick={clearFilters}
                className="
                    -ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md 
                    text-gray-500 transition-colors 
                    hover:bg-gray-100 hover:text-red-500 
                    dark:text-[#888888] dark:hover:bg-[#292929] dark:hover:text-red-400"
            >
                <Trash size={16} strokeWidth={1.8} />
            </button>
        </div>
    )
}
