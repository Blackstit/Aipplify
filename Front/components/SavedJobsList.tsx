"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { CompanyLogo } from "./CompanyLogo"
import { VerifiedBadge } from "./VerifiedBadge"
import { MapPin, Clock, Briefcase, DollarSign, Bookmark, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Tag } from "./Tag"
import { Button } from "./ui/button"
import { getSavedJobs, type SavedJob } from "./SaveJobButton"

export function SavedJobsList() {
  const [jobs, setJobs] = useState<SavedJob[]>([])
  const [mounted, setMounted] = useState(false)

  const reload = () => setJobs(getSavedJobs())

  useEffect(() => {
    setMounted(true)
    reload()
    window.addEventListener("saved-jobs-changed", reload)
    window.addEventListener("storage", reload)
    return () => {
      window.removeEventListener("saved-jobs-changed", reload)
      window.removeEventListener("storage", reload)
    }
  }, [])

  const handleRemove = (id: string) => {
    const updated = getSavedJobs().filter((j) => j.id !== id)
    localStorage.setItem("savedJobs", JSON.stringify(updated))
    window.dispatchEvent(new Event("saved-jobs-changed"))
  }

  if (!mounted) {
    return (
      <div className="text-center py-12 text-gray-500">Loading saved jobs...</div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          No saved jobs yet
        </h2>
        <p className="text-gray-500 mb-6">
          Start saving jobs you're interested in!
        </p>
        <Link href="/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{jobs.length} saved job{jobs.length !== 1 ? "s" : ""}</p>
      {jobs.map((job) => {
        const postedTime = job.postedAt
          ? formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })
          : ""
        const savedTime = formatDistanceToNow(new Date(job.savedAt), {
          addSuffix: true,
        })

        return (
          <Card
            key={job.id}
            className="p-5 hover:shadow-md transition-all duration-200 relative group"
          >
            <button
              type="button"
              onClick={() => handleRemove(job.id)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500"
              title="Remove from saved"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <Link href={`/jobs/${job.slug}`}>
              <div className="flex gap-4 cursor-pointer">
                <div className="flex-shrink-0">
                  <CompanyLogo
                    logo={job.company.logo}
                    name={job.company.name}
                    size={56}
                  />
                </div>

                <div className="flex-1 min-w-0 pr-8">
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-medium text-gray-500 truncate">
                        {job.company.name}
                      </p>
                      {job.company.verified && (
                        <VerifiedBadge type="verified" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-gray-600">
                    {job.experience && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span className="capitalize">{job.experience}</span>
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span className="font-semibold text-gray-900">
                          {job.salary}
                        </span>
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                    )}
                  </div>

                  {job.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {job.tags.slice(0, 6).map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    {postedTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {postedTime}
                      </span>
                    )}
                    <span>Saved {savedTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          </Card>
        )
      })}
    </div>
  )
}
