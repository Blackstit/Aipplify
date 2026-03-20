"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { JobFrontend } from "@/lib/jobs"
import { Tag } from "./Tag"
import { Card } from "@/components/ui/card"
import { CompanyLogo } from "./CompanyLogo"
import { VerifiedBadge } from "./VerifiedBadge"
import { MapPin, Clock, Briefcase, DollarSign, Users, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface JobCardProps {
  job: JobFrontend
}

export function JobCard({ job }: JobCardProps) {
  const [isViewed, setIsViewed] = useState(false)
  const postedTime = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })

  useEffect(() => {
    // Check if job is viewed
    if (typeof window !== "undefined") {
      const viewedJobs = JSON.parse(localStorage.getItem("viewedJobs") || "[]") as string[]
      setIsViewed(viewedJobs.includes(job.slug))
    }

    // Listen for job viewed events
    const handleJobViewed = () => {
      if (typeof window !== "undefined") {
        const viewedJobs = JSON.parse(localStorage.getItem("viewedJobs") || "[]") as string[]
        setIsViewed(viewedJobs.includes(job.slug))
      }
    }

    window.addEventListener("job-viewed", handleJobViewed)
    window.addEventListener("storage", handleJobViewed)

    return () => {
      window.removeEventListener("job-viewed", handleJobViewed)
      window.removeEventListener("storage", handleJobViewed)
    }
  }, [job.slug])

  return (
    <Link href={`/job/${job.slug}`}>
      <Card 
        className={cn(
          "p-6 hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden",
          job.featured && "border-yellow-400 border-2 featured-card bg-gradient-to-br from-yellow-50/50 to-white",
          !job.featured && (job.verified || job.company.verified) && "border-primary border-2 bg-gradient-to-br from-blue-50/50 to-white",
          !job.featured && !job.verified && !job.company.verified && "border-border bg-white"
        )}
      >
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {job.featured && (
            <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              HOT VACANCY!
            </div>
          )}
          {isViewed && (
            <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Viewed
            </div>
          )}
        </div>
        
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
                {job.featured && (
                  <VerifiedBadge type="featured" />
                )}
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
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="capitalize">{job.workType}</span>
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
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
