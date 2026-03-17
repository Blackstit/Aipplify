"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: "top" | "bottom" | "left" | "right"
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none",
            sideClasses[side],
            "before:content-[''] before:absolute before:border-4 before:border-transparent",
            side === "top" && "before:top-full before:left-1/2 before:-translate-x-1/2 before:border-t-gray-900",
            side === "bottom" && "before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-b-gray-900",
            side === "left" && "before:left-full before:top-1/2 before:-translate-y-1/2 before:border-l-gray-900",
            side === "right" && "before:right-full before:top-1/2 before:-translate-y-1/2 before:border-r-gray-900"
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>
}

export function TooltipContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <>{children}</>
}
