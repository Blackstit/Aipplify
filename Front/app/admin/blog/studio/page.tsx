"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { parseGeneratedOutput } from "@/lib/blog-parse"
import {
  LayoutTemplate, Sparkles, Loader2, CheckCircle2, AlertCircle,
  Clock, Calendar, Play, Pause, Eye, Trash2, ChevronDown,
  RefreshCw, ArrowRight, BookOpen, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"

// ── Types ──────────────────────────────────────────────────────────────────────
interface PlanItem {
  title: string; category: string; keywords: string[]
  priority: "high"|"medium"|"low"; audience: string
  rationale: string; estimatedReadTime: string
}

interface ArticleJob {
  item: PlanItem
  scheduledAt: string
  status: "queued" | "writing" | "done" | "error"
  id?: string
  streamPreview: string
  wordCount: number
}

interface ScheduledPost {
  id: string; title: string; category: string; scheduledAt?: string
}

type Phase = "idle" | "planning" | "writing" | "done" | "error"

const MODELS = [
  { id: "anthropic/claude-sonnet-4-5",      label: "Claude Sonnet 4.5", badge: "Best"  },
  { id: "anthropic/claude-3.5-haiku",        label: "Claude 3.5 Haiku",  badge: "Fast" },
  { id: "openai/gpt-4o",                     label: "GPT-4o",            badge: ""     },
  { id: "openai/gpt-4o-mini",                label: "GPT-4o Mini",       badge: "Fast" },
  { id: "google/gemini-2.0-flash-001",       label: "Gemini 2.0 Flash",  badge: "Fast" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B",     badge: "Free" },
  { id: "deepseek/deepseek-r1",              label: "DeepSeek R1",       badge: ""     },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

function suggestDates(count: number, perWeek: number): string[] {
  const start = new Date()
  start.setDate(start.getDate() + 1)
  start.setHours(10, 0, 0, 0)
  const gap = Math.max(1, Math.round(7 / perWeek))
  return Array.from({ length: count }, (_, i) =>
    new Date(start.getTime() + i * gap * 86400000).toISOString()
  )
}

async function readSSE(
  resp: Response,
  onDelta: (full: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const reader = resp.body!.getReader()
  const dec = new TextDecoder()
  let buf = "", full = ""
  while (true) {
    if (signal?.aborted) break
    const { done, value } = await reader.read()
    if (done) break
    const lines = (buf + dec.decode(value, { stream: true })).split("\n")
    buf = lines.pop() ?? ""
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      const d = line.slice(6).trim()
      if (d === "[DONE]") continue
      try {
        const delta = JSON.parse(d)?.choices?.[0]?.delta?.content
        if (typeof delta === "string") { full += delta; onDelta(full) }
      } catch { /* skip */ }
    }
  }
  return full
}

// ── Model picker ───────────────────────────────────────────────────────────────
function ModelPicker({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const sel = MODELS.find(m => m.id === value) ?? MODELS[0]
  useEffect(() => {
    const fn = () => setOpen(false)
    document.addEventListener("click", fn)
    return () => document.removeEventListener("click", fn)
  }, [])
  return (
    <div className="relative">
      <button disabled={disabled} onClick={e => { e.stopPropagation(); setOpen(!open) }}
        className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-gray-300 transition-colors disabled:opacity-50">
        <span className="font-medium">{sel.label}</span>
        {sel.badge && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">{sel.badge}</span>}
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-56"
          onClick={e => e.stopPropagation()}>
          {MODELS.map(m => (
            <button key={m.id} onClick={() => { onChange(m.id); setOpen(false) }}
              className={cn("w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors",
                value === m.id && "bg-primary/5 text-primary font-semibold")}>
              {m.label}
              {m.badge && <span className="text-xs text-gray-400">{m.badge}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ContentStudioPage() {
  const user = getCurrentUser()

  // Settings
  const [brief, setBrief]     = useState("")
  const [count, setCount]     = useState(7)
  const [perWeek, setPerWeek] = useState(3)
  const [model, setModel]     = useState(MODELS[0].id)

  // Pipeline state
  const [phase, setPhase]       = useState<Phase>("idle")
  const [planStatus, setPlanStatus] = useState<"idle"|"running"|"done"|"error">("idle")
  const [planPreview, setPlanPreview] = useState("")
  const [jobs, setJobs]         = useState<ArticleJob[]>([])
  const [currentJob, setCurrentJob] = useState(-1)
  const [globalError, setGlobalError] = useState("")
  const abortRef = useRef<AbortController | null>(null)
  const streamRef = useRef<HTMLUListElement>(null)

  // Queue / auto-publish
  const [queue, setQueue]           = useState<ScheduledPost[]>([])
  const [autoPublish, setAutoPublish] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("blog:autoPublish") === "true"
  )
  const [lastPublished, setLastPublished] = useState<string[]>([])
  const autoRef = useRef<NodeJS.Timeout | null>(null)

  const loadQueue = useCallback(async () => {
    if (!user) return
    const r = await fetch("/api/admin/blog/publish-scheduled", { headers: { "x-user-id": user.id } })
    const d = await r.json()
    setQueue(d.scheduled || [])
  }, []) // eslint-disable-line

  useEffect(() => { loadQueue() }, [loadQueue])

  // Auto-publish interval
  useEffect(() => {
    if (autoPublish) {
      autoRef.current = setInterval(async () => {
        if (!user) return
        const r = await fetch("/api/admin/blog/publish-scheduled", { method: "POST", headers: { "x-user-id": user.id } })
        const d = await r.json()
        if (d.count > 0) { setLastPublished(d.published); loadQueue() }
      }, 60_000)
    } else {
      if (autoRef.current) clearInterval(autoRef.current)
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [autoPublish, loadQueue]) // eslint-disable-line

  // Auto-scroll stream preview
  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight
  }, [jobs])

  // ── Main pipeline ──────────────────────────────────────────────────────────
  const run = async () => {
    if (!user) return
    abortRef.current = new AbortController()
    setPhase("planning")
    setPlanStatus("running")
    setPlanPreview("")
    setJobs([])
    setCurrentJob(-1)
    setGlobalError("")

    // ── Step 1: Generate content plan ────────────────────────────────────────
    let planItems: PlanItem[] = []
    try {
      const resp = await fetch("/api/admin/blog/plan", {
        method: "POST",
        headers: { "x-user-id": user.id, "content-type": "application/json" },
        body: JSON.stringify({ brief, model, count }),
        signal: abortRef.current.signal,
      })
      if (!resp.ok) { const d = await resp.json(); throw new Error(d.error || "Plan failed") }

      const full = await readSSE(resp, t => setPlanPreview(t), abortRef.current.signal)
      const cleaned = full.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim()
      const s = cleaned.indexOf("["), e = cleaned.lastIndexOf("]")
      if (s === -1 || e === -1) throw new Error("Could not parse content plan")
      planItems = JSON.parse(cleaned.slice(s, e + 1))
      if (!planItems.length) throw new Error("AI returned empty plan")
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") { setPhase("idle"); setPlanStatus("idle"); return }
      setGlobalError(err instanceof Error ? err.message : "Plan failed")
      setPlanStatus("error"); setPhase("error"); return
    }
    setPlanStatus("done")

    // ── Step 2: Build jobs with scheduled dates ───────────────────────────────
    const dates = suggestDates(planItems.length, perWeek)
    const initialJobs: ArticleJob[] = planItems.map((item, i) => ({
      item, scheduledAt: dates[i] ?? new Date().toISOString(),
      status: "queued", streamPreview: "", wordCount: 0,
    }))
    setJobs(initialJobs)
    setPhase("writing")

    // ── Step 3: Write each article ────────────────────────────────────────────
    for (let i = 0; i < initialJobs.length; i++) {
      if (abortRef.current.signal.aborted) break
      setCurrentJob(i)
      setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: "writing" } : j))

      const job = initialJobs[i]
      const prompt = [
        `Write: "${job.item.title}"`,
        `Audience: ${job.item.audience}`,
        `Keywords: ${job.item.keywords.join(", ")}`,
        `Category: ${job.item.category}`,
        `Key angle: ${job.item.rationale}`,
      ].join("\n")

      try {
        const resp = await fetch("/api/admin/blog/generate", {
          method: "POST",
          headers: { "x-user-id": user.id, "content-type": "application/json" },
          body: JSON.stringify({ prompt, model }),
          signal: abortRef.current.signal,
        })
        if (!resp.ok) { const d = await resp.json(); throw new Error(d.error || "Generate failed") }

        let fullText = ""
        await readSSE(resp, t => {
          fullText = t
          // Extract content section for preview if available
          const cm = t.match(/<CONTENT>([\s\S]*?)(?:<\/CONTENT>|$)/i)
          const preview = cm ? cm[1] : t
          const words = preview.trim().split(/\s+/).filter(Boolean).length
          setJobs(prev => prev.map((j, idx) =>
            idx === i ? { ...j, streamPreview: preview.slice(-300), wordCount: words } : j
          ))
        }, abortRef.current.signal)

        // Parse & save
        const result = parseGeneratedOutput(fullText)
        let { meta, content, faq } = result ?? { meta: {}, content: "", faq: [] }
        const title = (meta.title as string) || job.item.title

        // Fallback: if AI skipped the FAQ block, request it separately
        if (faq.length === 0 && content) {
          try {
            const faqR = await fetch("/api/admin/blog/faq", {
              method: "POST",
              headers: { "x-user-id": user.id, "content-type": "application/json" },
              body: JSON.stringify({ title, content }),
            })
            if (faqR.ok) {
              const faqD = await faqR.json()
              if (Array.isArray(faqD.faq) && faqD.faq.length > 0) faq = faqD.faq
            }
          } catch { /* non-fatal */ }
        }
        let slug = slugify(title).slice(0, 60)

        // Resolve slug collision
        const checkR = await fetch(`/api/admin/blog?search=${encodeURIComponent(slug)}`, {
          headers: { "x-user-id": user.id },
        })
        const checkD = await checkR.json()
        const exists = (checkD.posts || []).some((p: { slug: string }) => p.slug === slug)
        if (exists) slug = `${slug}-${Date.now().toString(36)}`

        const postR = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "x-user-id": user.id, "content-type": "application/json" },
          body: JSON.stringify({
            title, slug, status: "DRAFT",
            category: (meta.category as string) || job.item.category,
            tags: Array.isArray(meta.tags) ? meta.tags : job.item.keywords,
            excerpt: (meta.excerpt as string) || job.item.rationale,
            content,
            metaTitle: (meta.metaTitle as string) || title,
            metaDescription: (meta.metaDescription as string) || "",
            image: `https://picsum.photos/seed/${slug.slice(0, 20)}/1200/628`,
            imageAlt: title,
            publishedAt: new Date().toISOString(),
            readTime: `${Math.max(1, Math.ceil((content.split(/\s+/).length || 1) / 200))} min read`,
            author: { name: "Aipplify Team", avatar: "", role: "Editor" },
            faq,
            scheduledAt: job.scheduledAt,
          }),
        })
        const postD = await postR.json()
        setJobs(prev => prev.map((j, idx) =>
          idx === i ? { ...j, status: postR.ok ? "done" : "error", id: postD.post?.id } : j
        ))
        if (postR.ok) await loadQueue()
      } catch (err: unknown) {
        if ((err as { name?: string }).name === "AbortError") break
        setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: "error" } : j))
      }
    }

    setCurrentJob(-1)
    setPhase("done")
    await loadQueue()
  }

  const cancel = () => { abortRef.current?.abort(); setPhase("idle"); setPlanStatus("idle") }
  const reset  = () => { setPhase("idle"); setPlanStatus("idle"); setJobs([]); setPlanPreview(""); setGlobalError("") }

  const isRunning = phase === "planning" || phase === "writing"
  const doneCount = jobs.filter(j => j.status === "done").length
  const errorCount = jobs.filter(j => j.status === "error").length

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-primary" />
            Content Studio
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">One click — full pipeline: plan → write → schedule</p>
        </div>
        <Link href="/admin/blog">
          <Button size="sm" variant="outline" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />All Articles
          </Button>
        </Link>
      </div>

      {/* ── Settings card ─────────────────────────────────────────────────── */}
      <div className={cn("bg-white rounded-2xl border border-gray-200 p-5 space-y-4", isRunning && "opacity-60 pointer-events-none")}>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
            Brief / Focus (optional)
          </label>
          <textarea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            rows={2}
            placeholder="e.g. Focus on DeFi for beginners, salary guides for 2026, practical Web3 career tips…"
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">AI model</p>
            <ModelPicker value={model} onChange={setModel} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Articles to write</p>
            <select value={count} onChange={e => setCount(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-primary">
              {[3,5,7,10,14].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Posts per week</p>
            <select value={perWeek} onChange={e => setPerWeek(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-primary">
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}×/week</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
          <div className="flex-1 text-xs text-gray-400">
            Will write {count} articles, scheduled every {Math.round(7/perWeek)} day{Math.round(7/perWeek) !== 1 ? "s" : ""} starting tomorrow
          </div>
          {phase === "done" || phase === "error" ? (
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />New Run
            </Button>
          ) : (
            <Button onClick={run} disabled={isRunning} size="lg" className="gap-2 px-6">
              {isRunning
                ? <><Loader2 className="h-4 w-4 animate-spin" />Running…</>
                : <><Zap className="h-4 w-4" />Run Full Pipeline</>
              }
            </Button>
          )}
          {isRunning && (
            <Button variant="outline" onClick={cancel} className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50">
              <Pause className="h-4 w-4" />Stop
            </Button>
          )}
        </div>
      </div>

      {/* ── Pipeline progress ──────────────────────────────────────────────── */}
      {(phase !== "idle" || jobs.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

          {/* Step 1: Plan */}
          <div className={cn("flex items-start gap-4 px-5 py-4 border-b border-gray-100",
            planStatus === "idle" && "opacity-40")}>
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold",
              planStatus === "done" ? "bg-green-100 text-green-700"
              : planStatus === "running" ? "bg-primary/10 text-primary"
              : planStatus === "error" ? "bg-rose-100 text-rose-600"
              : "bg-gray-100 text-gray-400")}>
              {planStatus === "done" ? <CheckCircle2 className="h-4 w-4" />
              : planStatus === "running" ? <Loader2 className="h-4 w-4 animate-spin" />
              : planStatus === "error" ? <AlertCircle className="h-4 w-4" />
              : "1"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                {planStatus === "running" ? "Generating content plan…"
                : planStatus === "done" ? `Content plan ready — ${jobs.length} articles`
                : planStatus === "error" ? "Content plan failed"
                : "Generate content plan"}
              </p>
              {planStatus === "running" && planPreview && (
                <p className="text-xs text-gray-400 font-mono mt-1 truncate">{planPreview.slice(-120)}</p>
              )}
              {planStatus === "error" && globalError && (
                <p className="text-xs text-rose-600 mt-1">{globalError}</p>
              )}
              {planStatus === "done" && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {jobs.map((j, i) => (
                    <span key={i} className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium",
                      j.status === "done"    ? "bg-green-100 text-green-700"
                      : j.status === "writing" ? "bg-primary/10 text-primary"
                      : j.status === "error"   ? "bg-rose-100 text-rose-600"
                      : "bg-gray-100 text-gray-500"
                    )}>
                      {j.item.category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Articles */}
          {jobs.length > 0 && (
            <div>
              <div className={cn("flex items-center gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/50",
                phase === "planning" && "opacity-40")}>
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                  phase === "done" && doneCount === jobs.length ? "bg-green-100 text-green-700"
                  : phase === "writing" ? "bg-primary/10 text-primary"
                  : "bg-gray-100 text-gray-400")}>
                  {phase === "done" && doneCount === jobs.length
                    ? <CheckCircle2 className="h-4 w-4" />
                    : phase === "writing"
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : "2"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {phase === "writing"
                      ? `Writing articles… ${doneCount + errorCount}/${jobs.length}`
                      : phase === "done"
                      ? `Done — ${doneCount} article${doneCount !== 1 ? "s" : ""} written${errorCount > 0 ? `, ${errorCount} failed` : ""}`
                      : "Write articles"}
                  </p>
                </div>
                {phase === "writing" && (
                  <div className="text-xs text-gray-400 tabular-nums">
                    {Math.round((doneCount + errorCount) / jobs.length * 100)}%
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {phase === "writing" && (
                <div className="h-1 bg-gray-100">
                  <div
                    className="h-1 bg-primary transition-all duration-500"
                    style={{ width: `${(doneCount + errorCount) / jobs.length * 100}%` }}
                  />
                </div>
              )}

              {/* Article list */}
              <ul className="divide-y divide-gray-50" ref={streamRef}>
                {jobs.map((job, i) => (
                  <li key={i} className={cn(
                    "px-5 py-3.5 transition-colors",
                    job.status === "writing" && "bg-primary/[0.02]",
                  )}>
                    <div className="flex items-start gap-3">
                      {/* Status icon */}
                      <div className="shrink-0 mt-0.5">
                        {job.status === "done"    && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {job.status === "writing" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                        {job.status === "error"   && <AlertCircle className="h-4 w-4 text-rose-400" />}
                        {job.status === "queued"  && (
                          <span className="h-4 w-4 flex items-center justify-center text-[10px] font-bold text-gray-300">{i+1}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("text-sm font-medium truncate",
                            job.status === "queued" ? "text-gray-400" : "text-gray-800")}>
                            {job.item.title}
                          </p>
                          <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full shrink-0">
                            {job.item.category}
                          </span>
                        </div>

                        {/* Scheduled date */}
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(job.scheduledAt), "EEE d MMM yyyy · HH:mm")}
                        </p>

                        {/* Streaming preview */}
                        {job.status === "writing" && job.streamPreview && (
                          <p className="text-xs text-gray-400 font-mono mt-1.5 leading-relaxed line-clamp-2">
                            {job.streamPreview.trim().split("\n").slice(-2).join(" ")}
                            <span className="inline-block w-1 h-3 bg-primary ml-0.5 animate-pulse align-middle" />
                          </p>
                        )}

                        {job.status === "writing" && job.wordCount > 0 && (
                          <p className="text-[10px] text-primary mt-1">{job.wordCount} words written…</p>
                        )}

                        {job.status === "done" && job.id && (
                          <Link href={`/admin/blog/${job.id}`}
                            className="text-[11px] text-primary hover:underline mt-1 inline-flex items-center gap-1">
                            <Eye className="h-3 w-3" />Edit & Review
                          </Link>
                        )}
                        {job.status === "error" && (
                          <p className="text-[11px] text-rose-500 mt-1">Failed — draft not created</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Done banner */}
          {phase === "done" && (
            <div className="px-5 py-4 bg-green-50 border-t border-green-100 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">
                  {doneCount} article{doneCount !== 1 ? "s" : ""} written and scheduled!
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Review and edit each article before their publish date, or enable auto-publish below.
                </p>
              </div>
              <Link href="/admin/blog">
                <Button size="sm" variant="outline" className="gap-1.5 border-green-300 text-green-700 hover:bg-green-100">
                  <BookOpen className="h-3.5 w-3.5" />View All
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Scheduled queue ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Publishing queue</p>
            <p className="text-xs text-gray-400 mt-0.5">{queue.length} post{queue.length !== 1 ? "s" : ""} scheduled</p>
          </div>

          {/* Auto-publish toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500">Auto-publish</span>
            <button onClick={() => { const v = !autoPublish; setAutoPublish(v); localStorage.setItem("blog:autoPublish", String(v)) }}
              className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                autoPublish ? "bg-green-500" : "bg-gray-200")}>
              <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                autoPublish ? "translate-x-4" : "translate-x-0.5")} />
            </button>
            <span className={cn("text-xs", autoPublish ? "text-green-600 flex items-center gap-1" : "text-gray-400")}>
              {autoPublish ? <><Play className="h-3 w-3" />On</> : "Off"}
            </span>
          </div>
        </div>

        {autoPublish && (
          <div className="px-5 py-2 bg-green-50/50 border-b border-green-100 text-xs text-green-700 flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking every 60 s — automatically publishes due drafts
            {lastPublished.length > 0 && <span className="font-medium">· Published: {lastPublished.slice(-3).join(", ")}</span>}
          </div>
        )}

        {queue.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            <Clock className="h-8 w-8 text-gray-200 mx-auto mb-3" />
            No scheduled posts yet — run the pipeline above
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-50">
              {queue.map(post => {
                const dt = post.scheduledAt ? new Date(post.scheduledAt) : null
                const isPast = dt && dt <= new Date()
                return (
                  <li key={post.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={cn("h-2 w-2 rounded-full shrink-0",
                      isPast ? "bg-amber-400 animate-pulse" : "bg-blue-400")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dt ? format(dt, "EEE d MMM yyyy · HH:mm") : "—"}
                        {dt && !isPast && <span className="text-gray-300 ml-1">({formatDistanceToNow(dt, { addSuffix: true })})</span>}
                        {isPast && <span className="text-amber-600 font-medium ml-1">Due — publishes on next check</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/admin/blog/${post.id}`}>
                        <button className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-gray-100 transition-colors" title="Edit">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={async () => {
                          if (!user) return
                          await fetch(`/api/admin/blog/${post.id}`, {
                            method: "PUT",
                            headers: { "x-user-id": user.id, "content-type": "application/json" },
                            body: JSON.stringify({ scheduledAt: null }),
                          })
                          loadQueue()
                        }}
                        className="p-1.5 text-gray-300 hover:text-rose-500 rounded hover:bg-rose-50 transition-colors" title="Unschedule">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs"
                onClick={async () => {
                  if (!user) return
                  await fetch("/api/admin/blog/publish-scheduled", { method: "POST", headers: { "x-user-id": user.id } })
                  loadQueue()
                }}>
                <ArrowRight className="h-3 w-3" />Publish due now
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
