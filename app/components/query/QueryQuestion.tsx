"use client"

import { useEffect, useRef, useState } from "react"

type NewQuery = {
    id: string
    question: string
    keywords: string[]
}

type QueryQuestionProps = {
    question: string | undefined
    newQuery: NewQuery | null
    animationFinished: boolean
    onAnimationFinished: () => void
}

function QuestionLoading() {
    return (
        <div className="flex justify-end">
            <div className="h-12 w-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#282828]" />
        </div>
    )
}

export function QueryQuestion({
    question,
    newQuery,
    animationFinished,
    onAnimationFinished,
}: QueryQuestionProps) {
    const [animateQuery, setAnimateQuery] = useState(false)
    const [questionWidth, setQuestionWidth] = useState<number | null>(null)

    const questionRef = useRef<HTMLDivElement>(null)

    function getQuestionWidth(element: HTMLDivElement) {
        const availableWidth = element.parentElement?.clientWidth ?? 0

        const previousWidth = element.style.width
        const previousMaxWidth = element.style.maxWidth

        element.style.width = "max-content"
        element.style.maxWidth = "none"

        const naturalWidth = element.getBoundingClientRect().width
        const width = Math.min(naturalWidth, availableWidth * 0.8)

        element.style.width = previousWidth
        element.style.maxWidth = previousMaxWidth

        return width
    }

    useEffect(() => {
        if (!newQuery || !questionRef.current) return

        const width = getQuestionWidth(questionRef.current)

        setQuestionWidth(width)

        let frame1: number | undefined
        let frame2: number | undefined
        let finishTimeout: ReturnType<typeof setTimeout> | undefined

        frame1 = requestAnimationFrame(() => {
            frame2 = requestAnimationFrame(() => {
                setAnimateQuery(true)

                finishTimeout = setTimeout(() => {
                    onAnimationFinished()
                }, 400)
            })
        })

        return () => {
            if (frame1 !== undefined) cancelAnimationFrame(frame1)
            if (frame2 !== undefined) cancelAnimationFrame(frame2)
            if (finishTimeout !== undefined) clearTimeout(finishTimeout)
        }
    }, [newQuery, onAnimationFinished])

    return (
        <div className={`relative ${newQuery && !animationFinished ? "min-h-full" : ""}`}>
            <div
                style={
                    newQuery
                        ? {
                            position: animationFinished ? "relative" : "absolute",
                            left: animationFinished ? undefined : 0,
                            right: animationFinished ? undefined : 0,
                            top: animationFinished
                                ? undefined
                                : (animateQuery ? 0 : "50%"),
                            transform: animationFinished
                                ? undefined
                                : (animateQuery
                                    ? "translateY(0)"
                                    : "translateY(-50%)"),
                            transition: "top 400ms ease-out, transform 400ms ease-out",
                        }
                        : undefined
                }
            >
                {question || newQuery?.question ? (
                    <div className="flex justify-end">
                        <div
                            ref={questionRef}
                            style={
                                newQuery
                                    ? {
                                        width: animateQuery
                                            ? `${questionWidth}px`
                                            : "100%",
                                    }
                                    : undefined
                            }
                            className={`
                                ${newQuery ? "max-w-[100%]" : "max-w-[80%]"}
                                transition-[width] duration-[300ms] ease-out
                                rounded-2xl bg-gray-100
                                px-5 py-3
                                text-sm leading-6
                                text-gray-900
                                dark:bg-[#282828]
                                dark:text-[#eeeeee]
                            `}
                        >
                            {newQuery ? newQuery.question : question}
                        </div>
                    </div>
                ) : (
                    <QuestionLoading />
                )}
            </div>
        </div>
    )
}