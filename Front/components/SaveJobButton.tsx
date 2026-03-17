"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { getCurrentUser } from "@/lib/session"
import { useRouter } from "next/navigation"

interface SaveJobButtonProps {
  jobId: string
  jobSlug: string
}

export function SaveJobButton({ jobId, jobSlug }: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkSaved() {
      const user = getCurrentUser()
      if (!user) return

      try {
        const res = await fetch(`/api/saved-jobs?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          const saved = data.jobs.some((job: any) => job.id === jobId)
          setIsSaved(saved)
        }
      } catch (error) {
        console.error("Error checking saved status:", error)
      }
    }

    checkSaved()
  }, [jobId])

  const handleToggle = async () => {
    const user = getCurrentUser()

    if (!user) {
      router.push(`/auth?redirect=/job/${jobSlug}`)
      return
    }

    setLoading(true)

    try {
      if (isSaved) {
        // Unsave
        const res = await fetch(`/api/saved-jobs?jobId=${jobId}&userId=${user.id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          setIsSaved(false)
          // Dispatch event to update header counter
          window.dispatchEvent(new Event("saved-jobs-changed"))
        }
      } else {
        // Save
        const res = await fetch("/api/saved-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            userId: user.id,
          }),
        })
        if (res.ok) {
          setIsSaved(true)
          // Dispatch event to update header counter
          window.dispatchEvent(new Event("saved-jobs-changed"))
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleToggle}
      disabled={loading}
    >
      <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
      {isSaved ? "Saved" : "Save Job"}
    </Button>
  )
}
