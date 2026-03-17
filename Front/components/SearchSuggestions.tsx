"use client"

import { useEffect, useState, useRef } from "react"
import { Briefcase, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Suggestion {
  type: "job" | "company"
  text: string
}

interface SearchSuggestionsProps {
  query: string
  onSelect: (text: string) => void
  isVisible: boolean
}

export function SearchSuggestions({ query, onSelect, isVisible }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/jobs/search-suggestions?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  if (!isVisible || (!loading && suggestions.length === 0)) {
    return null
  }

  const handleSelect = (suggestion: Suggestion) => {
    onSelect(suggestion.text)
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[selectedIndex])
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500 text-sm">Loading suggestions...</div>
      ) : (
        <div className="py-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.text}-${index}`}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className={cn(
                "w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors",
                selectedIndex === index && "bg-primary/10"
              )}
            >
              {suggestion.type === "job" ? (
                <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
              ) : (
                <Building2 className="h-4 w-4 text-secondary flex-shrink-0" />
              )}
              <span className="text-sm text-gray-900">{suggestion.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
