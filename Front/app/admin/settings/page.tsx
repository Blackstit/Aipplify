"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2, Eye, Users } from "lucide-react"
import { invalidatePublicJobMetricsCache } from "@/components/JobCard"
import { cn } from "@/lib/utils"

type Settings = {
  showPublicJobViewCounts: boolean
  showPublicWatchingCount: boolean
}

export default function AdminSettingsPage() {
  const [data, setData] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(getCurrentUser()?.role === "ADMIN")
  }, [])

  const load = async () => {
    const user = getCurrentUser()
    if (!user) return
    setLoading(true)
    setError("")
    try {
      const r = await fetch("/api/admin/site-settings", { headers: { "x-user-id": user.id } })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Failed")
      setData(j)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const patch = async (partial: Partial<Settings>) => {
    const user = getCurrentUser()
    if (!user) return
    setSaving(true)
    setError("")
    try {
      const r = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify(partial),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Failed")
      setData(j)
      invalidatePublicJobMetricsCache()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Public site behaviour (logged-in staff always see full metrics).</p>
        {!isAdmin && (
          <p className="text-xs text-amber-700 mt-2">Only administrators can change these toggles.</p>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-semibold">Show job view &amp; apply counters to visitors</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              When off, the pills on job cards and the counters on the job page are hidden for guests. Admins and moderators still see them.
            </p>
          </div>
          <div className={cn((saving || !isAdmin) && "opacity-50 pointer-events-none")}>
            <Switch
              checked={data.showPublicJobViewCounts}
              onCheckedChange={(v) => {
                if (!isAdmin || saving) return
                setData((d) => (d ? { ...d, showPublicJobViewCounts: v } : d))
                void patch({ showPublicJobViewCounts: v })
              }}
            />
          </div>
        </div>

        <div className="p-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold">“Watching now” on job pages</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              When off, the live “people viewing this job” line is hidden for guests (still shown to staff).
            </p>
          </div>
          <div className={cn((saving || !isAdmin) && "opacity-50 pointer-events-none")}>
            <Switch
              checked={data.showPublicWatchingCount}
              onCheckedChange={(v) => {
                if (!isAdmin || saving) return
                setData((d) => (d ? { ...d, showPublicWatchingCount: v } : d))
                void patch({ showPublicWatchingCount: v })
              }}
            />
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={() => load()} disabled={saving}>
        Reload
      </Button>
    </div>
  )
}
