"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export function SearchInstructions() {
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span>How to search?</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-[600px] max-w-[calc(100vw-2rem)]",
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p className="font-medium text-gray-900">
            It's best to use search in combination with filters.
          </p>

          <div className="space-y-2">
            <p className="font-medium text-gray-900">Minus Words:</p>
            <p>
              You can use minus words. <code className="px-2 py-1 bg-gray-100 rounded text-primary font-mono text-xs">qa -java</code> will show QA vacancies without Java in the selected fields. Or use excluding filters.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-gray-900">Boolean Search:</p>
            <p>
              You can use OR/AND operators for grouping in a search query, for example:{" "}
              <code className="px-2 py-1 bg-gray-100 rounded text-primary font-mono text-xs">
                Data Analyst OR Business Analyst
              </code>
              . This mode searches ONLY in the job title field, use it when you are looking for several positions.
            </p>
          </div>

          <a
            href="#"
            className="inline-flex items-center text-primary hover:underline font-medium"
          >
            Full guide to search and filters →
          </a>
        </div>
      </div>
    </div>
  )
}
