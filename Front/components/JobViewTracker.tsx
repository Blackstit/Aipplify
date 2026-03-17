"use client"

import { useEffect } from "react"

interface JobViewTrackerProps {
  jobSlug: string
}

export function JobViewTracker({ jobSlug }: JobViewTrackerProps) {
  useEffect(() => {
    // Mark job as viewed in localStorage
    if (typeof window !== "undefined") {
      const viewedJobs = JSON.parse(localStorage.getItem("viewedJobs") || "[]") as string[]
      if (!viewedJobs.includes(jobSlug)) {
        viewedJobs.push(jobSlug)
        localStorage.setItem("viewedJobs", JSON.stringify(viewedJobs))
        // Dispatch event to update job cards
        window.dispatchEvent(new Event("job-viewed"))
      }
    }
  }, [jobSlug])

  return null
}
