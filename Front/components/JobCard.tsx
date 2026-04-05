"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { JobFrontend } from "@/lib/jobs"
import { Tag } from "./Tag"
import { Card } from "@/components/ui/card"
import { CompanyLogo } from "./CompanyLogo"
import { VerifiedBadge } from "./VerifiedBadge"
import { MapPin, Clock, Briefcase, DollarSign, Eye, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface JobCardProps {
  job: JobFrontend
  compact?: boolean
}

export function JobCard({ job, compact = false }: JobCardProps) {
  const [isViewed, setIsViewed] = useState(false)
  const postedTime = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const viewedJobs = JSON.parse(localStorage.getItem("viewedJobs") || "[]") as string[]
      setIsViewed(viewedJobs.includes(job.slug))
    }

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

  const aiScore = job.aiScore
  const scoreColor =
    aiScore != null && aiScore >= 8
      ? "bg-emerald-100 text-emerald-700"
      : aiScore != null && aiScore >= 5
        ? "bg-amber-100 text-amber-700"
        : aiScore != null
          ? "bg-rose-100 text-rose-700"
          : ""

  const isFeatured = job.featured
  const isVerified = !isFeatured && (job.verified || job.company.verified)

  return (
    <Link href={`/jobs/${job.slug}`}>
      <Card
        className={cn(
          "p-5 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden",
          compact && "p-3",
          isFeatured &&
            "border-amber-400 border-2 bg-gradient-to-br from-amber-50/40 to-white",
          isVerified &&
            "border-primary/40 border bg-gradient-to-br from-blue-50/30 to-white",
          !isFeatured && !isVerified && "border-gray-200 bg-white",
        )}
      >
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {aiScore != null && !Number.isNaN(aiScore) && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                scoreColor,
              )}
              title="AI Quality Score"
            >
              <Sparkles className="h-3 w-3" />
              <span className="text-[9px] font-bold opacity-70 uppercase">AI</span>
              {aiScore.toFixed(1)}
            </span>
          )}
          {isFeatured && (
            <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Hot
            </span>
          )}
          {isViewed && (
            <span className="bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Eye className="h-3 w-3" />
              Viewed
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <CompanyLogo
              logo={job.company.logo}
              name={job.company.name}
              size={compact ? 44 : 56}
            />
          </div>

          <div className="flex-1 min-w-0 pr-20">
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-xs font-medium text-gray-500 truncate">
                  {job.company.name}
                </p>
                {isFeatured && <VerifiedBadge type="featured" />}
                {isVerified && <VerifiedBadge type="verified" />}
              </div>
              <h3
                className={cn(
                  "font-bold text-gray-900 leading-snug",
                  compact ? "text-base" : "text-lg",
                )}
              >
                {job.title}
              </h3>
            </div>

            <div
              className={cn(
                "flex flex-wrap items-center gap-3 mb-2 text-gray-600",
                compact ? "text-[11px]" : "text-xs",
              )}
            >
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="capitalize">{job.experience}</span>
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="font-semibold text-gray-900">{job.salary}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            </div>

            {!compact && (
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {job.tags.slice(0, 5).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
                {job.tags.length > 5 && (
                  <span className="text-[10px] text-gray-400">
                    +{job.tags.length - 5}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center text-[11px] text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              {postedTime}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
