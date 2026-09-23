"use client"

import { useEffect, useRef, useState } from "react"

type ScrollingTextProps = {
    children: string
}

const SCROLL_SPEED = 30 // pixels per second

export function ScrollingText({ children }: ScrollingTextProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)

    const [isHovered, setIsHovered] = useState(false)
    const [isScrolling, setIsScrolling] = useState(false)
    const [scrollDistance, setScrollDistance] = useState(0)

    useEffect(() => {
        const container = containerRef.current
        const text = textRef.current

        if (!container || !text) return

        const distance = Math.max(
            0,
            text.scrollWidth - container.clientWidth
        )

        setScrollDistance(distance)
    }, [children, isHovered])

    const duration = scrollDistance / SCROLL_SPEED

    const handleMouseEnter = () => {
        setIsHovered(true)
        setIsScrolling(false)

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIsScrolling(true)
            })
        })
    }

    const handleMouseLave = () => {
        setIsScrolling(false)
        setIsHovered(false)
    }

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLave}
        >
            {isHovered ? (
                <div
                    ref={containerRef}
                    className="min-w-0 overflow-hidden whitespace-nowrap"
                >
                    <div
                        ref={textRef}
                        style={{
                            transform:
                                isScrolling && scrollDistance > 0
                                    ? `translateX(-${scrollDistance}px)`
                                    : "translateX(0)",
                            transition:
                                isScrolling && scrollDistance > 0
                                    ? `transform ${duration}s linear`
                                    : "none",
                        }}
                    >
                        {children}
                    </div>
                </div>
            ) : (
                <div className="truncate">
                    {children}
                </div>
            )}
        </div>
    )
}