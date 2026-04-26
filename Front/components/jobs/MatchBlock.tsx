"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sparkles, Zap, X, Loader2, Upload, CheckCircle,
  ChevronDown, ChevronUp, Crown, AlertCircle, Plus,
  RefreshCw, Trash2,
} from "lucide-react"
import { getCurrentUser } from "@/lib/session"
import { AuthModal } from "@/components/AuthModal"

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobInfo {
  id: string; slug: string; title: string; companyName: string
  description: string; requirements: string
  skills: string[]; experience: string; workType: string; location: string
}

interface ProfileSummary { id: string; title: string; skills: string[] }

interface MatchCriterion {
  name: string; icon: string; score: number; max: number
  verdict: string; comment: string
}

interface MatchData {
  id: string; score: number; verdict: string; summary: string
  criteria: MatchCriterion[]; strengths: string[]; gaps: string[]
  updatedAt?: string
}

type Step = "promo" | "select-profile" | "analyzing" | "result" | "pricing"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PHRASES = [
  "Analyzing your skills…", "Matching experience levels…",
  "Checking location fit…", "Reviewing domain overlap…", "Calculating final score…",
]

function verdictColor(score: number) {
  if (score >= 80) return { ring: "#22c55e", text: "text-green-600", bg: "bg-green-50 border-green-200" }
  if (score >= 60) return { ring: "#f59e0b", text: "text-amber-500", bg: "bg-amber-50 border-amber-200" }
  if (score >= 40) return { ring: "#f97316", text: "text-orange-500", bg: "bg-orange-50 border-orange-100" }
  return { ring: "#ef4444", text: "text-red-500", bg: "bg-red-50 border-red-100" }
}

function barColor(score: number, max = 20) {
  const p = score / max
  if (p >= 0.75) return "bg-green-500"
  if (p >= 0.5) return "bg-amber-400"
  return "bg-red-400"
}

function textColor(score: number, max = 20) {
  const p = score / max
  if (p >= 0.75) return "text-green-600"
  if (p >= 0.5) return "text-amber-500"
  return "text-red-500"
}

const PLANS = [
  { id: "monthly", label: "Monthly", price: "$9.99", per: "/month", badge: null, save: null },
  { id: "quarterly", label: "3 Months", price: "$24.99", per: "/3 months", badge: "Popular", save: "Save 17%" },
  { id: "yearly", label: "Yearly", price: "$79.99", per: "/year", badge: "Best Value", save: "Save 33%" },
] as const

// ─── Score circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score, size = 56 }: { score: number; size?: number }) {
  const { ring } = verdictColor(score)
  const r = 15.9
  const dash = `${score} 100`
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 36 36" className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="3" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={ring} strokeWidth="3"
          strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black leading-none" style={{ fontSize: size * 0.27 }}>{score}</span>
        <span className="text-gray-400 leading-none" style={{ fontSize: size * 0.14 }}>/100</span>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MatchBlock({ job }: { job: JobInfo }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("promo")
  const [expanded, setExpanded] = useState(false)
  const [existingMatch, setExistingMatch] = useState<MatchData | null>(null)
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [match, setMatch] = useState<MatchData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "yearly">("quarterly")
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(getCurrentUser())

  // Keep user state in sync with auth events
  useEffect(() => {
    const handle = () => setUser(getCurrentUser())
    window.addEventListener("user-changed", handle)
    return () => window.removeEventListener("user-changed", handle)
  }, [])

  // Load existing match on mount
  useEffect(() => {
    const u = getCurrentUser()
    if (!u) return
    fetch(`/api/match?userId=${u.id}&jobId=${job.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.match) {
          setExistingMatch(d.match)
          setMatch(d.match)
          setStep("result")
        }
      })
      .catch(() => {})
  }, [job.id])

  // Phrase rotator during analysis
  useEffect(() => {
    if (step !== "analyzing") return
    const id = setInterval(() => setPhraseIdx((p) => (p + 1) % PHRASES.length), 1800)
    return () => clearInterval(id)
  }, [step])

  // ── Open click handler ─────────────────────────────────────────────────────

  const handleOpen = async (overrideUser = user) => {
    setError(null)
    if (!overrideUser) {
      setShowAuth(true)
      return
    }

    const [qRes, pRes] = await Promise.all([
      fetch(`/api/match/quota?userId=${overrideUser.id}`).then((r) => r.json()),
      fetch(`/api/profiles?userId=${overrideUser.id}`).then((r) => r.json()),
    ])

    if (!qRes.hasUnlimited && qRes.remaining <= 0) { setStep("pricing"); return }

    const userProfiles: ProfileSummary[] = pRes.profiles ?? []
    setProfiles(userProfiles)

    if (userProfiles.length === 0) {
      router.push(`/profiles/create?returnTo=/jobs/${job.slug}&checkMatch=1`)
      return
    }
    if (userProfiles.length === 1) { await runAnalysis(userProfiles[0].id, overrideUser); return }
    setStep("select-profile")
  }

  // ── Analysis ───────────────────────────────────────────────────────────────

  const runAnalysis = async (profileId: string, overrideUser = user) => {
    if (!overrideUser) return
    setStep("analyzing")
    setError(null)
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: overrideUser.id, profileId,
          job: { id: job.id, slug: job.slug, title: job.title, companyName: job.companyName, description: job.description, requirements: job.requirements, skills: job.skills, experience: job.experience, workType: job.workType, location: job.location },
        }),
      })
      const data = await res.json()
      if (res.status === 402) { setStep("pricing"); return }
      if (!res.ok) throw new Error(data.error || "Analysis failed")
      setMatch(data.match)
      setStep("result")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setStep(existingMatch ? "result" : "promo")
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  const displayMatch = match || existingMatch
  const { text: verdictText, bg: verdictBg } = displayMatch ? verdictColor(displayMatch.score) : { text: "", bg: "" }

  // ── AUTH MODAL (shared) ────────────────────────────────────────────────────
  const authModal = (
    <AuthModal
      open={showAuth}
      onOpenChange={setShowAuth}
      defaultMode="register"
      onSuccess={() => {
        setShowAuth(false)
        const freshUser = getCurrentUser()
        if (freshUser) handleOpen(freshUser)
      }}
    />
  )

  // ── PROMO BLOCK ────────────────────────────────────────────────────────────
  if (step === "promo" || (!displayMatch && step !== "analyzing" && step !== "pricing" && step !== "select-profile")) {
    return (
      <>
        <div className="relative overflow-hidden rounded-xl" style={{ background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 60%,#6D28D9 100%)" }}>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-16 -bottom-6 h-24 w-24 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Match & Cover Letter</h3>
                <p className="text-white/70 text-sm mt-0.5 max-w-sm">See how well your profile fits this role across 5 key criteria — get a score out of 100</p>
                <p className="text-white/50 text-xs mt-2">✦ 3 free checks for registered users</p>
              </div>
            </div>
            <Button onClick={() => handleOpen()} className="bg-white text-purple-700 hover:bg-white/90 font-semibold gap-2 px-5 shadow-lg shadow-black/20 flex-shrink-0">
              <Zap className="h-4 w-4" />Check Match
            </Button>
          </div>
        </div>
        {authModal}
      </>
    )
  }

  // ── ANALYZING ─────────────────────────────────────────────────────────────
  if (step === "analyzing") {
    return (
      <div className="rounded-xl border border-purple-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 flex items-center gap-5">
        <div className="relative h-12 w-12 flex-shrink-0">
          <div className="absolute inset-0 rounded-full" style={{ border: "3px solid #e5e7eb" }} />
          <div className="absolute inset-0 rounded-full" style={{ border: "3px solid transparent", borderTopColor: "#7c3aed", borderRightColor: "#7c3aed", animation: "spin 0.9s linear infinite" }} />
          <style jsx>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </div>
        <div>
          <p className="font-semibold text-gray-900">Analyzing Your Match</p>
          <p className="text-sm text-purple-600 mt-0.5">{PHRASES[phraseIdx]}</p>
        </div>
      </div>
    )
  }

  // ── SELECT PROFILE ────────────────────────────────────────────────────────
  if (step === "select-profile") {
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
        <p className="font-semibold text-gray-900 mb-3">Which profile should we use?</p>
        <div className="space-y-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => runAnalysis(p.id)}
              className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow-sm transition-all text-left"
            >
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-purple-600">
                {p.title.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{p.title}</p>
                {p.skills.length > 0 && (
                  <p className="text-xs text-gray-500 truncate">{p.skills.slice(0, 4).join(", ")}</p>
                )}
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => setStep("promo")} className="mt-3 text-xs text-gray-400 hover:text-gray-600">Cancel</button>
      </div>
    )
  }

  // ── PRICING (inline) ──────────────────────────────────────────────────────
  if (step === "pricing") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Crown className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-gray-900">You've used all 3 free checks</p>
            <p className="text-sm text-gray-600 mt-0.5">Upgrade to Pro for unlimited match checks</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PLANS.map((p) => (
            <button key={p.id} onClick={() => setSelectedPlan(p.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${selectedPlan === p.id ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
              <div className="flex items-center gap-1 mb-1">
                <span className="font-bold text-sm">{p.price}</span>
                {p.badge && <span className="text-xs bg-purple-100 text-purple-700 rounded-full px-1.5 font-medium">{p.badge}</span>}
              </div>
              <p className="text-xs text-gray-400">{p.label}</p>
              {p.save && <p className="text-xs text-green-600 mt-0.5">{p.save}</p>}
            </button>
          ))}
        </div>
        <a href="/pricing">
          <Button className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold gap-2">
            <Crown className="h-4 w-4" />Get Pro · {PLANS.find((p) => p.id === selectedPlan)?.price}
          </Button>
        </a>
      </div>
    )
  }

  // ── RESULT (inline, collapsible) ──────────────────────────────────────────
  if (step === "result" && displayMatch) {
    const criteria = displayMatch.criteria as MatchCriterion[]
    const strengths = displayMatch.strengths as string[]
    const gaps = displayMatch.gaps as string[]

    return (
      <>
        <div className={`rounded-xl border-2 ${verdictBg} overflow-hidden`}>
          {/* Collapsed header — always visible */}
          <div className="p-4 flex items-center gap-4">
            <ScoreCircle score={displayMatch.score} size={60} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`font-bold text-base ${verdictText}`}>{displayMatch.verdict}</span>
                <span className="text-xs text-gray-400">for {job.title}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{displayMatch.summary}</p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                {expanded ? <><ChevronUp className="h-3.5 w-3.5" />Hide details</> : <><ChevronDown className="h-3.5 w-3.5" />Show details</>}
              </button>
              <button
                onClick={() => handleOpen()}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />Recheck
              </button>
            </div>
          </div>

          {/* Expanded details */}
          {expanded && (
            <div className="border-t border-current/10 px-5 pb-5 pt-4 bg-white/60 space-y-4">
              <div className="space-y-3">
                {criteria.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span>{c.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                        <span className={`text-xs font-medium ${textColor(c.score, c.max)}`}>{c.verdict}</span>
                      </div>
                      <span className={`text-xs font-bold tabular-nums ${textColor(c.score, c.max)}`}>{c.score}/{c.max}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden mb-1">
                      <div className={`h-full rounded-full ${barColor(c.score, c.max)}`} style={{ width: `${Math.round((c.score / c.max) * 100)}%`, transition: "width 0.7s ease" }} />
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{c.comment}</p>
                  </div>
                ))}
              </div>

              {(strengths.length > 0 || gaps.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {strengths.length > 0 && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1.5">✅ Strengths</p>
                      {strengths.map((s) => <p key={s} className="text-xs text-green-700 leading-snug">· {s}</p>)}
                    </div>
                  )}
                  {gaps.length > 0 && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-orange-700 mb-1.5">⚡ Gaps</p>
                      {gaps.map((g) => <p key={g} className="text-xs text-orange-700 leading-snug">· {g}</p>)}
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            </div>
          )}
        </div>
        {authModal}
      </>
    )
  }

  return null
}
