"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import {
  Sparkles, ChevronDown, ChevronUp, ExternalLink, Briefcase, Crown, ArrowRight,
} from "lucide-react"
import { getCurrentUser } from "@/lib/session"
import { formatDistanceToNow } from "date-fns"

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchCriterion {
  name: string; icon: string; score: number; max: number
  verdict: string; comment: string
}

interface SavedMatch {
  id: string; userId: string; jobId: string; jobSlug: string
  jobTitle: string; companyName: string | null
  score: number; verdict: string; summary: string | null
  criteria: MatchCriterion[]; strengths: string[]; gaps: string[]
  createdAt: string; updatedAt: string
}

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreRing(score: number) {
  if (score >= 80) return "#6366f1"   // indigo
  if (score >= 60) return "#8b5cf6"   // violet
  if (score >= 40) return "#f59e0b"   // amber
  return "#f87171"                    // red-400
}

function scoreLabel(score: number) {
  if (score >= 80) return { text: "Excellent Match", cls: "text-indigo-600 bg-indigo-50 border-indigo-200" }
  if (score >= 60) return { text: "Good Match", cls: "text-violet-600 bg-violet-50 border-violet-200" }
  if (score >= 40) return { text: "Partial Match", cls: "text-amber-600 bg-amber-50 border-amber-200" }
  return { text: "Weak Match", cls: "text-red-500 bg-red-50 border-red-200" }
}

function barFill(score: number, max = 20) {
  const p = score / max
  if (p >= 0.75) return "bg-indigo-500"
  if (p >= 0.5) return "bg-violet-400"
  if (p >= 0.25) return "bg-amber-400"
  return "bg-red-400"
}

function barText(score: number, max = 20) {
  const p = score / max
  if (p >= 0.75) return "text-indigo-600"
  if (p >= 0.5) return "text-violet-500"
  if (p >= 0.25) return "text-amber-500"
  return "text-red-500"
}

// ─── Score circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score, size = 72 }: { score: number; size?: number }) {
  const ring = scoreRing(score)
  const r = 15.9
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 36 36" className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={ring} strokeWidth="3"
          strokeDasharray={`${score} 100`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black leading-none" style={{ fontSize: size * 0.26, color: ring }}>{score}</span>
        <span className="text-gray-400 leading-none" style={{ fontSize: size * 0.13 }}>/100</span>
      </div>
    </div>
  )
}

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({ match, index }: { match: SavedMatch; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const label = scoreLabel(match.score)
  const criteria = match.criteria as MatchCriterion[]
  const strengths = match.strengths as string[]
  const gaps = match.gaps as string[]
  const timeAgo = formatDistanceToNow(new Date(match.updatedAt), { addSuffix: true })
  const ring = scoreRing(match.score)

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Main row */}
      <div className="flex items-start gap-5 p-5">
        {/* Left accent + score */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <ScoreCircle score={match.score} size={72} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base leading-snug">{match.jobTitle}</h3>
              {match.companyName && (
                <p className="text-sm text-gray-400 mt-0.5">{match.companyName}</p>
              )}
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${label.cls}`}>
              {match.verdict || label.text}
            </span>
          </div>

          {match.summary && (
            <p className="text-sm text-gray-600 leading-relaxed mt-2.5 line-clamp-2">{match.summary}</p>
          )}

          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-gray-400">{timeAgo}</span>
            <Link
              href={`/jobs/${match.jobSlug}`}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />View job
            </Link>
          </div>
        </div>
      </div>

      {/* Criteria mini-bars (always visible, compact) */}
      {criteria.length > 0 && !expanded && (
        <div className="px-5 pb-4 flex gap-1.5">
          {criteria.map((c) => (
            <div key={c.name} className="flex-1 group relative">
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barFill(c.score, c.max)}`}
                  style={{ width: `${Math.round((c.score / c.max) * 100)}%` }}
                />
              </div>
              {/* tooltip */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
                  {c.icon} {c.name}: {c.score}/{c.max}
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 py-2.5 border-t border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
      >
        {expanded
          ? <><ChevronUp className="h-3.5 w-3.5" />Hide details</>
          : <><ChevronDown className="h-3.5 w-3.5" />Show criteria & details</>}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-5">
          {/* Criteria */}
          {criteria.length > 0 && (
            <div className="space-y-3.5">
              {criteria.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{c.icon}</span>
                      <span className="text-sm font-medium text-gray-800">{c.name}</span>
                      <span className={`text-xs font-medium ${barText(c.score, c.max)}`}>{c.verdict}</span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums ${barText(c.score, c.max)}`}>{c.score}/{c.max}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barFill(c.score, c.max)}`}
                      style={{ width: `${Math.round((c.score / c.max) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Strengths / Gaps */}
          {(strengths.length > 0 || gaps.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {strengths.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-indigo-700 mb-2">✦ Strengths</p>
                  <ul className="space-y-1">
                    {strengths.map((s) => (
                      <li key={s} className="text-xs text-indigo-700 leading-snug flex gap-1.5">
                        <span className="opacity-50 flex-shrink-0">·</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {gaps.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-gray-600 mb-2">⚡ Gaps</p>
                  <ul className="space-y-1">
                    {gaps.map((g) => (
                      <li key={g} className="text-xs text-gray-600 leading-snug flex gap-1.5">
                        <span className="opacity-40 flex-shrink-0">·</span>{g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center px-4">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <div className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-amber-400 border-2 border-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">No match checks yet</h2>
      <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
        Open any job listing and click <span className="font-semibold text-indigo-600">Check Match</span> — AI scores your profile across 5 criteria and tells you exactly where you stand.
      </p>
      <Link href="/jobs">
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold gap-2 px-6 py-2.5 h-auto">
          <Briefcase className="h-4 w-4" />Browse Jobs
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<SavedMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) { router.replace("/auth"); return }

    fetch(`/api/matches?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Match Checks</h1>
              </div>
              <p className="text-sm text-gray-500 ml-10">
                {!loading && matches.length > 0
                  ? `${matches.length} saved ${matches.length === 1 ? "result" : "results"} · AI-powered profile analysis`
                  : "AI-powered profile vs job analysis"}
              </p>
            </div>
            {!loading && matches.length > 0 && (
              <Link href="/jobs">
                <Button variant="outline" className="gap-2 hidden sm:flex text-sm">
                  <Briefcase className="h-4 w-4" />Find more jobs
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {/* Upgrade notice */}
        {!loading && matches.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">
            <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Running low on free checks?{" "}
              <Link href="/pricing" className="font-semibold text-indigo-600 hover:underline">Upgrade to Pro</Link>
              {" "}for unlimited analysis.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                <div className="flex gap-5">
                  <div className="h-[72px] w-[72px] rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="h-4 w-1/2 bg-gray-200 rounded-lg" />
                    <div className="h-3 w-1/4 bg-gray-200 rounded-lg" />
                    <div className="h-3 w-full bg-gray-200 rounded-lg" />
                    <div className="h-3 w-4/5 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results list */}
        {!loading && matches.length > 0 && (
          <div className="space-y-4">
            {matches.map((m, i) => (
              <MatchCard key={m.id} match={m} index={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && matches.length === 0 && <EmptyState />}
      </div>

      <Footer />
    </div>
  )
}
