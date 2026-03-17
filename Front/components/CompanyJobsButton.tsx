"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface CompanyJobsButtonProps {
  companySlug: string
  companyName: string
}

export function CompanyJobsButton({ companySlug, companyName }: CompanyJobsButtonProps) {
  const [jobsCount, setJobsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobsCount() {
      try {
        const res = await fetch(`/api/companies/${companySlug}/jobs-count`)
        if (res.ok) {
          const data = await res.json()
          setJobsCount(data.count || 0)
        }
      } catch (error) {
        console.error("Error fetching jobs count:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobsCount()
  }, [companySlug])

  if (loading) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <ExternalLink className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    )
  }

  const jobsText = jobsCount === 1 ? "job" : "jobs"

  return (
    <Link href={`/company/${companySlug}`}>
      <Button variant="outline" className="w-full">
        See all {jobsCount || 0} {jobsText} at {companyName}
        <ExternalLink className="h-4 w-4 ml-2" />
      </Button>
    </Link>
  )
}
