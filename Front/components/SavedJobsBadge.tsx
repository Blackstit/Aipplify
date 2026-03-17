"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { getCurrentUser } from "@/lib/session"

export function SavedJobsBadge() {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    updateCount()

    // Listen for saved jobs changes
    const handleChange = () => {
      updateCount()
    }

    window.addEventListener("saved-jobs-changed", handleChange)
    window.addEventListener("user-changed", handleChange)

    return () => {
      window.removeEventListener("saved-jobs-changed", handleChange)
      window.removeEventListener("user-changed", handleChange)
    }
  }, [])

  async function updateCount() {
    const user = getCurrentUser()
    if (!user) {
      setCount(0)
      return
    }

    try {
      const res = await fetch(`/api/saved-jobs/count?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setCount(data.count || 0)
      }
    } catch (error) {
      console.error("Error fetching saved jobs count:", error)
    }
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="hidden md:flex relative">
        <Bookmark className="h-5 w-5" />
      </Button>
    )
  }

  const user = getCurrentUser()
  if (!user) {
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
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
    </Link>
  )
}
