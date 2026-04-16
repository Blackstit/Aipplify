"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/session"
import {
  Users, UserCheck, UserX, TrendingUp, Briefcase, FileText,
  ShieldAlert, Crown, Activity, Calendar,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Stats {
  users: {
    total: number; active: number; banned: number; deleted: number
    candidates: number; recruiters: number; admins: number; moderators: number
    todayNew: number; weekNew: number; monthNew: number
    recentSignups: Array<{
      id: string; name: string | null; email: string
      type: string; role: string; status: string; createdAt: string; emailVerified: string | null
    }>
    dailySignups: Array<{ date: string; count: number }>
  }
  jobs: { total: number; published: number }
  applications: { total: number }
}

function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string; value: number | string; icon: React.ElementType
  color: string; sub?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MODERATOR: "bg-orange-100 text-orange-700",
  USER: "bg-gray-100 text-gray-600",
}
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  BANNED: "bg-red-100 text-red-700",
  DELETED: "bg-gray-100 text-gray-500",
}
const TYPE_COLORS: Record<string, string> = {
  CANDIDATE: "bg-blue-100 text-blue-700",
  RECRUITER: "bg-purple-100 text-purple-700",
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    fetch("/api/admin/stats", { headers: { "x-user-id": user.id } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setStats(data)
      })
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-red-700">{error || "No data"}</div>
    )
  }

  const maxDaily = Math.max(...stats.users.dailySignups.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview</p>
      </div>

      {/* User stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Users" value={stats.users.total} icon={Users} color="bg-blue-100 text-blue-600" />
          <StatCard label="Active" value={stats.users.active} icon={UserCheck} color="bg-green-100 text-green-600" />
          <StatCard label="Banned" value={stats.users.banned} icon={UserX} color="bg-red-100 text-red-600" />
          <StatCard label="Admins" value={stats.users.admins} icon={Crown} color="bg-amber-100 text-amber-600"
            sub={`+ ${stats.users.moderators} moderators`}
          />
        </div>
      </div>

      {/* Signups */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Signups</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Today" value={stats.users.todayNew} icon={TrendingUp} color="bg-emerald-100 text-emerald-600" />
          <StatCard label="This Week" value={stats.users.weekNew} icon={Activity} color="bg-indigo-100 text-indigo-600" />
          <StatCard label="This Month" value={stats.users.monthNew} icon={Calendar} color="bg-violet-100 text-violet-600" />
          <StatCard label="Candidates" value={stats.users.candidates} icon={Briefcase} color="bg-sky-100 text-sky-600"
            sub={`${stats.users.recruiters} recruiters`}
          />
        </div>
      </div>

      {/* Platform stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Platform</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Total Jobs" value={stats.jobs.total} icon={Briefcase} color="bg-gray-100 text-gray-600"
            sub={`${stats.jobs.published} published`}
          />
          <StatCard label="Applications" value={stats.applications.total} icon={FileText} color="bg-teal-100 text-teal-600" />
          <StatCard label="Deleted Users" value={stats.users.deleted} icon={ShieldAlert} color="bg-rose-100 text-rose-600" />
        </div>
      </div>

      {/* 7-day bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold mb-4">Signups — last 7 days</h2>
        <div className="flex items-end gap-2 h-28">
          {stats.users.dailySignups.map(({ date, count }) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-gray-700">{count || ""}</span>
              <div
                className="w-full bg-primary/80 rounded-t-sm transition-all"
                style={{ height: `${Math.max(4, (count / maxDaily) * 88)}px` }}
              />
              <span className="text-[10px] text-gray-400">
                {new Date(date).toLocaleDateString("en", { weekday: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent signups */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold">Recent Signups</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.users.recentSignups.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {(u.name || u.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.name || "—"}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[u.type] || ""}`}>{u.type}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ROLE_COLORS[u.role] || ""}`}>{u.role}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_COLORS[u.status] || ""}`}>{u.status}</span>
              </div>
              <span className="text-xs text-gray-400 shrink-0 hidden md:block">
                {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
