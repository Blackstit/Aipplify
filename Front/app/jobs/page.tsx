"use client"

import { useState, useEffect } from "react"
import { FiltersSidebar } from "@/components/FiltersSidebar"
import { JobList } from "@/components/JobList"
import { RightPanel } from "@/components/RightPanel"
import { Footer } from "@/components/Footer"
import { JobsSearchBar } from "@/components/JobsSearchBar"
import { JobsToolbar } from "@/components/JobsToolbar"
import { ScrollToTop } from "@/components/ScrollToTop"
import type { JobFrontend } from "@/lib/jobs"
import type { JobFilters } from "@/types/filters"
import { defaultFilters } from "@/types/filters"

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobFrontend[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")
  const [hideViewed, setHideViewed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<JobFilters>(defaultFilters)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      // Fetch all jobs (use a large limit or fetch without limit)
      const res = await fetch("/api/jobs?limit=10000")
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchJobs()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block">
            <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
          </aside>

          {/* Job List */}
          <main>
            <JobsSearchBar onSearchChange={setSearchQuery} />
            <JobsToolbar
              totalJobs={jobs.length}
              onSortChange={setSortBy}
              onHideViewedChange={setHideViewed}
              onRefresh={handleRefresh}
              lastUpdated={lastUpdated}
            />
            <JobList jobs={jobs} sortBy={sortBy} hideViewed={hideViewed} searchQuery={searchQuery} filters={filters} />
          </main>

          {/* Right Panel */}
          <aside className="hidden lg:block">
            <RightPanel />
          </aside>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
