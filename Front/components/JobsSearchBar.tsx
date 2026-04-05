"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, Settings, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchSuggestions } from "./SearchSuggestions"
import { QuickFilters } from "./QuickFilters"
import { AISearchModal } from "./AISearchModal"
import { cn } from "@/lib/utils"

interface QuickFilter {
  id: string
  label: string
  checked: boolean
}

interface JobsSearchBarProps {
  onSearchChange?: (query: string) => void
  defaultValue?: string
}

export function JobsSearchBar({ onSearchChange, defaultValue = "" }: JobsSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(defaultValue)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isConfigureOpen, setIsConfigureOpen] = useState(false)
  const [isAISearchOpen, setIsAISearchOpen] = useState(false)
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([
    { id: "title", label: "Title", checked: true },
    { id: "skills", label: "Skills", checked: false },
    { id: "company", label: "Company", checked: true },
    { id: "everywhere", label: "Everywhere", checked: false },
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = () => {
    onSearchChange?.(searchQuery)
    setShowSuggestions(false)
  }
  
  const onSearchChangeRef = useRef(onSearchChange)
  onSearchChangeRef.current = onSearchChange

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChangeRef.current?.(searchQuery)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSelectSuggestion = (text: string) => {
    setSearchQuery(text)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleFilterChange = (id: string, checked: boolean) => {
    setQuickFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, checked } : filter
      )
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6" ref={containerRef}>
        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Job title or company name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
              className="pl-10 h-12 text-base border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {showSuggestions && (
              <SearchSuggestions
                query={searchQuery}
                onSelect={handleSelectSuggestion}
                isVisible={showSuggestions}
              />
            )}
          </div>
          <Button
            size="lg"
            className="px-8 h-12 bg-gradient-primary hover:bg-gradient-primary-hover text-white font-medium shadow-sm"
            onClick={handleSearch}
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>

        {/* Configure Filters Section */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isConfigureOpen ? "max-h-[200px] opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"
          )}
        >
          <div className="space-y-3 pb-2">
            <h4 className="font-medium text-sm text-gray-900">Search Scope</h4>
            <QuickFilters
              filters={quickFilters}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-300 mb-4"></div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          {/* Left side - Configure */}
          <button
            type="button"
            onClick={() => setIsConfigureOpen(!isConfigureOpen)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Configure</span>
          </button>

          {/* Right side - AI Search and How to search */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsAISearchOpen(true)}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 font-medium transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Search</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>How to search?</span>
              {isInstructionsOpen ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Instructions Section */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out border-t border-dashed border-gray-300 mt-4",
            isInstructionsOpen ? "max-h-[800px] opacity-100 pt-4" : "max-h-0 opacity-0 pt-0"
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

      <AISearchModal open={isAISearchOpen} onOpenChange={setIsAISearchOpen} />
    </>
  )
}
