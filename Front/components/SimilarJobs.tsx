"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { CompanyLogo } from "./CompanyLogo"
import { VerifiedBadge } from "./VerifiedBadge"
import { MapPin, Clock, Briefcase, DollarSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Tag } from "./Tag"

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
}

interface SimilarJobsProps {
  jobSlug: string
}

export function SimilarJobs({ jobSlug }: SimilarJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSimilarJobs() {
      try {
        const res = await fetch(`/api/jobs/${jobSlug}/similar?limit=6`)
        if (res.ok) {
          const data = await res.json()
          setJobs(data.jobs || [])
        }
      } catch (error) {
        console.error("Error fetching similar jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarJobs()
  }, [jobSlug])

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading similar jobs...
      </div>
    )
  }

  if (jobs.length === 0) {
    return null
  }

  return (
    <div className="space-y-6 mt-12">
      <h2 className="text-2xl font-bold">Similar Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => {
          const postedTime = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })
          
          return (
            <Link key={job.id} href={`/job/${job.slug}`}>
              <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="flex gap-3">
                  <CompanyLogo
                    logo={job.company.logo}
                    name={job.company.name}
                    size={48}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-600 truncate">
                        {job.company.name}
                      </p>
                      {job.featured && <VerifiedBadge type="featured" />}
                      {!job.featured && job.company.verified && (
                        <VerifiedBadge type="verified" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span className="capitalize">{job.experience}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {job.tags.slice(0, 3).map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{postedTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
