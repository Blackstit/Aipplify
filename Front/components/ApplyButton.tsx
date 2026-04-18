"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ApplyModal } from "./ApplyModal"
import { AuthModal } from "./AuthModal"
import { getCurrentUser } from "@/lib/session"
import { trackApplyClick, trackApplySuccess } from "@/lib/analytics"

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
  const [showAuthModal, setShowAuthModal] = useState(false)

  const recordApplyClick = () => {
    try {
      let sid = sessionStorage.getItem("aipplify_viewer_key") || ""
      if (!sid) {
        sid = crypto.randomUUID()
        sessionStorage.setItem("aipplify_viewer_key", sid)
      }
      fetch(`/api/jobs/${encodeURIComponent(jobSlug)}/apply-click`, {
        method: "POST",
        credentials: "include",
        headers: { "x-viewer-key": sid },
      }).catch(() => {})
    } catch {
      /* sessionStorage unavailable; ignore */
    }
  }

  const handleOpenModal = () => {
    trackApplyClick(jobSlug, jobTitle)
    recordApplyClick()
    if (!getCurrentUser()) {
      setShowAuthModal(true)
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
      } else {
        trackApplySuccess(jobSlug, jobTitle)
      }
    } catch (error) {
      console.error("Error saving application:", error)
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
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => setOpen(true)}
      />
    </>
  )
}
