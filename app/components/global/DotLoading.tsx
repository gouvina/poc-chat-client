export function DotLoading() {
    return (
        <div className="flex items-center gap-1 py-2">
            <span className="loading-dot h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-[#cecece]" />
            <span className="loading-dot h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-[#cecece]" style={{ animationDelay: "150ms" }} />
            <span className="loading-dot h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-[#cecece]" style={{ animationDelay: "300ms" }} />
        </div>
    )
}