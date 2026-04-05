"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ApplyModal } from "./ApplyModal"
import { getCurrentUser } from "@/lib/session"
import { useRouter } from "next/navigation"

interface ApplyButtonProps {
  jobId: string
  jobSlug: string
  jobTitle: string
  recruiterContact?: string
}

export function ApplyButton({
  jobId,
  jobSlug,
  jobTitle,
  recruiterContact,
}: ApplyButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleOpenModal = () => {
    const user = getCurrentUser()
    
    if (!user) {
      // Redirect to auth if not logged in
      router.push(`/auth?redirect=/jobs/${jobSlug}`)
      return
    }

    setOpen(true)
  }

  const handleApply = async () => {
    const user = getCurrentUser()
    
    if (!user) {
      return
    }

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Failed to save application:", data.error)
        // Still allow contact click even if save fails
      }
    } catch (error) {
      console.error("Error saving application:", error)
      // Still allow contact click even if save fails
    }
  }

  return (
    <>
      <Button className="w-full" size="lg" onClick={handleOpenModal}>
        Apply Now
      </Button>
      <ApplyModal
        open={open}
        onOpenChange={setOpen}
        jobTitle={jobTitle}
        jobSlug={jobSlug}
        recruiterContact={recruiterContact}
        onApply={handleApply}
      />
    </>
  )
}
