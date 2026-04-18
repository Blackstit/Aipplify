"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Star,
  BadgeCheck,
  Archive,
  RefreshCcw,
  Trash2,
  FileEdit,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { JobMetricPills } from "@/components/JobMetricPills"

interface CompanyLite {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  verified: boolean
}

interface AdminJobRow {
  id: string
  slug: string
  title: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  source: "PARSED" | "HR_ADDED" | "COMPANY_ADDED" | "SELF_POSTED" | "JOB_ECO"
  externalId: number | null
  sourceUrl: string | null
  featured: boolean
  verified: boolean
  aiScore: number | null
  locationText: string
  workType: "REMOTE" | "HYBRID" | "OFFICE"
  experience: string
  salaryText: string | null
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
  countryCity: string | null
  postedAt: string | null
  createdAt: string
  updatedAt: string
  lastSeenAt: string | null
  viewCount: number
  applyCount: number
  tags: string[]
  company: CompanyLite | null
}

interface AdminJobsResponse {
  jobs: AdminJobRow[]
  total: number
  page: number
  limit: number
  totalPages: number
  stats: {
    published: number
    archived: number
    drafted: number
    featured: number
    verified: number
    lastSeenAt: string | null
  }
}

interface SyncResult {
  jobsSaved: number
  jobsUpdated: number
  companiesSaved: number
  pagesFetched: number
  archived: number
  seen: number
  errors: string[]
  durationMs: number
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  ARCHIVED: "bg-gray-100 text-gray-500 border border-gray-200",
  DRAFT: "bg-amber-100 text-amber-700 border border-amber-200",
}

const SOURCE_STYLES: Record<string, string> = {
  JOB_ECO: "bg-violet-100 text-violet-700 border border-violet-200",
  PARSED: "bg-sky-100 text-sky-700 border border-sky-200",
  HR_ADDED: "bg-orange-100 text-orange-700 border border-orange-200",
  COMPANY_ADDED: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  SELF_POSTED: "bg-gray-100 text-gray-700 border border-gray-200",
}

const FILTER_BTN = "px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer"
const FILTER_ACTIVE = "bg-primary text-white border-primary"
const FILTER_INACTIVE = "bg-white text-gray-600 border-gray-200 hover:border-primary/50"

function fmtRel(iso: string | null): string {
  if (!iso) return "—"
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return "—"
  }
}

function fmtSalary(j: AdminJobRow): string {
  if (j.salaryText && j.salaryText.trim()) return j.salaryText
  const cur = j.currency || "USD"
  if (j.salaryMin != null && j.salaryMax != null)
    return `$${j.salaryMin.toLocaleString()} – $${j.salaryMax.toLocaleString()} ${cur}`
  if (j.salaryMax != null) return `Up to $${j.salaryMax.toLocaleString()} ${cur}`
  if (j.salaryMin != null) return `From $${j.salaryMin.toLocaleString()} ${cur}`
  return "—"
}

export default function AdminJobsPage() {
  const [data, setData] = useState<AdminJobsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [status, setStatus] = useState("")
  const [source, setSource] = useState("")
  const [featuredFilter, setFeaturedFilter] = useState("")
  const [verifiedFilter, setVerifiedFilter] = useState("")
  const [page, setPage] = useState(1)

  const fetchJobs = useCallback(async () => {
    const user = getCurrentUser()
    if (!user) return
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "25" })
    if (search) params.set("search", search)
    if (status) params.set("status", status)
    if (source) params.set("source", source)
    if (featuredFilter) params.set("featured", featuredFilter)
    if (verifiedFilter) params.set("verified", verifiedFilter)
    try {
      const res = await fetch(`/api/admin/jobs?${params}`, { headers: { "x-user-id": user.id } })
      const json: AdminJobsResponse = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }, [page, search, status, source, featuredFilter, verifiedFilter])

  useEffect(() => { fetchJobs() }, [fetchJobs])
  useEffect(() => { setPage(1) }, [search, status, source, featuredFilter, verifiedFilter])

  const withPending = (id: string, fn: () => Promise<unknown>) => async () => {
    const user = getCurrentUser()
    if (!user) return
    setPendingIds((s) => new Set(s).add(id))
    try {
      await fn()
    } finally {
      setPendingIds((s) => {
        const next = new Set(s)
        next.delete(id)
        return next
      })
    }
  }

  const patchJob = (id: string, body: Record<string, unknown>) =>
    withPending(id, async () => {
      const user = getCurrentUser()
      if (!user) return
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const j = await res.json()
        setData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            jobs: prev.jobs.map((row) =>
              row.id === id
                ? {
                    ...row,
                    featured: j.job.featured,
                    verified: j.job.verified,
                    status: j.job.status,
                  }
                : row,
            ),
          }
        })
      } else {
        alert("Не удалось обновить вакансию")
      }
    })

  const deleteJob = (id: string, title: string) =>
    withPending(id, async () => {
      const user = getCurrentUser()
      if (!user) return
      if (!confirm(`Удалить "${title}"? Это действие необратимо.`)) return
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": user.id },
      })
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev
          return { ...prev, jobs: prev.jobs.filter((r) => r.id !== id), total: prev.total - 1 }
        })
      } else {
        alert("Не удалось удалить")
      }
    })

  const handleSync = async () => {
    const user = getCurrentUser()
    if (!user) return
    if (syncing) return
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch(`/api/admin/jobs/sync`, {
        method: "POST",
        headers: { "x-user-id": user.id },
      })
      const json = await res.json()
      if (res.ok) setSyncResult(json)
      else alert(json.error || "Sync failed")
      await fetchJobs()
    } catch (e) {
      alert(`Sync error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data ? (
              <>
                {data.total.toLocaleString()} total ·{" "}
                <span className="text-emerald-700">{data.stats.published} published</span> ·{" "}
                <span className="text-gray-500">{data.stats.archived} archived</span> ·{" "}
                <span className="text-amber-700">{data.stats.drafted} draft</span>
              </>
            ) : (
              "Loading..."
            )}
            {data?.stats.lastSeenAt && (
              <>
                {" · "}last upstream seen {fmtRel(data.stats.lastSeenAt)}
              </>
            )}
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing} className="gap-2">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          {syncing ? "Syncing…" : "Sync from job-eco"}
        </Button>
      </div>

      {syncResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          <p className="font-medium">
            Sync done in {Math.round(syncResult.durationMs / 100) / 10}s · {syncResult.pagesFetched} pages
          </p>
          <p className="text-emerald-700 mt-1">
            +{syncResult.jobsSaved} new · {syncResult.jobsUpdated} updated · {syncResult.archived} archived ·{" "}
            {syncResult.companiesSaved} new companies
          </p>
          {syncResult.errors.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-rose-700">
                {syncResult.errors.length} error(s)
              </summary>
              <ul className="list-disc ml-5 mt-1 text-rose-700 space-y-0.5">
                {syncResult.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Search + filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSearch(searchInput)
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title, slug, company..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">Search</Button>
          {(search || status || source || featuredFilter || verifiedFilter) && (
            <Button
              type="button"
              variant="ghost"
              className="text-gray-500"
              onClick={() => {
                setSearch("")
                setSearchInput("")
                setStatus("")
                setSource("")
                setFeaturedFilter("")
                setVerifiedFilter("")
              }}
            >
              Clear
            </Button>
          )}
        </form>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</span>
            {["", "PUBLISHED", "ARCHIVED", "DRAFT"].map((v) => (
              <button
                key={v || "all-status"}
                onClick={() => setStatus(v)}
                className={cn(FILTER_BTN, status === v ? FILTER_ACTIVE : FILTER_INACTIVE)}
              >
                {v || "All"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Source</span>
            {["", "JOB_ECO", "HR_ADDED", "COMPANY_ADDED", "SELF_POSTED", "PARSED"].map((v) => (
              <button
                key={v || "all-source"}
                onClick={() => setSource(v)}
                className={cn(FILTER_BTN, source === v ? FILTER_ACTIVE : FILTER_INACTIVE)}
              >
                {v === "JOB_ECO" ? "job-eco" : v ? v.replace("_", " ").toLowerCase() : "All"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Featured</span>
            {[
              { v: "", l: "All" },
              { v: "true", l: "Yes" },
              { v: "false", l: "No" },
            ].map(({ v, l }) => (
              <button
                key={`f-${v || "all"}`}
                onClick={() => setFeaturedFilter(v)}
                className={cn(FILTER_BTN, featuredFilter === v ? FILTER_ACTIVE : FILTER_INACTIVE)}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Verified</span>
            {[
              { v: "", l: "All" },
              { v: "true", l: "Yes" },
              { v: "false", l: "No" },
            ].map(({ v, l }) => (
              <button
                key={`v-${v || "all"}`}
                onClick={() => setVerifiedFilter(v)}
                className={cn(FILTER_BTN, verifiedFilter === v ? FILTER_ACTIVE : FILTER_INACTIVE)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.jobs.length ? (
          <div className="flex items-center justify-center h-48 text-gray-400">No jobs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Status</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Source</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">AI</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Posted</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Metrics</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Flags</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.jobs.map((j) => {
                  const busy = pendingIds.has(j.id)
                  return (
                    <tr key={j.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <Link
                            href={`/jobs/${j.slug}`}
                            target="_blank"
                            className="font-medium text-gray-900 hover:text-primary truncate max-w-[380px] inline-flex items-center gap-1.5"
                            title={j.title}
                          >
                            {j.title}
                            <ExternalLink className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="truncate max-w-[220px]">
                              {j.company?.name || "Unknown company"}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="uppercase tracking-wide">{j.workType.toLowerCase()}</span>
                            <span className="text-gray-300">·</span>
                            <span>{j.countryCity || j.locationText || "—"}</span>
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[420px]">
                            {fmtSalary(j)}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded", STATUS_STYLES[j.status])}>
                          {j.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded", SOURCE_STYLES[j.source])}>
                          {j.source === "JOB_ECO" ? "job-eco" : j.source.replace("_", " ").toLowerCase()}
                        </span>
                        {j.externalId != null && (
                          <div className="text-[10px] text-gray-400 mt-0.5">#{j.externalId}</div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs hidden md:table-cell">
                        {j.aiScore != null ? (
                          <span className="font-semibold">{j.aiScore.toFixed(1)}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500 hidden lg:table-cell whitespace-nowrap">
                        {fmtRel(j.postedAt || j.createdAt)}
                      </td>
                      <td className="px-3 py-3 hidden xl:table-cell align-top">
                        <JobMetricPills views={j.viewCount} applies={j.applyCount} size="sm" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={patchJob(j.id, { verified: !j.verified })}
                            disabled={busy}
                            title={j.verified ? "Снять verified" : "Пометить verified"}
                            className={cn(
                              "p-1.5 rounded-md border transition-colors",
                              j.verified
                                ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                                : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50",
                            )}
                          >
                            <BadgeCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={patchJob(j.id, { featured: !j.featured })}
                            disabled={busy}
                            title={j.featured ? "Снять featured" : "Пометить featured"}
                            className={cn(
                              "p-1.5 rounded-md border transition-colors",
                              j.featured
                                ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                                : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50",
                            )}
                          >
                            <Star className={cn("h-4 w-4", j.featured && "fill-current")} />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {j.status === "PUBLISHED" ? (
                            <button
                              onClick={patchJob(j.id, { status: "ARCHIVED" })}
                              disabled={busy}
                              title="Сделать неактивной"
                              className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={patchJob(j.id, { status: "PUBLISHED" })}
                              disabled={busy}
                              title="Опубликовать"
                              className="p-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          {j.status !== "DRAFT" && (
                            <button
                              onClick={patchJob(j.id, { status: "DRAFT" })}
                              disabled={busy}
                              title="В черновик"
                              className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <FileEdit className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={deleteJob(j.id, j.title)}
                            disabled={busy}
                            title="Удалить"
                            className="p-1.5 rounded-md border border-rose-200 bg-white text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Page {data.page} of {data.totalPages} · {data.total} jobs
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1 || loading}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(data.totalPages - 4, page - 2)) + i
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className="h-7 w-7 px-0"
                  >
                    {p}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages || loading}
                className="h-7 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
