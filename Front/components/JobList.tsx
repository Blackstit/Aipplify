"use client"

import { useState, useEffect, useMemo } from "react"
import type { JobFrontend as Job } from "@/lib/jobs"
import type { JobFilters } from "@/types/filters"
import { JobCard } from "./JobCard"
import { PromoCard } from "./PromoCard"
import { RecruiterContactForm } from "./RecruiterContactForm"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface JobListProps {
  jobs: Job[]
  sortBy?: string
  hideViewed?: boolean
  searchQuery?: string
  filters?: JobFilters
}

const ITEMS_PER_PAGE = 6
const PROMO_INTERVAL = 4 // Show promo card every N jobs

export function JobList({ jobs, sortBy = "newest", hideViewed = false, searchQuery = "", filters }: JobListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [viewedJobs, setViewedJobs] = useState<string[]>([])

  // Load viewed jobs from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("viewedJobs") || "[]") as string[]
      setViewedJobs(stored)
    }

    const handleJobViewed = () => {
      const stored = JSON.parse(localStorage.getItem("viewedJobs") || "[]") as string[]
      setViewedJobs(stored)
    }

    window.addEventListener("job-viewed", handleJobViewed)
    return () => window.removeEventListener("job-viewed", handleJobViewed)
  }, [])

  // Filter and sort jobs
  const processedJobs = useMemo(() => {
    let filtered = [...jobs]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((job) => {
        const titleMatch = job.title.toLowerCase().includes(query)
        const companyMatch = job.company.name.toLowerCase().includes(query)
        const tagsMatch = job.tags.some((tag) => tag.toLowerCase().includes(query))
        const descriptionMatch = job.description.toLowerCase().includes(query)
        return titleMatch || companyMatch || tagsMatch || descriptionMatch
      })
    }

    // Apply filters
    if (filters) {
      // Work Format filter
      if (filters.workFormat.length > 0) {
        filtered = filtered.filter((job) => {
          const jobWorkType = job.workType.toLowerCase()
          return filters.workFormat.some((format) => format.toLowerCase() === jobWorkType)
        })
      }
      if (filters.workFormatExclude.length > 0) {
        filtered = filtered.filter((job) => {
          const jobWorkType = job.workType.toLowerCase()
          return !filters.workFormatExclude.some((format) => format.toLowerCase() === jobWorkType)
        })
      }

      // Experience/Grade filter
      if (filters.grade.length > 0) {
        filtered = filtered.filter((job) => {
          const jobExperience = job.experience.toLowerCase()
          return filters.grade.some((grade) => {
            const gradeLower = grade.toLowerCase()
            if (gradeLower === "intern") return jobExperience === "intern"
            if (gradeLower === "junior") return jobExperience === "junior"
            if (gradeLower === "middle" || gradeLower === "mid") return jobExperience === "mid"
            if (gradeLower === "senior") return jobExperience === "senior"
            if (gradeLower === "lead" || gradeLower === "head" || gradeLower === "director" || gradeLower === "c-level") {
              return jobExperience === "lead"
            }
            return false
          })
        })
      }

      // Skills filter
      if (filters.skills.length > 0) {
        filtered = filtered.filter((job) => {
          const jobTags = job.tags.map((tag) => tag.toLowerCase())
          const filterSkills = filters.skills.map((skill) => skill.toLowerCase())
          
          if (filters.skillsOrMode) {
            // OR mode: job must have at least one skill
            return filterSkills.some((skill) => jobTags.some((tag) => tag.includes(skill) || skill.includes(tag)))
          } else {
            // AND mode: job must have all skills
            return filterSkills.every((skill) => jobTags.some((tag) => tag.includes(skill) || skill.includes(tag)))
          }
        })
      }
      if (filters.excludedSkills.length > 0) {
        filtered = filtered.filter((job) => {
          const jobTags = job.tags.map((tag) => tag.toLowerCase())
          const excludedSkills = filters.excludedSkills.map((skill) => skill.toLowerCase())
          return !excludedSkills.some((skill) => jobTags.some((tag) => tag.includes(skill) || skill.includes(tag)))
        })
      }

      // Specializations filter (based on tags)
      if (filters.specializations.length > 0) {
        filtered = filtered.filter((job) => {
          const jobTags = job.tags.map((tag) => tag.toLowerCase())
          const filterSpecs = filters.specializations.map((spec) => spec.toLowerCase())
          return filterSpecs.some((spec) => jobTags.some((tag) => tag.includes(spec) || spec.includes(tag)))
        })
      }
      if (filters.excludedSpecializations.length > 0) {
        filtered = filtered.filter((job) => {
          const jobTags = job.tags.map((tag) => tag.toLowerCase())
          const excludedSpecs = filters.excludedSpecializations.map((spec) => spec.toLowerCase())
          return !excludedSpecs.some((spec) => jobTags.some((tag) => tag.includes(spec) || spec.includes(tag)))
        })
      }

      // Location filter
      if (filters.countries.length > 0) {
        filtered = filtered.filter((job) => {
          const jobLocation = job.location.toLowerCase()
          return filters.countries.some((country) => {
            const countryLower = country.toLowerCase()
            if (countryLower === "remote") return job.workType === "remote"
            return jobLocation.includes(countryLower)
          })
        })
      }
      if (filters.excludedCountries.length > 0) {
        filtered = filtered.filter((job) => {
          const jobLocation = job.location.toLowerCase()
          return !filters.excludedCountries.some((country) => {
            const countryLower = country.toLowerCase()
            if (countryLower === "remote") return job.workType === "remote"
            return jobLocation.includes(countryLower)
          })
        })
      }

      // Min Salary filter
      if (filters.minSalary && filters.minSalary !== "") {
        const minSalaryNum = parseInt(filters.minSalary)
        if (!isNaN(minSalaryNum)) {
          filtered = filtered.filter((job) => {
            const salaryMatch = job.salary.match(/\d+/)
            if (salaryMatch) {
              const jobSalary = parseInt(salaryMatch[0])
              return jobSalary >= minSalaryNum
            }
            return false
          })
        }
      }

      // Currency filter
      if (filters.currency.length > 0) {
        filtered = filtered.filter((job) => {
          const jobSalary = job.salary.toLowerCase()
          return filters.currency.some((curr) => {
            const currLower = curr.toLowerCase()
            if (currLower === "usd") return jobSalary.includes("$") || jobSalary.includes("usd")
            if (currLower === "eur") return jobSalary.includes("€") || jobSalary.includes("eur")
            if (currLower === "rub") return jobSalary.includes("₽") || jobSalary.includes("rub") || jobSalary.includes("руб")
            return false
          })
        })
      }
    }

    // Hide viewed jobs if enabled
    if (hideViewed) {
      filtered = filtered.filter((job) => !viewedJobs.includes(job.slug))
    }

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
        case "salary-high":
          // Extract numeric salary values for comparison
          const aSalary = a.salary.match(/\d+/)?.[0] ? parseInt(a.salary.match(/\d+/)?.[0] || "0") : 0
          const bSalary = b.salary.match(/\d+/)?.[0] ? parseInt(b.salary.match(/\d+/)?.[0] || "0") : 0
          return bSalary - aSalary
        case "salary-low":
          const aSalaryLow = a.salary.match(/\d+/)?.[0] ? parseInt(a.salary.match(/\d+/)?.[0] || "0") : 0
          const bSalaryLow = b.salary.match(/\d+/)?.[0] ? parseInt(b.salary.match(/\d+/)?.[0] || "0") : 0
          return aSalaryLow - bSalaryLow
        case "relevance":
          // Featured and verified jobs first
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          if (a.verified && !b.verified) return -1
          if (!a.verified && b.verified) return 1
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
        case "newest":
        default:
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      }
    })

    return filtered
  }, [jobs, sortBy, hideViewed, searchQuery, filters, viewedJobs])

  const totalPages = Math.ceil(processedJobs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const visibleJobs = processedJobs.slice(startIndex, endIndex)

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy, hideViewed])

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-4">
      {visibleJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No jobs found</p>
        </div>
      ) : (
        <>
      {visibleJobs.map((job, index) => (
        <div key={job.id}>
          <JobCard job={job} />
          {/* Show promo card after every PROMO_INTERVAL jobs */}
              {(startIndex + index + 1) % PROMO_INTERVAL === 0 &&
                index < visibleJobs.length - 1 && (
            <div className="my-4">
                    <PromoCard
                      variant={
                        index % (PROMO_INTERVAL * 2) === PROMO_INTERVAL - 1
                          ? "ai"
                          : "default"
                      }
                    />
            </div>
          )}
        </div>
      ))}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
              let pageNum
              if (totalPages <= 4) {
                pageNum = i + 1
              } else if (currentPage <= 2) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 1) {
                pageNum = totalPages - 3 + i
              } else {
                pageNum = currentPage - 1 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                      className={
                        currentPage === pageNum
                          ? "bg-gradient-primary hover:bg-gradient-primary-hover text-white"
                          : ""
                      }
                      onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
          )}
        </>
      )}

      {/* Show form on all pages */}
      <div className="my-6">
        <RecruiterContactForm />
      </div>
    </div>
  )
}
