"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { FiltersSidebar } from "@/components/FiltersSidebar"
import { RightPanel } from "@/components/RightPanel"
import { Footer } from "@/components/Footer"
import { JobsSearchBar } from "@/components/JobsSearchBar"
import { JobsToolbar } from "@/components/JobsToolbar"
import { ScrollToTop } from "@/components/ScrollToTop"
import { JobCard } from "@/components/JobCard"
import { PromoCard } from "@/components/PromoCard"
import { RecruiterContactForm } from "@/components/RecruiterContactForm"
import type { JobFrontend } from "@/lib/jobs"
import type { JobFilters } from "@/types/filters"
import { defaultFilters } from "@/types/filters"
import { ChevronLeft, ChevronRight } from "lucide-react"

const PER_PAGE = 10

const SORT_TO_API: Record<string, string> = {
  newest: "date_desc",
  oldest: "date_asc",
  "salary-high": "salary_desc",
  "salary-low": "salary_asc",
  "score-high": "score_desc",
  "score-low": "score_asc",
  relevance: "score_desc",
}

const API_TO_SORT: Record<string, string> = Object.fromEntries(
  Object.entries(SORT_TO_API).map(([k, v]) => [v, k]),
)

interface Props {
  initialJobs: JobFrontend[]
  initialPage: number
  initialTotal: number
  initialTotalPages: number
  initialSearch: string
  initialSort: string
}

function buildPageUrl(page: number, search: string, apiSort: string): string {
  const params = new URLSearchParams()
  if (page > 1) params.set("page", String(page))
  if (search) params.set("search", search)
  if (apiSort && apiSort !== "date_desc") params.set("sort", apiSort)
  const qs = params.toString()
  return qs ? `/jobs?${qs}` : "/jobs"
}

export function JobsPageClient({
  initialJobs,
  initialPage,
  initialTotal,
  initialTotalPages,
  initialSearch,
  initialSort,
}: Props) {
  const [jobs, setJobs] = useState<JobFrontend[]>(initialJobs)
  const [page, setPage] = useState(initialPage)
  const [total, setTotal] = useState(initialTotal)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortBy, setSortBy] = useState(API_TO_SORT[initialSort] || "newest")
  const [hideViewed, setHideViewed] = useState(false)
  const [filters, setFilters] = useState<JobFilters>(defaultFilters)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [viewedJobs, setViewedJobs] = useState<string[]>([])
  const mainRef = useRef<HTMLElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const stateRef = useRef({ searchQuery, sortBy, page, totalPages, filters })
  const filtersInitRef = useRef(true)

  useEffect(() => {
    stateRef.current = { searchQuery, sortBy, page, totalPages, filters }
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = JSON.parse(localStorage.getItem("viewedJobs") || "[]") as string[]
    setViewedJobs(stored)
    const handler = () => {
      const s = JSON.parse(localStorage.getItem("viewedJobs") || "[]") as string[]
      setViewedJobs(s)
    }
    window.addEventListener("job-viewed", handler)
    return () => window.removeEventListener("job-viewed", handler)
  }, [])

  const doFetch = useCallback(
    async (
      pageNum: number,
      search: string,
      apiSort: string,
      push: boolean,
      f?: JobFilters,
    ) => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const activeFilters = f ?? stateRef.current.filters

      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", String(pageNum))
        params.set("limit", String(PER_PAGE))
        if (search) params.set("search", search)
        params.set("sort", apiSort)

        if (activeFilters.workFormat.length > 0)
          params.set("workType", activeFilters.workFormat.join(","))
        if (activeFilters.grade.length > 0)
          params.set("experience", activeFilters.grade.join(","))
        if (activeFilters.minSalary)
          params.set("salary_min", activeFilters.minSalary)

        const res = await fetch(`/api/jobs?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error("fetch failed")
        const data = await res.json()

        setJobs(data.jobs || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
        setPage(pageNum)
        setLastUpdated(new Date())

        if (push) {
          const url = buildPageUrl(pageNum, search, apiSort)
          history.pushState({ page: pageNum }, "", url)
        }

        window.scrollTo({
          top: Math.max(0, (mainRef.current?.offsetTop ?? 0) - 20),
          behavior: "smooth",
        })
      } catch (e) {
        if ((e as Error).name === "AbortError") return
        console.error("Fetch error:", e)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const handler = () => {
      const sp = new URLSearchParams(window.location.search)
      const p = parseInt(sp.get("page") || "1")
      const s = sp.get("search") || ""
      const so = sp.get("sort") || "date_desc"
      setSearchQuery(s)
      setSortBy(API_TO_SORT[so] || "newest")
      doFetch(p, s, so, false)
    }
    window.addEventListener("popstate", handler)
    return () => window.removeEventListener("popstate", handler)
  }, [doFetch])

  const handleFiltersChange = useCallback(
    (newFilters: JobFilters) => {
      setFilters(newFilters)
      if (filtersInitRef.current) {
        filtersInitRef.current = false
        return
      }
      const apiSort = SORT_TO_API[stateRef.current.sortBy] || "date_desc"
      doFetch(1, stateRef.current.searchQuery, apiSort, true, newFilters)
    },
    [doFetch],
  )

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query)
      const apiSort = SORT_TO_API[stateRef.current.sortBy] || "date_desc"
      doFetch(1, query, apiSort, true)
    },
    [doFetch],
  )

  const handleSortChange = useCallback(
    (sort: string) => {
      setSortBy(sort)
      const apiSort = SORT_TO_API[sort] || "date_desc"
      doFetch(1, stateRef.current.searchQuery, apiSort, true)
    },
    [doFetch],
  )

  const handleRefresh = useCallback(() => {
    const { searchQuery: s, sortBy: sb, page: p } = stateRef.current
    const apiSort = SORT_TO_API[sb] || "date_desc"
    doFetch(p, s, apiSort, false)
  }, [doFetch])

  const handlePageClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, pageNum: number) => {
      e.preventDefault()
      const { page: p, totalPages: tp } = stateRef.current
      if (pageNum < 1 || pageNum > tp || pageNum === p) return
      const { searchQuery: s, sortBy: sb } = stateRef.current
      const apiSort = SORT_TO_API[sb] || "date_desc"
      doFetch(pageNum, s, apiSort, true)
    },
    [doFetch],
  )

  let displayJobs = jobs

  if (filters.skills.length > 0) {
    displayJobs = displayJobs.filter((j) => {
      const jobTags = j.tags.map((t) => t.toLowerCase())
      return filters.skillsOrMode
        ? filters.skills.some((s) => jobTags.includes(s.toLowerCase()))
        : filters.skills.every((s) => jobTags.includes(s.toLowerCase()))
    })
  }
  if (filters.excludedSkills.length > 0) {
    displayJobs = displayJobs.filter((j) => {
      const jobTags = j.tags.map((t) => t.toLowerCase())
      return !filters.excludedSkills.some((s) => jobTags.includes(s.toLowerCase()))
    })
  }
  if (filters.specializations.length > 0) {
    displayJobs = displayJobs.filter((j) =>
      filters.specializations.some(
        (sp) =>
          j.title.toLowerCase().includes(sp.toLowerCase()) ||
          j.specialization?.toLowerCase().includes(sp.toLowerCase()),
      ),
    )
  }

  if (hideViewed && viewedJobs.length > 0) {
    displayJobs = displayJobs.filter((j) => !viewedJobs.includes(j.slug))
  }

  const currentApiSort = SORT_TO_API[sortBy] || "date_desc"
  const getPageUrl = (p: number) =>
    buildPageUrl(p, searchQuery, currentApiSort)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-5">
          <aside className="hidden lg:block">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-1 scrollbar-thin">
              <FiltersSidebar filters={filters} onFiltersChange={handleFiltersChange} />
            </div>
          </aside>

          <main ref={mainRef}>
            <JobsSearchBar
              onSearchChange={handleSearchChange}
              defaultValue={initialSearch}
            />
            <JobsToolbar
              totalJobs={total}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              onHideViewedChange={setHideViewed}
              onRefresh={handleRefresh}
              lastUpdated={lastUpdated}
            />

            <div className="jobs-list-container space-y-4 relative min-h-[200px]">
              {loading && jobs.length > 0 && (
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-2"
                  aria-hidden
                >
                  <div className="h-1 w-48 max-w-[90%] rounded-full bg-gray-200 overflow-hidden shadow-sm">
                    <div className="h-full w-2/5 bg-primary animate-pulse rounded-full" />
                  </div>
                </div>
              )}
              {loading && jobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
                  <p className="text-gray-500">Loading jobs...</p>
                </div>
              ) : displayJobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No jobs found</p>
                </div>
              ) : (
                displayJobs.map((job, i) => (
                  <div key={job.id}>
                    <JobCard job={job} />
                    {(i + 1) % 5 === 0 && i < displayJobs.length - 1 && (
                      <div className="my-4">
                        <PromoCard variant={i % 10 === 4 ? "ai" : "default"} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageClick={handlePageClick}
                getUrl={getPageUrl}
              />
            )}

            <div className="my-6">
              <RecruiterContactForm />
            </div>
          </main>

          <aside className="hidden lg:block">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

function Pagination({
  currentPage,
  totalPages,
  onPageClick,
  getUrl,
}: {
  currentPage: number
  totalPages: number
  onPageClick: (e: React.MouseEvent<HTMLAnchorElement>, page: number) => void
  getUrl: (page: number) => string
}) {
  const pages: (number | "dots")[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push("dots")
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push("dots")
    pages.push(totalPages)
  }

  const link =
    "inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-colors"
  const active = `${link} bg-gradient-primary text-white shadow-sm`
  const normal = `${link} border border-gray-200 hover:border-primary hover:text-primary`
  const disabled =
    "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed"

  return (
    <nav
      className="pagination flex items-center justify-center gap-1.5 pt-6 pb-8"
      aria-label="Pagination"
    >
      {currentPage > 1 ? (
        <a
          href={getUrl(currentPage - 1)}
          onClick={(e) => onPageClick(e, currentPage - 1)}
          rel="prev"
          className={normal}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </a>
      ) : (
        <span className={disabled} aria-disabled="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p, i) => {
        if (p === "dots") {
          return (
            <span key={`d${i}`} className="px-1.5 text-gray-400 select-none">
              &hellip;
            </span>
          )
        }
        return (
          <a
            key={p}
            href={getUrl(p)}
            onClick={(e) => onPageClick(e, p)}
            data-page={p}
            className={p === currentPage ? active : normal}
            aria-current={p === currentPage ? "page" : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </a>
        )
      })}

      {currentPage < totalPages ? (
        <a
          href={getUrl(currentPage + 1)}
          onClick={(e) => onPageClick(e, currentPage + 1)}
          rel="next"
          className={normal}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </a>
      ) : (
        <span className={disabled} aria-disabled="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
