"use client"

import Link from "next/link"
import { ScoreBadge } from "@/components/ScoreBadge"
import type { LandingJob } from "@/lib/landing-data"

function JobCard({ job }: { job: LandingJob }) {
  const salaryText = job.salary_min && job.salary_max
    ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`
    : job.salary_max
      ? `Up to $${(job.salary_max / 1000).toFixed(0)}k`
      : null

  return (
    <Link
      href={`/jobs/${encodeURIComponent(job.slug.trim())}`}
      className="block p-4 rounded-xl border border-gray-200/80 bg-white hover:border-primary/30 hover:shadow-lg transition-all group shrink-0"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{job.title}</p>
        <ScoreBadge score={job.ai_score} size="sm" />
      </div>
      <p className="text-xs text-gray-500 mb-2 truncate">{job.company_name}</p>
      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        {salaryText && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{salaryText}</span>}
        {job.location_type && <span className="capitalize">{job.location_type}</span>}
      </div>
    </Link>
  )
}

export function JobColumnsMarquee({ jobs }: { jobs: LandingJob[] }) {
  if (jobs.length === 0) return null
  const cols = 4
  const columns: LandingJob[][] = Array.from({ length: cols }, () => [])
  jobs.forEach((j, i) => columns[i % cols].push(j))
  for (const col of columns) {
    if (col.length === 0) continue
    while (col.length < 4) {
      const take = Math.min(4 - col.length, col.length)
      col.push(...col.slice(0, take))
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-[420px] overflow-hidden relative">
      {columns.map((col, ci) => {
        if (col.length === 0) return null
        const direction = ci % 2 === 0 ? "up" : "down"
        const doubled = [...col, ...col]
        const dur = 20 + ci * 5
        return (
          <div key={ci} className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
            <div
              className={`flex flex-col gap-3 ${direction === "up" ? "animate-scroll-up" : "animate-scroll-down"}`}
              style={{ animationDuration: `${dur}s` }}
            >
              {doubled.map((job, ji) => (
                <JobCard key={`${job.id}-${ji}`} job={job} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
