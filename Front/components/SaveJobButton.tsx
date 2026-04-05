"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SavedJob {
  id: string
  slug: string
  title: string
  company: { name: string; logo: string | null; verified: boolean }
  salary: string
  location: string
  experience: string
  tags: string[]
  postedAt: string
  savedAt: string
}

interface SaveJobButtonProps {
  jobId: string
  jobSlug: string
  jobTitle?: string
  company?: { name: string; logo: string | null; verified: boolean }
  salary?: string
  location?: string
  experience?: string
  tags?: string[]
  postedAt?: string
}

export function getSavedJobs(): SavedJob[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("savedJobs") || "[]")
  } catch {
    return []
  }
}

function writeSavedJobs(jobs: SavedJob[]) {
  localStorage.setItem("savedJobs", JSON.stringify(jobs))
  window.dispatchEvent(new Event("saved-jobs-changed"))
}

export function SaveJobButton({
  jobId,
  jobSlug,
  jobTitle = "",
  company = { name: "Unknown", logo: null, verified: false },
  salary = "",
  location = "",
  experience = "",
  tags = [],
  postedAt = "",
}: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setIsSaved(getSavedJobs().some((j) => j.id === jobId))

    const handler = () => setIsSaved(getSavedJobs().some((j) => j.id === jobId))
    window.addEventListener("saved-jobs-changed", handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener("saved-jobs-changed", handler)
      window.removeEventListener("storage", handler)
    }
  }, [jobId])

  const handleToggle = () => {
    const saved = getSavedJobs()
    if (isSaved) {
      writeSavedJobs(saved.filter((j) => j.id !== jobId))
      setIsSaved(false)
    } else {
      const entry: SavedJob = {
        id: jobId,
        slug: jobSlug,
        title: jobTitle,
        company,
        salary,
        location,
        experience,
        tags: tags.slice(0, 8),
        postedAt,
        savedAt: new Date().toISOString(),
      }
      writeSavedJobs([entry, ...saved])
      setIsSaved(true)
    }
  }

  return (
    <Button
      variant="outline"
      className={cn(
        "w-full transition-colors",
        isSaved && "border-primary/40 text-primary bg-primary/5",
      )}
      onClick={handleToggle}
    >
      {isSaved ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-2" />
          Save Job
        </>
      )}
    </Button>
  )
}
