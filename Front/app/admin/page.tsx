"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/session"
import Link from "next/link"
import {
  Users, TrendingUp, Briefcase, FileText,
  Activity, Calendar, Eye, Globe,
  Zap, ArrowRight, UserPlus, Send,
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
    dailyNew: Array<{ date: string; count: number }>
    latestPostedAt: string | null
    totalJobViews: number
  }
  applications: {
    total: number
    todayNew: number
    weekNew: number
    monthNew: number
    dailyApplications: Array<{ date: string; count: number }>
  }
  visitors: {
    totalEver: number
    todayNew: number; weekNew: number; monthNew: number
    todayViews: number; weekViews: number; monthViews: number
    dailyNewVisitors: Array<{ day: string; count: number }>
    topPages: Array<{ path: string; views: number }>
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

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en", { day: "numeric", month: "short" })
}

/**
 * MiniBarChart — compact time-series chart with a proper axis.
 *
 * Notes on the fix for clipped labels: we absolutely position tick labels under the
 * chart in a dedicated label strip, centered on their bar via `transform: translateX(-50%)`.
 * That way labels can "bleed" into their neighbors' space and no longer get clipped
 * by the 1/60th-of-width cells the old implementation used.
 */
function MiniBarChart({
  data, valueKey, labelKey, color = "bg-primary/70", targetTicks = 6,
}: {
  data: Array<Record<string, unknown>>
  valueKey: string; labelKey: string; color?: string; targetTicks?: number
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1)
  const total = data.length
  if (total === 0) {
    return <p className="text-xs text-gray-400 py-10 text-center">No data yet</p>
  }

  // Pick evenly-spaced tick indexes (first, last, and a few in between).
  const ticksCount = Math.min(targetTicks, total)
  const tickIdxs = new Set<number>()
  if (ticksCount <= 1) {
    tickIdxs.add(0)
  } else {
    for (let i = 0; i < ticksCount; i++) {
      tickIdxs.add(Math.round((i * (total - 1)) / (ticksCount - 1)))
    }
  }

  const chartHeight = 96

  return (
    <div className="w-full select-none">
      {/* ── Bar area ── */}
      <div className="relative flex items-end gap-px w-full" style={{ height: chartHeight }}>
        {data.map((d, i) => {
          const val = Number(d[valueKey]) || 0
          const rawLabel = String(d[labelKey] || "")
          const dateLabel = rawLabel.length === 10 ? fmtDate(rawLabel) : rawLabel
          const barH = val > 0 ? Math.max(3, Math.round((val / max) * (chartHeight - 4))) : 1

          return (
            <div
              key={i}
              className="flex-1 relative group flex items-end"
              style={{ height: "100%" }}
            >
              {val > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                  <div className="bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap leading-none">
                    <span className="text-sm">{val}</span>
                    <span className="text-gray-400 ml-1">{dateLabel}</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-0.5" />
                </div>
              )}
              <div
                className={cn("w-full rounded-t-sm", color, val === 0 ? "opacity-15" : "opacity-90")}
                style={{ height: barH }}
              />
            </div>
          )
        })}
      </div>

      {/* ── Baseline ── */}
      <div className="h-px bg-gray-200 w-full mt-1" />

      {/* ── Label row: absolute-positioned ticks so labels never get clipped ── */}
      <div className="relative w-full mt-1.5" style={{ height: 16 }}>
        {data.map((d, i) => {
          if (!tickIdxs.has(i)) return null
          const rawLabel = String(d[labelKey] || "")
          const dateLabel = rawLabel.length === 10 ? fmtDate(rawLabel) : rawLabel
          // Center the tick label on the middle of its bar.
          const leftPct = ((i + 0.5) / total) * 100
          return (
            <span
              key={i}
              className="absolute top-0 text-[10px] text-gray-500 whitespace-nowrap leading-none"
              style={{
                left: `${leftPct}%`,
                transform:
                  i === 0
                    ? "translateX(0)"
                    : i === total - 1
                    ? "translateX(-100%)"
                    : "translateX(-50%)",
              }}
            >
              {dateLabel}
            </span>
          )
        })}
      </div>
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
        <SectionHeader
          icon={Eye}
          title="Visitors"
          sub={`${visitors.totalEver.toLocaleString()} unique ever · tracked via first-party cookie`}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="New today" value={visitors.todayNew} icon={UserPlus} colorClass="bg-sky-100 text-sky-600" sub={`${visitors.todayViews.toLocaleString()} views`} />
          <StatCard label="New this week" value={visitors.weekNew} icon={TrendingUp} colorClass="bg-indigo-100 text-indigo-600" sub={`${visitors.weekViews.toLocaleString()} views`} />
          <StatCard label="New this month" value={visitors.monthNew} icon={Activity} colorClass="bg-violet-100 text-violet-600" sub={`${visitors.monthViews.toLocaleString()} views`} />
          <StatCard label="Applies this week" value={applications.weekNew} icon={Send} colorClass="bg-teal-100 text-teal-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* New-visitors chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold mb-1 text-gray-700">New visitors — last 30 days</p>
            <p className="text-xs text-gray-400 mb-4">Count of first-time visits per day</p>
            <MiniBarChart data={visitors.dailyNewVisitors} valueKey="count" labelKey="day" color="bg-sky-500/70" targetTicks={6} />
          </div>

          {/* Top pages */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold mb-3 text-gray-700">Top pages (30 days)</p>
            {visitors.topPages.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No data yet</p>
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

      {/* ── Applications & job views (conversions) ─────────────────────────── */}
      <section>
        <SectionHeader
          icon={Send}
          title="Applications & job engagement"
          sub="Apply clicks recorded on Aipplify · job page views (unique visitor per day)"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Applies (total)" value={applications.total} icon={FileText} colorClass="bg-teal-100 text-teal-600" />
          <StatCard label="Applies today" value={applications.todayNew} icon={Zap} colorClass="bg-emerald-100 text-emerald-600" />
          <StatCard label="Applies this week" value={applications.weekNew} icon={TrendingUp} colorClass="bg-cyan-100 text-cyan-600" />
          <StatCard label="Job page views (sum)" value={jobs.totalJobViews} icon={Eye} colorClass="bg-indigo-100 text-indigo-600" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold mb-1 text-gray-700">Applications — last 30 days</p>
          <p className="text-xs text-gray-400 mb-4">New Application rows per day (after user confirms apply flow)</p>
          <MiniBarChart
            data={applications.dailyApplications}
            valueKey="count"
            labelKey="date"
            color="bg-teal-500/70"
            targetTicks={6}
          />
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
            <MiniBarChart data={users.dailySignups} valueKey="count" labelKey="date" color="bg-blue-500/70" targetTicks={6} />
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
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Jobs by publication date — last 60 days</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Counted by <code className="bg-gray-100 px-1 rounded">postedAt</code> from the job-eco API
                </p>
              </div>
              {jobs.latestPostedAt && (
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Newest job</p>
                  <p className="text-xs font-semibold text-gray-700">
                    {formatDistanceToNow(new Date(jobs.latestPostedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>
            <MiniBarChart data={jobs.dailyNew} valueKey="count" labelKey="date" color="bg-amber-400/80" targetTicks={7} />
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
