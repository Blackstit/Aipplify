"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { CompanyLogo } from "./CompanyLogo"
import { VerifiedBadge } from "./VerifiedBadge"
import { MapPin, Clock, Briefcase, DollarSign, Bookmark } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Tag } from "./Tag"
import { getCurrentUser } from "@/lib/session"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"

interface Job {
  id: string
  slug: string
  title: string
  company: {
    name: string
    logo: string | null
    verified: boolean
  }
  salary: string
  location: string
  experience: string
  tags: string[]
  postedAt: string
  featured: boolean
  verified: boolean
  savedAt: string
}

export function SavedJobsList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchSavedJobs() {
      const user = getCurrentUser()
      if (!user) {
        router.push("/auth")
        return
      }

      try {
        const res = await fetch(`/api/saved-jobs?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setJobs(data.jobs || [])
        }
      } catch (error) {
        console.error("Error fetching saved jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedJobs()

    // Listen for changes
    const handleChange = () => {
      fetchSavedJobs()
    }
    window.addEventListener("saved-jobs-changed", handleChange)

    return () => {
      window.removeEventListener("saved-jobs-changed", handleChange)
    }
  }, [router])

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading saved jobs...
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No saved jobs yet</h2>
        <p className="text-gray-500 mb-6">Start saving jobs you're interested in!</p>
        <Link href="/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const postedTime = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })
        
        return (
          <Link key={job.id} href={`/job/${job.slug}`}>
            <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CompanyLogo
                    logo={job.company.logo}
                    name={job.company.name}
                    size={64}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-600">
                        {job.company.name}
                      </p>
                      {job.featured && <VerifiedBadge type="featured" />}
                      {!job.featured && job.company.verified && (
                        <VerifiedBadge type="verified" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="capitalize">{job.experience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-gray-900">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {job.tags.slice(0, 6).map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                    {job.tags.length > 6 && (
                      <Tag>+{job.tags.length - 6} more</Tag>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{postedTime}</span>
                    </div>
                    <span className="text-gray-400">
                      Saved {formatDistanceToNow(new Date(job.savedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
