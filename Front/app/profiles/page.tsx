"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Pencil, Trash2, Globe, Lock, Loader2 } from "lucide-react"

interface ProfileSummary {
  id: string
  title: string
  firstName?: string
  lastName?: string
  location?: string
  summary?: string
  skills: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export default function ProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) { router.push("/auth"); return }

    fetch(`/api/profiles?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setProfiles(d.profiles ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this profile?")) return
    setDeleting(id)
    const user = getCurrentUser()
    await fetch(`/api/profiles/${id}?userId=${user?.id}`, { method: "DELETE" })
    setProfiles((p) => p.filter((x) => x.id !== id))
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Profiles</h1>
            <p className="text-gray-500 text-sm">Resume profiles visible to recruiters</p>
          </div>
          <Link href="/profiles/create">
            <Button className="bg-gradient-primary hover:bg-gradient-primary-hover text-white gap-2">
              <Plus className="h-4 w-4" />
              Create Profile
            </Button>
          </Link>
        </div>

        {profiles.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">No profiles yet</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Upload your CV or fill in the form to create your first candidate profile.
            </p>
            <Link href="/profiles/create">
              <Button className="bg-gradient-primary hover:bg-gradient-primary-hover text-white gap-2">
                <Plus className="h-4 w-4" />
                Create First Profile
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 items-start hover:shadow-sm transition-shadow"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    {p.isPublic
                      ? <Globe className="h-3 w-3 text-green-500" />
                      : <Lock className="h-3 w-3 text-gray-400" />}
                  </div>
                  {(p.firstName || p.lastName || p.location) && (
                    <p className="text-sm text-gray-500 mb-2">
                      {[p.firstName, p.lastName].filter(Boolean).join(" ")}
                      {p.location ? ` · ${p.location}` : ""}
                    </p>
                  )}
                  {p.summary && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.summary}</p>
                  )}
                  {p.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.skills.slice(0, 8).map((s) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                          {s}
                        </span>
                      ))}
                      {p.skills.length > 8 && (
                        <span className="text-xs text-gray-400">+{p.skills.length - 8}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/profiles/${p.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                  >
                    {deleting === p.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
