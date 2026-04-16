"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/session"
import Link from "next/link"
import {
  Users, UserCheck, UserX, TrendingUp, Briefcase, FileText,
  Crown, Activity, Calendar, Eye, Globe, BarChart2,
  Layers, Zap, Building, ArrowRight,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  users: {
    total: number; active: number; banned: number; deleted: number
    candidates: number; recruiters: number; admins: number; moderators: number
    todayNew: number; weekNew: number; monthNew: number
    roles?: Record<string, number>
    recentSignups: Array<{
      id: string; name: string | null; email: string; type: string
      role: string; status: string; createdAt: string; emailVerified: string | null
    }>
    dailySignups: Array<{ date: string; count: number }>
  }
  jobs: {
    total: number; published: number; draft: number; archived: number
    todayNew: number; weekNew: number; monthNew: number
    byWorkType: { REMOTE: number; HYBRID: number; OFFICE: number }
    bySource: Record<string, number>
    byExperience: Record<string, number>
    dailyNew: Array<{ date: string; count: number }>
    topCompanies: Array<{ name: string; count: number }>
  }
  applications: { total: number }
  visitors: {
    todayViews: number; weekViews: number; monthViews: number
    dailyViews: Array<{ day: string; views: number }>
    topPages: Array<{ path: string; views: number }>
    activeDays7: Array<{ day: string; views: number }>
  }
}

// ─── Reusable components ───────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, colorClass, sub, href,
}: {
  label: string; value: number | string; icon: React.ElementType
  colorClass: string; sub?: string; href?: string
}) {
  const inner = (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 transition-shadow", href && "hover:shadow-md cursor-pointer")}>
      <div className={cn("p-2.5 rounded-lg shrink-0", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function MiniBarChart({
  data, valueKey, labelKey, color = "bg-primary/70",
}: {
  data: Array<Record<string, unknown>>
  valueKey: string; labelKey: string; color?: string
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1)
  return (
    <div className="flex items-end gap-1 h-20 w-full">
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0
        const label = String(d[labelKey] || "")
        const shortLabel = label.length === 10
          ? new Date(label).toLocaleDateString("en", { weekday: "short" })
          : label.slice(-3)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            {val > 0 && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 rounded shadow border border-gray-100 z-10 whitespace-nowrap">
                {val}
              </span>
            )}
            <div
              className={cn("w-full rounded-t-sm transition-all", color, val === 0 && "opacity-30")}
              style={{ height: `${Math.max(3, (val / max) * 72)}px` }}
            />
            <span className="text-[9px] text-gray-400">{shortLabel}</span>
          </div>
        )
      })}
    </div>
  )
}

function BreakdownBar({
  items, total,
}: {
  items: Array<{ label: string; count: number; color: string }>
  total: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex rounded-full overflow-hidden h-2.5 bg-gray-100">
        {items.map(({ label, count, color }) => (
          <div
            key={label}
            className={cn("h-full transition-all", color)}
            style={{ width: `${total ? (count / total) * 100 : 0}%` }}
            title={`${label}: ${count}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {items.map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            <span>{label}</span>
            <span className="font-semibold text-gray-800">{count.toLocaleString()}</span>
            {total > 0 && (
              <span className="text-gray-400">({Math.round((count / total) * 100)}%)</span>
            )}
          </div>
        ))}
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

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    fetch("/api/admin/stats", { headers: { "x-user-id": user.id } })
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setStats(d) })
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
    return <div className="p-5 bg-red-50 rounded-xl border border-red-200 text-red-700">{error || "No data"}</div>
  }

  const { users, jobs, visitors, applications } = stats

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview · last updated just now</p>
      </div>

      {/* ── Visitors ──────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Eye} title="Visitors" sub="Page views tracked by built-in analytics" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Today's views" value={visitors.todayViews} icon={Eye} colorClass="bg-sky-100 text-sky-600" />
          <StatCard label="This week" value={visitors.weekViews} icon={TrendingUp} colorClass="bg-indigo-100 text-indigo-600" />
          <StatCard label="This month" value={visitors.monthViews} icon={Activity} colorClass="bg-violet-100 text-violet-600" />
          <StatCard label="Applications" value={applications.total} icon={FileText} colorClass="bg-teal-100 text-teal-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 30-day chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold mb-4 text-gray-700">Page views — last 30 days</p>
            <MiniBarChart data={visitors.dailyViews} valueKey="views" labelKey="day" color="bg-sky-500/70" />
          </div>

          {/* Top pages */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold mb-3 text-gray-700">Top pages (30 days)</p>
            {visitors.topPages.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No data yet — will appear after first visits</p>
            ) : (
              <div className="space-y-2">
                {visitors.topPages.slice(0, 8).map(({ path, views }) => (
                  <div key={path} className="flex items-center gap-2 text-xs">
                    <Globe className="h-3 w-3 text-gray-300 shrink-0" />
                    <span className="flex-1 truncate text-gray-600 font-mono">{path || "/"}</span>
                    <span className="font-semibold text-gray-800 shrink-0">{views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Users ─────────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Users} title="Users" sub={`${users.total.toLocaleString()} total registered`} href="/admin/users" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Total users" value={users.total} icon={Users} colorClass="bg-blue-100 text-blue-600" href="/admin/users" />
          <StatCard label="New today" value={users.todayNew} icon={Zap} colorClass="bg-emerald-100 text-emerald-600" />
          <StatCard label="This week" value={users.weekNew} icon={TrendingUp} colorClass="bg-green-100 text-green-600" />
          <StatCard label="This month" value={users.monthNew} icon={Calendar} colorClass="bg-lime-100 text-lime-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold mb-4 text-gray-700">Registrations — last 30 days</p>
            <MiniBarChart data={users.dailySignups} valueKey="count" labelKey="date" color="bg-blue-500/70" />
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Breakdown</p>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">By type</p>
              <BreakdownBar
                total={users.total}
                items={[
                  { label: "Candidates", count: users.candidates, color: "bg-blue-500" },
                  { label: "Recruiters", count: users.recruiters, color: "bg-purple-500" },
                ]}
              />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">By status</p>
              <BreakdownBar
                total={users.total}
                items={[
                  { label: "Active", count: users.active, color: "bg-green-500" },
                  { label: "Banned", count: users.banned, color: "bg-red-400" },
                  { label: "Deleted", count: users.deleted, color: "bg-gray-300" },
                ]}
              />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">By role</p>
              <BreakdownBar
                total={users.total}
                items={[
                  { label: "Users", count: (users.roles?.USER ?? users.total - users.admins - users.moderators), color: "bg-gray-400" },
                  { label: "Mods", count: users.moderators, color: "bg-orange-400" },
                  { label: "Admins", count: users.admins, color: "bg-red-500" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Recent signups */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-4">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <p className="font-semibold text-sm">Recent signups</p>
            <Link href="/admin/users" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {users.recentSignups.map((u) => (
              <Link key={u.id} href={`/admin/users/${u.id}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{(u.name || u.email).charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name || "—"}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", TYPE_COLORS[u.type])}>{u.type}</span>
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", ROLE_COLORS[u.role])}>{u.role}</span>
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", STATUS_COLORS[u.status])}>{u.status}</span>
                </div>
                <span className="text-xs text-gray-400 hidden md:block shrink-0">
                  {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Jobs ──────────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Briefcase} title="Jobs" sub={`${jobs.total.toLocaleString()} total · ${jobs.published.toLocaleString()} published`} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Total jobs" value={jobs.total} icon={Briefcase} colorClass="bg-amber-100 text-amber-600"
            sub={`${jobs.published} published`} />
          <StatCard label="New today" value={jobs.todayNew} icon={Zap} colorClass="bg-orange-100 text-orange-600" />
          <StatCard label="This week" value={jobs.weekNew} icon={TrendingUp} colorClass="bg-yellow-100 text-yellow-600" />
          <StatCard label="This month" value={jobs.monthNew} icon={Calendar} colorClass="bg-amber-100 text-amber-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold mb-4 text-gray-700">New jobs — last 30 days</p>
            <MiniBarChart data={jobs.dailyNew} valueKey="count" labelKey="date" color="bg-amber-400/80" />
          </div>

          {/* Status breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Job breakdown</p>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">By status</p>
              <BreakdownBar
                total={jobs.total}
                items={[
                  { label: "Published", count: jobs.published, color: "bg-green-500" },
                  { label: "Draft", count: jobs.draft, color: "bg-yellow-400" },
                  { label: "Archived", count: jobs.archived, color: "bg-gray-300" },
                ]}
              />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">By work type</p>
              <BreakdownBar
                total={jobs.total}
                items={[
                  { label: "Remote", count: jobs.byWorkType.REMOTE, color: "bg-blue-500" },
                  { label: "Hybrid", count: jobs.byWorkType.HYBRID, color: "bg-purple-400" },
                  { label: "Office", count: jobs.byWorkType.OFFICE, color: "bg-gray-400" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Source breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold mb-3 text-gray-700">By source</p>
            <div className="space-y-2">
              {Object.entries(jobs.bySource)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => (
                  <div key={source} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-32 shrink-0">{source}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${jobs.total ? (count / jobs.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-12 text-right shrink-0">
                      {count.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Experience breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold mb-3 text-gray-700">By experience level</p>
            <div className="space-y-2">
              {(["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD"] as const).map((exp) => {
                const count = jobs.byExperience[exp] ?? 0
                return (
                  <div key={exp} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16 shrink-0">{exp}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${jobs.total ? (count / jobs.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-12 text-right shrink-0">
                      {count.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top companies */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
            <p className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-400" />
              Top companies by job count
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {jobs.topCompanies.map(({ name, count }) => (
                <div key={name} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-medium text-gray-700 truncate">{name}</span>
                  <span className="text-xs font-bold text-gray-900 ml-2 shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({
  icon: Icon, title, sub, href,
}: {
  icon: React.ElementType; title: string; sub?: string; href?: string
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <h2 className="font-bold text-gray-900">{title}</h2>
        {sub && <span className="text-xs text-gray-400 hidden sm:block">· {sub}</span>}
      </div>
      {href && (
        <Link href={href} className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}
