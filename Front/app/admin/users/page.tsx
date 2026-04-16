"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, Edit2, CheckCircle, XCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface UserRow {
  id: string
  email: string
  name: string | null
  type: "CANDIDATE" | "RECRUITER"
  role: "USER" | "MODERATOR" | "ADMIN"
  status: "ACTIVE" | "BANNED" | "DELETED"
  emailVerified: string | null
  createdAt: string
  lastLoginAt: string | null
  _count: { applications: number }
}

interface UsersResponse {
  users: UserRow[]
  total: number
  page: number
  totalPages: number
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 border border-red-200",
  MODERATOR: "bg-orange-100 text-orange-700 border border-orange-200",
  USER: "bg-gray-100 text-gray-600 border border-gray-200",
}
const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 border border-green-200",
  BANNED: "bg-red-100 text-red-700 border border-red-200",
  DELETED: "bg-gray-100 text-gray-500 border border-gray-200",
}
const TYPE_STYLES: Record<string, string> = {
  CANDIDATE: "bg-blue-100 text-blue-700 border border-blue-200",
  RECRUITER: "bg-purple-100 text-purple-700 border border-purple-200",
}

const FILTER_BTN = "px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer"
const FILTER_ACTIVE = "bg-primary text-white border-primary"
const FILTER_INACTIVE = "bg-white text-gray-600 border-gray-200 hover:border-primary/50"

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("")
  const [type, setType] = useState("")
  const [page, setPage] = useState(1)

  const fetchUsers = useCallback(async () => {
    const user = getCurrentUser()
    if (!user) return
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (search) params.set("search", search)
    if (role) params.set("role", role)
    if (status) params.set("status", status)
    if (type) params.set("type", type)

    try {
      const res = await fetch(`/api/admin/users?${params}`, { headers: { "x-user-id": user.id } })
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }, [page, search, role, status, type])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [search, role, status, type])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data ? `${data.total.toLocaleString()} total` : "Loading..."}
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">Search</Button>
          {(search || role || status || type) && (
            <Button
              type="button"
              variant="ghost"
              className="text-gray-500"
              onClick={() => {
                setSearch(""); setSearchInput(""); setRole(""); setStatus(""); setType("")
              }}
            >
              Clear
            </Button>
          )}
        </form>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Role</span>
            {["", "USER", "MODERATOR", "ADMIN"].map((v) => (
              <button
                key={v || "all-role"}
                onClick={() => setRole(v)}
                className={cn(FILTER_BTN, role === v ? FILTER_ACTIVE : FILTER_INACTIVE)}
              >
                {v || "All"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</span>
            {["", "ACTIVE", "BANNED", "DELETED"].map((v) => (
              <button
                key={v || "all-status"}
                onClick={() => setStatus(v)}
                className={cn(FILTER_BTN, status === v ? FILTER_ACTIVE : FILTER_INACTIVE)}
              >
                {v || "All"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Type</span>
            {["", "CANDIDATE", "RECRUITER"].map((v) => (
              <button
                key={v || "all-type"}
                onClick={() => setType(v)}
                className={cn(FILTER_BTN, type === v ? FILTER_ACTIVE : FILTER_INACTIVE)}
              >
                {v || "All"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.users.length ? (
          <div className="flex items-center justify-center h-48 text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Verified</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Last Login</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Apps</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[160px]">{u.name || "—"}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[160px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded", ROLE_STYLES[u.role])}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded", TYPE_STYLES[u.type])}>{u.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded", STATUS_STYLES[u.status])}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {u.emailVerified
                        ? <CheckCircle className="h-4 w-4 text-green-500" />
                        : <XCircle className="h-4 w-4 text-gray-300" />
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell whitespace-nowrap">
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell whitespace-nowrap">
                      {u.lastLoginAt
                        ? formatDistanceToNow(new Date(u.lastLoginAt), { addSuffix: true })
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {u._count.applications}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Page {data.page} of {data.totalPages} · {data.total} users
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1 || loading}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(data.totalPages - 4, page - 2)) + i
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className="h-7 w-7 px-0"
                  >
                    {p}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages || loading}
                className="h-7 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
