"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { getSavedJobs } from "./SaveJobButton"

export function SavedJobsBadge() {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCount(getSavedJobs().length)

    const handler = () => setCount(getSavedJobs().length)
    window.addEventListener("saved-jobs-changed", handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener("saved-jobs-changed", handler)
      window.removeEventListener("storage", handler)
    }
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="hidden md:flex relative">
        <Bookmark className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Link href="/saved-jobs">
      <Button variant="ghost" size="icon" className="hidden md:flex relative">
        <Bookmark className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full h-4.5 w-4.5 min-w-[18px] h-[18px] flex items-center justify-center">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
    </Link>
  )
}
