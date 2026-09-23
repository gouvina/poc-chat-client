"use client"

import { QueryInput } from "@/app/components/query/QueryInput";
import { Query } from "@/app/types/queries";

export default function QueryPage() {

    const onSubmit = (query: Query) => {
        console.log('submit')
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-[#1c1c1c]">
            <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 py-6">
                <div className="flex w-full max-w-2xl flex-1 flex-col justify-center">
                    <QueryInput onSubmit={onSubmit} />
                </div>
            </main>
        </div>
    )
}