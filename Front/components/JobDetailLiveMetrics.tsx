"use client"

import { useEffect, useState, useRef, useLayoutEffect } from "react"
import { Users, Eye } from "lucide-react"
import { getCurrentUser } from "@/lib/session"

type Live = {
  viewCount: number | null
  applyCount: number | null
  watching: number | null
  flags: { showPublicJobViewCounts: boolean; showPublicWatchingCount: boolean }
}

export function JobDetailLiveMetrics({
  slug,
  initialViews,
  allowPublicCounts,
  allowPublicWatching,
}: {
  slug: string
  initialViews: number
  allowPublicCounts: boolean
  allowPublicWatching: boolean
}) {
  const [live, setLive] = useState<Live | null>(null)
  const [isStaff, setIsStaff] = useState(false)
  const mounted = useRef(true)

  useLayoutEffect(() => {
    const u = getCurrentUser()
    setIsStaff(Boolean(u && (u.role === "ADMIN" || u.role === "MODERATOR")))
  }, [])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const poll = async () => {
      const user = getCurrentUser()
      const headers: HeadersInit = {}
      if (user && (user.role === "ADMIN" || user.role === "MODERATOR")) {
        headers["x-user-id"] = user.id
      }
      try {
        const r = await fetch(`/api/jobs/${encodeURIComponent(slug)}/live-metrics`, { headers })
        if (!r.ok) return
        const j = (await r.json()) as Live
        if (mounted.current) setLive(j)
      } catch {
        /* ignore */
      }
    }
    poll()
    const id = setInterval(poll, 12_000)
    return () => clearInterval(id)
  }, [slug])

  const canSeeCounts = allowPublicCounts || isStaff
  const canSeeWatching = allowPublicWatching || isStaff

  const views = live?.viewCount ?? initialViews
  const watching = live?.watching

  const showViews =
    canSeeCounts &&
    views > 0 &&
    (live ? live.viewCount != null : true)

  const showWatchingRow = canSeeWatching && watching != null && watching > 0

  return (
    <div className="mt-4 flex flex-col gap-2">
      {showViews && (
        <span
          className="inline-flex items-center gap-1.5 self-start text-xs text-gray-400 tabular-nums"
          title="Unique visits"
        >
          <Eye className="h-3.5 w-3.5" />
          {views.toLocaleString()} {views === 1 ? "view" : "views"}
        </span>
      )}
      {showWatchingRow && (
        <span className="inline-flex items-center gap-1.5 self-start text-xs text-gray-400 tabular-nums">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-300 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gray-400" />
          </span>
          <Users className="h-3.5 w-3.5" />
          {watching === 1
            ? "1 person viewing now"
            : `${watching} people viewing now`}
        </span>
      )}
    </div>
  )
}
