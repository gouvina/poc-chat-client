"use client"

import { Search } from "lucide-react"

export function DocumentsFilter() {
    return (
        <div className="w-1/2 max-w-2xl">
            <div className="relative w-full">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#888888]"
                />

                <input
                    type="text"
                    placeholder="Search document text..."
                    className="h-9 w-full rounded-md border border-gray-200 bg-gray-100 pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-gray-300 dark:border-[#2e2e2e] dark:bg-[#333333] dark:text-[#dddddd] dark:placeholder:text-[#888888]"
                />
            </div>

            <div className="mt-3 flex items-center justify-end gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-500 dark:text-[#888888]">
                        Version
                    </span>

                    <input
                        type="number"
                        min="0"
                        className="h-6 w-8 rounded-sm border border-gray-200 bg-gray-100 px-2 text-sm text-gray-800 outline-none focus:border-gray-300 dark:border-[#2e2e2e] dark:bg-[#333333] dark:text-[#dddddd]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-[#888888]">
                        Roll
                    </span>

                    <input
                        type="number"
                        min="0"
                        className="h-6 w-8 rounded-sm border border-gray-200 bg-gray-100 px-2 text-sm text-gray-800 outline-none focus:border-gray-300 dark:border-[#2e2e2e] dark:bg-[#333333] dark:text-[#dddddd]"
                    />
                </div>

                <div className="flex items-center gap-1.5">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        className="h-6 w-11 rounded-sm border border-gray-200 bg-gray-100 px-2 text-sm text-gray-800 outline-none focus:border-gray-300 dark:border-[#2e2e2e] dark:bg-[#333333] dark:text-[#dddddd]"
                    />

                    <span className="text-sm text-gray-500 dark:text-[#888888]">
                        &lt;
                    </span>

                    <span className="text-sm text-gray-500 dark:text-[#888888]">
                        Score
                    </span>

                    <span className="text-sm text-gray-500 dark:text-[#888888]">
                        &lt;
                    </span>

                    <input
                        type="number"
                        min="0"
                        max="100"
                        className="h-6 w-11 rounded-sm border border-gray-200 bg-gray-100 px-2 text-sm text-gray-800 outline-none focus:border-gray-300 dark:border-[#2e2e2e] dark:bg-[#333333] dark:text-[#dddddd]"
                    />
                </div>
            </div>
        </div>
    )
}
