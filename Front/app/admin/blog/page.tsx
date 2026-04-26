"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import {
  Plus, Search, Edit2, Trash2, Eye, Tag,
  FileText, CheckCircle2, Clock, Archive, ExternalLink,
  ChevronDown, BookOpen, FolderOpen, Loader2,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AdminPost {
  id: string
  slug: string
  title: string
  category: string
  status: "PUBLISHED" | "DRAFT" | "SCHEDULED" | "ARCHIVED"
  publishedAt: string
  scheduledAt?: string
  views: number
  tags: string[]
  excerpt: string
  linkedinPersonPostId?: string
  linkedinOrgPostId?: string
  author: { name: string }
  readTime: string
}

interface Counts { published: number; draft: number; scheduled: number; archived: number }

const STATUS_META = {
  PUBLISHED: { label: "Published", color: "bg-green-100 text-green-700",  icon: CheckCircle2 },
  DRAFT:     { label: "Draft",     color: "bg-yellow-100 text-yellow-700", icon: Clock },
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-700",    icon: Clock },
  ARCHIVED:  { label: "Archived",  color: "bg-gray-100 text-gray-500",    icon: Archive },
} as const

const TABS = ["All", "Published", "Scheduled", "Draft", "Archived"] as const
type Tab = typeof TABS[number]

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [counts, setCounts] = useState<Counts>({ published: 0, draft: 0, scheduled: 0, archived: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<Tab>("All")
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(async () => {
    const user = getCurrentUser()
    if (!user) return
    const r = await fetch("/api/admin/blog", { headers: { "x-user-id": user.id } })
    const d = await r.json()
    setPosts(d.posts || [])
    setCounts(d.counts || { published: 0, draft: 0, scheduled: 0, archived: 0 })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Close menu on outside click
  useEffect(() => {
    const close = () => setOpenMenu(null)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  const filtered = posts
    .filter((p) => tab === "All" || p.status === tab.toUpperCase())
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const user = getCurrentUser()
    if (!user) return
    setDeleting(id)
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE", headers: { "x-user-id": user.id } })
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setCounts((c) => {
      const post = posts.find((p) => p.id === id)
      if (!post) return c
      const key = post.status.toLowerCase() as keyof Counts
      return { ...c, [key]: Math.max(0, (c[key] ?? 0) - 1) }
    })
    setDeleting(null)
  }

  const handleStatus = async (id: string, status: string) => {
    const user = getCurrentUser()
    if (!user) return
    setSaving(id)
    setOpenMenu(null)
    await fetch(`/api/admin/blog/${id}`, {
      method: "PUT",
      headers: { "x-user-id": user.id, "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
    await load()
    setSaving(null)
  }

  const tabCounts: Record<Tab, number> = {
    All: posts.length,
    Published: counts.published,
    Scheduled: counts.scheduled,
    Draft: counts.draft,
    Archived: counts.archived,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-gray-400" />
            Blog Articles
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {posts.length} total · {counts.published} published
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/blog/categories">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FolderOpen className="h-4 w-4" />
              Categories
            </Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {(["Published", "Draft", "Archived"] as const).map((s) => {
          const m = STATUS_META[s.toUpperCase() as keyof typeof STATUS_META]
          return (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={cn(
                "bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                tab === s ? "border-primary/40 ring-1 ring-primary/20" : "border-gray-200",
              )}
            >
              <p className="text-2xl font-bold">{tabCounts[s]}</p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <m.icon className="h-3 w-3" />
                {m.label}
              </p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700",
              )}
            >
              {t}
              <span className={cn(
                "ml-1.5 px-1 py-0.5 rounded text-[10px] font-bold",
                tab === t ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-500",
              )}>
                {tabCounts[t]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No articles found</p>
            <Link href="/admin/blog/new">
              <Button size="sm" className="mt-4 gap-1.5">
                <Plus className="h-4 w-4" />
                Create first article
              </Button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Title</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">
                  <Eye className="h-3.5 w-3.5 inline" /> Views
                </th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((post) => {
                const m = STATUS_META[post.status]
                const isDeleting = deleting === post.id
                const isSaving = saving === post.id
                return (
                  <tr key={post.id} className={cn("hover:bg-gray-50/50 transition-colors", isDeleting && "opacity-40")}>
                    <td className="px-4 py-3 max-w-xs">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="font-medium text-gray-900 hover:text-primary transition-colors line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{post.excerpt}</p>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-xs bg-primary/5 text-primary px-2 py-0.5 rounded-full font-medium">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", m.color)}>
                        <m.icon className="h-3 w-3" />
                        {m.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="h-3 w-3" />
                        {post.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell text-xs text-gray-400">
                      {format(new Date(post.publishedAt), "dd MMM yyyy")}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Preview */}
                        {post.status === "PUBLISHED" && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                            title="Preview"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {/* LinkedIn status */}
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="p-1.5 rounded-md transition-colors"
                          title={
                            post.linkedinOrgPostId && post.linkedinPersonPostId ? "Posted to LinkedIn (both)"
                            : post.linkedinOrgPostId ? "Posted to LinkedIn (company page)"
                            : post.linkedinPersonPostId ? "Posted to LinkedIn (personal)"
                            : "Not posted to LinkedIn"
                          }
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={cn(
                              "h-3.5 w-3.5",
                              (post.linkedinPersonPostId || post.linkedinOrgPostId)
                                ? "text-[#0A66C2]"
                                : "text-gray-300"
                            )}
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </Link>
                        {/* Edit */}
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="p-1.5 text-gray-400 hover:text-primary rounded-md hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        {/* Status dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === post.id ? null : post.id) }}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                            title="Change status"
                          >
                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                          {openMenu === post.id && (
                            <div
                              className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {(["PUBLISHED", "SCHEDULED", "DRAFT", "ARCHIVED"] as const).map((s) => {
                                const sm = STATUS_META[s]
                                return (
                                  <button
                                    key={s}
                                    disabled={post.status === s}
                                    onClick={() => handleStatus(post.id, s)}
                                    className={cn(
                                      "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors",
                                      post.status === s ? "opacity-40 cursor-default" : "",
                                    )}
                                  >
                                    <sm.icon className="h-3 w-3" />
                                    {sm.label}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={isDeleting}
                          className="p-1.5 text-gray-300 hover:text-rose-500 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
