"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Search, ArrowRight } from "lucide-react"
import { JobCard } from "./JobCard"
import type { JobFrontend } from "@/lib/jobs"

interface AISearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EXAMPLES = [
  "Rust backend developer for DeFi protocol",
  "Senior React engineer, remote, $100k+",
  "ML engineer working on LLMs and RAG",
  "Product manager in Web3 gaming",
]

export function AISearchModal({ open, onOpenChange }: AISearchModalProps) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<JobFrontend[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(
        `/api/jobs/semantic-search?q=${encodeURIComponent(searchQuery.trim())}&limit=6`,
      )
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      setResults(data.jobs || [])
    } catch {
      setError("Failed to search. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setQuery("")
      setResults(null)
      setError(null)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI Semantic Search
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-gray-500">
            Describe the job you're looking for in natural language. Our AI will find the most relevant matches.
          </p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. Senior Rust developer for DeFi, remote, good salary"
                className="w-full h-11 pl-10 pr-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                autoFocus
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="h-11 px-5 bg-gradient-primary hover:bg-gradient-primary-hover text-white"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {!results && !loading && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Try these</p>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setQuery(ex)
                      handleSearch(ex)
                    }}
                    className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-primary/5 hover:text-primary border border-gray-100 rounded-full transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3" />
              <p className="text-sm text-gray-500">Searching with AI...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-6 text-sm text-rose-600">{error}</div>
          )}

          {results && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
              {results.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No matches found. Try a different description.
                </p>
              ) : (
                <div className="space-y-2">
                  {results.map((job) => (
                    <div key={job.id} onClick={handleClose}>
                      <JobCard job={job} compact />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
