"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { ArticleContent } from "@/app/blog/[slug]/ArticleContent"
import {
  ArrowLeft, Eye, Save, Send, Loader2, Plus, Trash2,
  AlertCircle, CheckCircle2, Hash, HelpCircle,
} from "lucide-react"
import { BlogCover } from "@/components/blog/BlogCover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────
interface FaqItem { q: string; a: string }
interface Post {
  id: string; slug: string; title: string
  metaTitle: string; metaDescription: string; excerpt: string; content: string
  author: { name: string; avatar: string; role: string }
  category: string; tags: string[]; publishedAt: string; readTime: string
  image: string; imageAlt: string; faq: FaqItem[]
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED"
  linkedinPersonPostId?: string
  linkedinOrgPostId?: string
}

type LiTarget = "person" | "org" | "both"

interface LiConfig {
  connected: boolean
  hasOrg: boolean
  orgName?: string
  personName?: string
  defaultTarget: LiTarget
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}
function calcReadTime(content: string) {
  const words = content.trim().split(/\s+/).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function BlogEditorPage({ params }: { params: { id: string } }) {
  const { id } = params
  const isNew = id === "new"
  const router = useRouter()

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const [tab, setTab] = useState<"write" | "preview">("write")
  const [categories, setCategories] = useState<string[]>([])

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManual, setSlugManual] = useState(false)
  const [status, setStatus] = useState<Post["status"]>("DRAFT")
  const [category, setCategory] = useState("Web3")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDesc, setMetaDesc] = useState("")
  const [image, setImage] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 10))
  const [authorName, setAuthorName] = useState("Aipplify Team")
  const [authorRole, setAuthorRole] = useState("Editor")
  const [faq, setFaq] = useState<FaqItem[]>([])

  // LinkedIn
  const [liPersonPostId, setLiPersonPostId] = useState<string | undefined>()
  const [liOrgPostId, setLiOrgPostId] = useState<string | undefined>()
  const [liConfig, setLiConfig] = useState<LiConfig | null>(null)
  const [liTarget, setLiTarget] = useState<LiTarget>("person")
  const [liPosting, setLiPosting] = useState(false)

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Load categories + LinkedIn config
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    fetch("/api/admin/blog/categories", { headers: { "x-user-id": user.id } })
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
    fetch("/api/admin/secrets", { headers: { "x-user-id": user.id } })
      .then((r) => r.json())
      .then((s) => {
        const cfg: LiConfig = {
          connected: s.linkedinConnected,
          hasOrg: s.linkedinHasOrg,
          orgName: s.linkedinOrgName,
          personName: s.linkedinPersonName,
          defaultTarget: s.linkedinPostTarget ?? (s.linkedinHasOrg ? "org" : "person"),
        }
        setLiConfig(cfg)
        setLiTarget(cfg.defaultTarget)
      })
      .catch(() => {})
  }, [])

  // Load existing post
  useEffect(() => {
    if (isNew) return
    const user = getCurrentUser()
    if (!user) return
    fetch(`/api/admin/blog/${id}`, { headers: { "x-user-id": user.id } })
      .then((r) => r.json())
      .then(({ post }: { post: Post }) => {
        if (!post) { router.push("/admin/blog"); return }
        setTitle(post.title)
        setSlug(post.slug)
        setSlugManual(true)
        setStatus(post.status)
        setCategory(post.category)
        setTags(post.tags || [])
        setExcerpt(post.excerpt)
        setContent(post.content)
        setMetaTitle(post.metaTitle || "")
        setMetaDesc(post.metaDescription || "")
        setImage(post.image || "")
        setImageAlt(post.imageAlt || "")
        setPublishedAt(post.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10))
        setAuthorName(post.author?.name || "Aipplify Team")
        setAuthorRole(post.author?.role || "Editor")
        setFaq(post.faq || [])
        setLiPersonPostId(post.linkedinPersonPostId)
        setLiOrgPostId(post.linkedinOrgPostId)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, isNew, router])

  // Auto slug from title
  useEffect(() => {
    if (!slugManual && title) setSlug(toSlug(title))
  }, [title, slugManual])

  const payload = () => ({
    title: title.trim(),
    slug: slug.trim(),
    status,
    category,
    tags,
    excerpt: excerpt.trim(),
    content: content.trim(),
    metaTitle: metaTitle.trim() || title.trim(),
    metaDescription: metaDesc.trim(),
    image: image.trim(),
    imageAlt: imageAlt.trim(),
    publishedAt: new Date(publishedAt).toISOString(),
    readTime: calcReadTime(content),
    author: { name: authorName, avatar: "", role: authorRole },
    faq,
  })

  const save = async (overrideStatus?: Post["status"]) => {
    if (!title.trim()) { showToast("Title is required", "error"); return }
    if (!slug.trim()) { showToast("Slug is required", "error"); return }
    if (!content.trim()) { showToast("Content is required", "error"); return }
    const user = getCurrentUser()
    if (!user) return
    setSaving(true)
    const body = { ...payload(), ...(overrideStatus ? { status: overrideStatus } : {}) }
    try {
      if (isNew) {
        const r = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "x-user-id": user.id, "content-type": "application/json" },
          body: JSON.stringify(body),
        })
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || "Failed")
        showToast("Article created!")
        router.push(`/admin/blog/${d.post.id}`)
      } else {
        const r = await fetch(`/api/admin/blog/${id}`, {
          method: "PUT",
          headers: { "x-user-id": user.id, "content-type": "application/json" },
          body: JSON.stringify(body),
        })
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || "Failed")
        if (overrideStatus) setStatus(overrideStatus)
        showToast("Saved!")
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error saving", "error")
    } finally {
      setSaving(false)
    }
  }

  // LinkedIn manual post
  const postToLinkedIn = async () => {
    const user = getCurrentUser()
    if (!user || isNew) return
    setLiPosting(true)
    try {
      const r = await fetch(`/api/admin/blog/${id}/linkedin`, {
        method: "POST",
        headers: { "x-user-id": user.id, "content-type": "application/json" },
        body: JSON.stringify({ target: liTarget }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Failed")
      if (d.personPostId) setLiPersonPostId(d.personPostId)
      if (d.orgPostId) setLiOrgPostId(d.orgPostId)
      showToast("Posted to LinkedIn!")
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "LinkedIn post failed", "error")
    } finally {
      setLiPosting(false)
    }
  }

  // Tag helpers
  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-")
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput("")
  }
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  // FAQ helpers
  const addFaq = () => setFaq([...faq, { q: "", a: "" }])
  const updateFaq = (i: number, field: "q" | "a", val: string) => {
    const next = [...faq]; next[i] = { ...next[i], [field]: val }; setFaq(next)
  }
  const removeFaq = (i: number) => setFaq(faq.filter((_, j) => j !== i))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full -m-4 lg:-m-6">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium",
          toast.type === "success" ? "bg-green-600 text-white" : "bg-rose-600 text-white",
        )}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <Link href="/admin/blog" className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title…"
          className="flex-1 text-lg font-semibold bg-transparent border-none outline-none placeholder:text-gray-300"
        />
        <div className="flex items-center gap-2 shrink-0">
          {status === "PUBLISHED" && (
            <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <Eye className="h-3.5 w-3.5" /> Preview
            </a>
          )}
          <Button variant="outline" size="sm" onClick={() => save()} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save draft
          </Button>
          <Button size="sm" onClick={() => save("PUBLISHED")} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left: content editor ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col border-r border-gray-200 min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
            {(["write", "preview"] as const).map((t) => (
              <button key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors",
                  tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700",
                )}>
                {t}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">
              {content.split(/\s+/).filter(Boolean).length} words · {calcReadTime(content)}
            </span>
          </div>

          {tab === "write" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"Start writing in Markdown…\n\n## Section heading\n\n**Bold**, *italic*, > blockquote\n\n| Col 1 | Col 2 |\n|-------|-------|\n| data  | data  |"}
              className="flex-1 w-full p-5 font-mono text-sm leading-relaxed bg-white border-none outline-none resize-none text-gray-800 placeholder:text-gray-200"
              style={{ minHeight: "70vh" }}
              spellCheck={false}
            />
          ) : (
            <div className="flex-1 overflow-auto p-6 bg-white">
              {content.trim() ? (
                <div className="max-w-2xl mx-auto prose prose-sm">
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{title}</h1>
                  <ArticleContent content={content} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300 text-sm">
                  Nothing to preview yet — start writing on the Write tab
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: settings panel ─────────────────────────────────────────── */}
        <div className="w-72 xl:w-80 shrink-0 overflow-y-auto bg-white">
          <div className="p-4 space-y-5 text-sm">

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Post["status"])}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-primary">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</label>
              <Input value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
                className="h-8 text-xs font-mono"
                placeholder="article-slug"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-primary">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags</label>
              <div className="flex gap-1.5">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
                  placeholder="tag" className="h-8 text-xs flex-1" />
                <Button size="sm" variant="outline" onClick={addTag} className="h-8 px-2">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-0.5">
                      <Hash className="h-2.5 w-2.5 text-gray-400" />
                      {t}
                      <button onClick={() => removeTag(t)} className="text-gray-400 hover:text-rose-500 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Excerpt</label>
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                rows={3} placeholder="Short description shown in article cards…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs resize-none outline-none focus:border-primary leading-relaxed" />
            </div>

            {/* Publish date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Publish date</label>
              <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="h-8 text-xs" />
            </div>

            <hr className="border-gray-100" />

            {/* LinkedIn */}
            {!isNew && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-[#0A66C2]">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">LinkedIn</p>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-1.5">
                  {liPersonPostId ? (
                    <span className="text-[11px] bg-blue-50 text-[#0A66C2] px-2 py-0.5 rounded-full font-medium">
                      ✓ Личный профиль
                    </span>
                  ) : (
                    <span className="text-[11px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                      — Личный профиль
                    </span>
                  )}
                  {liConfig?.hasOrg && (
                    liOrgPostId ? (
                      <span className="text-[11px] bg-blue-50 text-[#0A66C2] px-2 py-0.5 rounded-full font-medium">
                        ✓ {liConfig.orgName || "Страница"}
                      </span>
                    ) : (
                      <span className="text-[11px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                        — {liConfig.orgName || "Страница"}
                      </span>
                    )
                  )}
                </div>

                {status === "PUBLISHED" && liConfig?.connected ? (
                  <div className="space-y-2">
                    {/* Target selector */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px]">
                      {(["person", ...(liConfig.hasOrg ? ["org", "both"] : [])] as LiTarget[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setLiTarget(t)}
                          className={cn(
                            "flex-1 py-1.5 font-medium transition-colors",
                            liTarget === t
                              ? "bg-[#0A66C2] text-white"
                              : "text-gray-500 hover:bg-gray-50"
                          )}
                        >
                          {t === "person" ? "Личный" : t === "org" ? "Страница" : "Оба"}
                        </button>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white gap-1.5 text-xs h-8"
                      onClick={postToLinkedIn}
                      disabled={liPosting}
                    >
                      {liPosting
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      }
                      {(liPersonPostId || liOrgPostId) ? "Опубликовать повторно" : "Опубликовать в LinkedIn"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {!liConfig?.connected
                      ? "Подключи LinkedIn в настройках"
                      : "Сначала опубликуй статью"
                    }
                  </p>
                )}
              </div>
            )}

            <hr className="border-gray-100" />

            {/* SEO */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO</p>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Meta title
                  <span className={cn("ml-1 tabular-nums", metaTitle.length > 60 ? "text-rose-500" : "text-gray-300")}>
                    {metaTitle.length}/60
                  </span>
                </label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                  className={cn("h-8 text-xs", metaTitle.length > 60 && "border-rose-300 focus:border-rose-500")}
                  placeholder="SEO title (60 chars)" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Meta description
                  <span className={cn("ml-1 tabular-nums", metaDesc.length > 160 ? "text-rose-500" : "text-gray-300")}>
                    {metaDesc.length}/160
                  </span>
                </label>
                <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3}
                  className={cn("w-full border rounded-lg px-3 py-2 text-xs resize-none outline-none focus:border-primary leading-relaxed",
                    metaDesc.length > 160 ? "border-rose-300" : "border-gray-200")}
                  placeholder="SEO description (160 chars)" />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Cover preview */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cover preview</p>
              <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                <BlogCover
                  title={title || "Post title"}
                  category={category}
                  slug={slug}
                  size="card"
                />
              </div>
              <p className="text-[11px] text-gray-400">Generated automatically from category &amp; slug</p>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Alt text</label>
                <Input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} className="h-8 text-xs" placeholder="Describe the image for SEO" />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Author */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</p>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Name</label>
                <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Role</label>
                <Input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} className="h-8 text-xs" placeholder="e.g. Web3 Career Strategist" />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* FAQ */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" /> FAQ ({faq.length})
                </p>
                <Button size="sm" variant="outline" onClick={addFaq} className="h-6 px-2 text-xs gap-1">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              {faq.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Q{i + 1}</span>
                    <button onClick={() => removeFaq(i)} className="text-gray-300 hover:text-rose-500 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <textarea value={item.q} onChange={(e) => updateFaq(i, "q", e.target.value)}
                    rows={2} placeholder="Question…"
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-none outline-none focus:border-primary bg-white" />
                  <textarea value={item.a} onChange={(e) => updateFaq(i, "a", e.target.value)}
                    rows={3} placeholder="Answer…"
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-none outline-none focus:border-primary bg-white" />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
