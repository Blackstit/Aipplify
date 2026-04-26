"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScoreBadge } from "@/components/ScoreBadge"
import { Search, Sparkles, Loader2, Briefcase, Users } from "lucide-react"
import type { JobFrontend } from "@/lib/jobs"
import type { LandingJob } from "@/lib/landing-data"

const REGULAR_EXAMPLES = [
  "Job title, skill, or company...",
  "Senior ML Engineer",
  "Remote React Developer",
  "Product Manager at a fintech",
  "Solidity Developer, $150K+",
]
const AI_EXAMPLES = [
  "Describe your ideal job in natural language...",
  "Senior ML engineer at a well-funded AI startup",
  "Remote Solidity developer, 3+ yrs, green team",
  "Data scientist, full-time, $150K+, EU time zone",
]

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<{ type: string; text: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiMode, setAiMode] = useState(false)
  const [aiResults, setAiResults] = useState<LandingJob[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [rotIdx, setRotIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query) return
    const list = aiMode ? AI_EXAMPLES : REGULAR_EXAMPLES
    const interval = setInterval(() => {
      setRotIdx((i) => (i + 1) % list.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [query, aiMode])

  const placeholder = aiMode
    ? AI_EXAMPLES[rotIdx % AI_EXAMPLES.length]
    : REGULAR_EXAMPLES[rotIdx % REGULAR_EXAMPLES.length]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (aiMode || !query || query.length < 2) { setSuggestions([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs/search-suggestions?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.suggestions || [])
        }
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [query, aiMode])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    if (aiMode) {
      setAiLoading(true)
      try {
        const res = await fetch(`/api/jobs?limit=5&search=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          const jobs = (data.jobs || []) as JobFrontend[]
          setAiResults(
            jobs.map((j) => ({
              id: j.id,
              slug: j.slug,
              title: j.title,
              company_name: j.company.name,
              salary_min: j.salaryMin ?? null,
              salary_max: j.salaryMax ?? null,
              location_type: j.workType,
              ai_score: null,
            }))
          )
        }
      } catch {}
      setAiLoading(false)
    } else {
      router.push(`/jobs?search=${encodeURIComponent(query)}`)
    }
  }, [query, aiMode, router])

  const handleSelect = (text: string) => {
    setQuery(text)
    setShowSuggestions(false)
    router.push(`/jobs?search=${encodeURIComponent(text)}`)
  }

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto relative">
      {/* Fallback form for no-JS: simple GET to /jobs?search=... */}
      <form
        method="GET"
        action="/jobs"
        onSubmit={(e) => { e.preventDefault(); handleSearch() }}
        className="flex gap-2"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
          <Input
            type="text"
            name="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-12 h-14 text-base rounded-xl border-gray-300 bg-white/90 backdrop-blur-sm shadow-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button
          type="submit"
          disabled={aiLoading}
          size="lg"
          className="h-14 px-6 rounded-xl bg-gradient-primary hover:bg-gradient-primary-hover text-white shadow-lg"
        >
          {aiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </Button>
      </form>

      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          type="button"
          onClick={() => { setAiMode(!aiMode); setAiResults([]) }}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all px-3 py-1 rounded-full ${
            aiMode ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-primary"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Search
        </button>
        <span className="text-gray-300">|</span>
        <div className="flex gap-2">
          {["React Developer", "Product Manager", "Data Analyst"].map((q) => (
            <Link
              key={q}
              href={`/jobs?search=${encodeURIComponent(q)}`}
              className="text-xs text-gray-400 hover:text-primary transition-colors"
            >
              {q}
            </Link>
          ))}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && !aiMode && (
        <div className="absolute top-16 left-0 right-12 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(s.text)}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
            >
              {s.type === "job"
                ? <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                : <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />}
              <span className="text-gray-800">{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {aiMode && aiResults.length > 0 && (
        <div className="absolute top-16 left-0 right-12 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
          <p className="px-4 py-1 text-xs text-gray-400">AI results</p>
          {aiResults.map((j) => (
            <Link
              key={j.id}
              href={`/jobs/${j.slug}`}
              className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-900 truncate block">{j.title}</span>
                  <span className="text-xs text-gray-500">{j.company_name}</span>
                </div>
                <ScoreBadge score={j.ai_score} size="sm" />
              </div>
            </Link>
          ))}
          <Link
            href={`/jobs?search=${encodeURIComponent(query)}`}
            className="block px-4 py-2 text-xs text-primary hover:bg-gray-50 font-medium"
          >
            View all results &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}
