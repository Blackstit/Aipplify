"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import {
  ArrowLeft, Sparkles, Loader2, Send, CheckCircle2,
  AlertCircle, ChevronDown, BookOpen, RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Curated model list — add/remove as needed
const MODELS = [
  { id: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet 4.5", badge: "Recommended" },
  { id: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku", badge: "Fast" },
  { id: "openai/gpt-4o", label: "GPT-4o", badge: "" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini", badge: "Fast" },
  { id: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash", badge: "Fast" },
  { id: "google/gemini-pro-1.5", label: "Gemini Pro 1.5", badge: "" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B", badge: "Free tier" },
  { id: "deepseek/deepseek-r1", label: "DeepSeek R1", badge: "" },
  { id: "qwen/qwen-2.5-72b-instruct", label: "Qwen 2.5 72B", badge: "" },
  { id: "mistralai/mistral-large", label: "Mistral Large", badge: "" },
]

interface RecentPost { id: string; title: string; category: string; publishedAt: string }

type Phase = "idle" | "generating" | "done" | "error"

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

// ── JSON repair ────────────────────────────────────────────────────────────────
// Fixes literal newlines/tabs inside JSON string values (common LLM output issue)
function repairJSON(s: string): string {
  let out = ""
  let inStr = false
  let esc = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (esc) { out += ch; esc = false; continue }
    if (ch === "\\") { out += ch; esc = true; continue }
    if (ch === '"') { out += ch; inStr = !inStr; continue }
    if (inStr) {
      if (ch === "\n") { out += "\\n"; continue }
      if (ch === "\r") { out += "\\r"; continue }
      if (ch === "\t") { out += "\\t"; continue }
    }
    out += ch
  }
  return out
}

// ── Parse the delimited output format ─────────────────────────────────────────
// Handles multiple formats the model might emit:
//   1. <META>{json}</META> <CONTENT>text</CONTENT> <FAQ>Q:/A:</FAQ>  ← ideal
//   2. <META>{json}</META> then raw article text (no CONTENT tag)
//   3. Full JSON blob with all fields including "content"
//   4. Raw markdown (last resort — treat whole output as content)
function parseGeneratedOutput(raw: string): {
  meta: Record<string, unknown>
  content: string
  faq: Array<{ q: string; a: string }>
} | null {
  const parseFaqBlock = (block: string): Array<{ q: string; a: string }> => {
    const faq: Array<{ q: string; a: string }> = []
    const pairs = block.matchAll(/Q:\s*(.*?)\n+A:\s*([\s\S]*?)(?=\n+Q:|\s*$)/gi)
    for (const [, q, a] of pairs) {
      if (q?.trim()) faq.push({ q: q.trim(), a: a?.trim() || "" })
    }
    return faq
  }

  const tryParseJson = (s: string): Record<string, unknown> | null => {
    try { return JSON.parse(s) } catch { /* */ }
    try { return JSON.parse(repairJSON(s)) } catch { /* */ }
    return null
  }

  // ── 1. <CONTENT> tag present ──
  const metaMatch = raw.match(/<META>([\s\S]*?)<\/META>/i)
  const contentMatch = raw.match(/<CONTENT>([\s\S]*?)<\/CONTENT>/i)
  const faqTagMatch = raw.match(/<FAQ>([\s\S]*?)<\/FAQ>/i)

  if (contentMatch) {
    let meta: Record<string, unknown> = {}
    if (metaMatch) meta = tryParseJson(metaMatch[1].trim()) ?? {}
    return {
      meta,
      content: contentMatch[1].trim(),
      faq: faqTagMatch ? parseFaqBlock(faqTagMatch[1]) : [],
    }
  }

  // ── 2. <META> present but NO <CONTENT> tag ──
  // Extract article body as everything between </META> and <FAQ> (or end of string)
  if (metaMatch) {
    const meta = tryParseJson(metaMatch[1].trim()) ?? {}
    const afterMeta = raw.slice(raw.toLowerCase().indexOf("</meta>") + 7)
    const beforeFaq = faqTagMatch
      ? afterMeta.slice(0, afterMeta.toLowerCase().indexOf("<faq>"))
      : afterMeta
    const content = beforeFaq.trim()
    if (content.length > 100) {
      return { meta, content, faq: faqTagMatch ? parseFaqBlock(faqTagMatch[1]) : [] }
    }
    // If somehow content is still empty, at least return what we have
    return { meta, content, faq: faqTagMatch ? parseFaqBlock(faqTagMatch[1]) : [] }
  }

  // ── 3. Full JSON blob (old format) — find JSON object that contains "content" key ──
  const stripped = raw.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim()
  // Find the outermost braces
  const jsonStart = stripped.indexOf("{")
  if (jsonStart !== -1) {
    // Walk braces to find matching close
    let depth = 0
    let jsonEnd = -1
    for (let i = jsonStart; i < stripped.length; i++) {
      if (stripped[i] === "{") depth++
      else if (stripped[i] === "}") { depth--; if (depth === 0) { jsonEnd = i; break } }
    }
    if (jsonEnd !== -1) {
      const candidate = stripped.slice(jsonStart, jsonEnd + 1)
      const parsed = tryParseJson(candidate)
      if (parsed) {
        return {
          meta: parsed,
          content: (parsed.content as string) || "",
          faq: Array.isArray(parsed.faq) ? parsed.faq as Array<{ q: string; a: string }> : [],
        }
      }
    }
  }

  // ── 4. Raw markdown fallback — treat everything as article content ──
  if (raw.trim().length > 200) {
    return { meta: {}, content: raw.trim(), faq: [] }
  }

  return null
}

export default function BlogGeneratePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prompt, setPrompt] = useState(searchParams.get("prompt") ?? "")
  const [model, setModel] = useState(MODELS[0].id)
  const [modelOpen, setModelOpen] = useState(false)
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [phase, setPhase] = useState<Phase>("idle")
  const [streamText, setStreamText] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [draftId, setDraftId] = useState<string | null>(null)
  const streamRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const selectedModel = MODELS.find((m) => m.id === model) ?? MODELS[0]

  // Load recent posts for context display
  const loadRecent = useCallback(async () => {
    const user = getCurrentUser()
    if (!user) return
    const r = await fetch("/api/admin/blog?status=PUBLISHED", { headers: { "x-user-id": user.id } })
    const d = await r.json()
    setRecentPosts(
      (d.posts || [])
        .slice(0, 8)
        .map((p: { id: string; title: string; category: string; publishedAt: string }) => ({
          id: p.id, title: p.title, category: p.category, publishedAt: p.publishedAt,
        }))
    )
  }, [])

  useEffect(() => { loadRecent() }, [loadRecent])

  // Auto-scroll stream output
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [streamText])

  // Close model dropdown on outside click
  useEffect(() => {
    const close = () => setModelOpen(false)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  const generate = async () => {
    if (!prompt.trim()) return
    const user = getCurrentUser()
    if (!user) return

    setPhase("generating")
    setStreamText("")
    setErrorMsg("")
    setDraftId(null)

    abortRef.current = new AbortController()

    try {
      const resp = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "x-user-id": user.id, "content-type": "application/json" },
        body: JSON.stringify({ prompt, model }),
        signal: abortRef.current.signal,
      })

      if (!resp.ok) {
        const d = await resp.json()
        throw new Error(d.error || "Generation failed")
      }

      // Read SSE stream — buffer across chunks so lines split at chunk boundaries aren't dropped
      const reader = resp.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ""
      let lineBuffer = ""   // holds the incomplete last line from the previous chunk

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        // Prepend any leftover from the previous chunk, then split on newlines
        const lines = (lineBuffer + chunk).split("\n")
        // The last element may be incomplete — keep it in the buffer
        lineBuffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6).trim()
          if (data === "[DONE]") continue
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (typeof delta === "string") {
              fullText += delta
              setStreamText(fullText)
            }
          } catch {
            // genuinely malformed line — skip
          }
        }
      }

      // Process any remaining buffered line
      if (lineBuffer.startsWith("data: ")) {
        const data = lineBuffer.slice(6).trim()
        if (data && data !== "[DONE]") {
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (typeof delta === "string") fullText += delta
          } catch { /* ignore */ }
        }
      }

      // Parse the JSON output and save as draft
      await parseSaveAndRedirect(fullText, user)
    } catch (e: unknown) {
      if ((e as { name?: string }).name === "AbortError") {
        setPhase("idle")
        return
      }
      setErrorMsg(e instanceof Error ? e.message : "Unknown error")
      setPhase("error")
    }
  }

  const parseSaveAndRedirect = async (raw: string, user: { id: string }) => {
    const result = parseGeneratedOutput(raw)
    if (!result) {
      setErrorMsg("Could not parse AI output. The article text is shown above — you can copy it manually.")
      setPhase("error")
      return
    }

    const { meta, content, faq } = result
    const title = (meta.title as string) || "Untitled Article"
    const imageQuery = (meta.imageQuery as string) || "technology blockchain"
    // Picsum: seeded by slug so the same article always gets the same image
    // User can replace it in the editor
    const seed = slugify(title).slice(0, 30) || "article"
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/628`

    const words = content.trim().split(/\s+/).length
    const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`

    const postBody = {
      title,
      slug: slugify(title),
      status: "DRAFT",
      category: (meta.category as string) || "Web3",
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      excerpt: (meta.excerpt as string) || "",
      content,
      metaTitle: (meta.metaTitle as string) || title,
      metaDescription: (meta.metaDescription as string) || "",
      image: imageUrl,
      imageAlt: title,
      publishedAt: new Date().toISOString(),
      readTime,
      author: { name: "Aipplify Team", avatar: "", role: "Editor" },
      faq,
    }

    const r = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "x-user-id": user.id, "content-type": "application/json" },
      body: JSON.stringify(postBody),
    })
    const d = await r.json()
    if (!r.ok) {
      setErrorMsg(d.error || "Failed to save draft")
      setPhase("error")
      return
    }
    setDraftId(d.post.id)
    setPhase("done")
  }

  const cancel = () => {
    abortRef.current?.abort()
  }

  const reset = () => {
    setPhase("idle")
    setStreamText("")
    setErrorMsg("")
    setDraftId(null)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/blog">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Article Generator
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Describe the article you want — AI will write it as a draft
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left: prompt + controls ───────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Prompt */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
              Article brief / prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={phase === "generating"}
              rows={6}
              placeholder={`Describe the article you want. Be specific:\n\n• Topic: How to land your first job as a Web3 developer in 2026\n• Target audience: Junior developers transitioning from Web2\n• Key points: portfolio tips, top protocols to know, salary ranges\n• Tone: practical and encouraging`}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-primary resize-none leading-relaxed disabled:opacity-50 disabled:bg-gray-50"
            />

            {/* Model selector */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setModelOpen(!modelOpen) }}
                  disabled={phase === "generating"}
                  className="flex items-center gap-2 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-gray-300 transition-colors disabled:opacity-50"
                >
                  <span className="font-medium text-gray-700">{selectedModel.label}</span>
                  {selectedModel.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                      {selectedModel.badge}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>

                {modelOpen && (
                  <div
                    className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-64"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setModel(m.id); setModelOpen(false) }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors",
                          model === m.id && "bg-primary/5 text-primary font-medium",
                        )}
                      >
                        <span>{m.label}</span>
                        {m.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">
                            {m.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1" />

              {phase === "generating" ? (
                <Button variant="outline" size="sm" onClick={cancel} className="gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Stop
                </Button>
              ) : phase === "done" || phase === "error" ? (
                <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  New article
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={generate}
                  disabled={!prompt.trim()}
                  className="gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate
                </Button>
              )}
            </div>
          </div>

          {/* Stream output */}
          {(phase === "generating" || streamText || phase === "error") && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 text-xs font-medium",
                phase === "generating" ? "text-primary" : phase === "done" ? "text-green-600" : "text-rose-600",
              )}>
                {phase === "generating" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {phase === "done" && <CheckCircle2 className="h-3.5 w-3.5" />}
                {phase === "error" && <AlertCircle className="h-3.5 w-3.5" />}
                {phase === "generating" && "Generating…"}
                {phase === "done" && "Done — draft saved"}
                {phase === "error" && errorMsg}
              </div>

              {streamText && (
                <div
                  ref={streamRef}
                  className="p-4 max-h-96 overflow-y-auto text-xs text-gray-600 leading-relaxed whitespace-pre-wrap break-words bg-gray-50/50"
                  style={{ fontFamily: "ui-monospace, monospace" }}
                >
                  {/* Show content section if already started, else show full stream */}
                  {(() => {
                    const contentStart = streamText.indexOf("<CONTENT>")
                    const contentEnd = streamText.indexOf("</CONTENT>")
                    if (contentStart !== -1) {
                      const preview = contentEnd !== -1
                        ? streamText.slice(contentStart + 9, contentEnd)
                        : streamText.slice(contentStart + 9)
                      return preview.trim() || streamText
                    }
                    return streamText
                  })()}
                  {phase === "generating" && (
                    <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              )}

              {phase === "done" && draftId && (
                <div className="px-4 py-3 bg-green-50/50 border-t border-green-100 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-700 flex-1">Draft created successfully!</span>
                  <Button size="sm" onClick={() => router.push(`/admin/blog/${draftId}`)} className="gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    Edit & Publish
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: context panel ──────────────────────── */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Recent articles
              </span>
            </div>
            <p className="px-4 pt-3 text-[11px] text-gray-400 leading-relaxed">
              These are automatically sent to the AI so it avoids repeating topics.
            </p>
            {recentPosts.length === 0 ? (
              <p className="px-4 py-4 text-xs text-gray-400">No published articles yet</p>
            ) : (
              <ul className="divide-y divide-gray-50 mt-2">
                {recentPosts.map((p) => (
                  <li key={p.id} className="px-4 py-2.5">
                    <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-snug">{p.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.category}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 space-y-1.5">
            <p className="font-semibold">Tips for better results</p>
            <ul className="space-y-1 text-amber-600 list-disc list-inside">
              <li>Specify target audience</li>
              <li>Mention key sections you want</li>
              <li>Add salary ranges or stats if relevant</li>
              <li>Include tone (formal / casual)</li>
              <li>Mention the year for timely content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
