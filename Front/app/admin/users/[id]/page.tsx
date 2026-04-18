"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft, Save, CheckCircle2, AlertCircle, User, Shield,
  Mail, Key, Calendar, Clock, Briefcase, FileText,
  Activity, Monitor, Smartphone, Globe, MapPin, ExternalLink,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"

interface VisitorInfo {
  id: string
  firstSeen: string
  lastSeen: string
  pageViews: number
  firstPath: string | null
  firstReferrer: string | null
  userAgent: string | null
  ip: string | null
  country: string | null
}

interface PageViewInfo {
  id: string
  visitorId: string
  path: string
  referrer: string | null
  createdAt: string
}

interface SessionInfo {
  createdAt: string
  ip: string | null
  userAgent: string | null
  revokedAt: string | null
  expiresAt: string
}

interface UserActivity {
  visitors: VisitorInfo[]
  pageViews: PageViewInfo[]
  lastSession: SessionInfo | null
}

interface UserDetail {
  id: string
  email: string
  name: string | null
  type: "CANDIDATE" | "RECRUITER"
  role: "USER" | "MODERATOR" | "ADMIN"
  status: "ACTIVE" | "BANNED" | "DELETED"
  emailVerified: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  _count: { applications: number; sessions: number }
  activity?: UserActivity
}

// ── Helpers ────────────────────────────────────────────────────────────────────
/** Short human-friendly OS/browser label for a User-Agent string. */
function describeUA(ua: string | null | undefined) {
  if (!ua) return { label: "Unknown device", icon: Monitor }
  const isMobile = /iPhone|iPad|Android/i.test(ua)
  let os = "Unknown"
  if (/iPhone|iPad|iOS/.test(ua)) os = "iOS"
  else if (/Android/.test(ua)) os = "Android"
  else if (/Mac OS X/.test(ua)) os = "macOS"
  else if (/Windows/.test(ua)) os = "Windows"
  else if (/Linux/.test(ua)) os = "Linux"

  let browser = ""
  if (/Edg\//.test(ua)) browser = "Edge"
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome"
  else if (/Firefox\//.test(ua)) browser = "Firefox"
  else if (/Safari\//.test(ua)) browser = "Safari"

  return {
    label: browser ? `${browser} · ${os}` : os,
    icon: isMobile ? Smartphone : Monitor,
  }
}

function hostOf(url: string | null | undefined): string {
  if (!url) return "Direct"
  try {
    return new URL(url).host.replace(/^www\./, "")
  } catch {
    return "Direct"
  }
}

function prettyPath(p: string | null | undefined): string {
  if (!p) return "—"
  if (p === "/") return "/ (home)"
  return p
}

/** ISO-2 → flag emoji. Works because every uppercase ASCII letter has a
 * regional-indicator counterpart starting at U+1F1E6. */
function flagEmoji(iso2: string | null | undefined): string {
  if (!iso2 || iso2.length !== 2) return ""
  const A = "A".charCodeAt(0)
  const base = 0x1f1e6
  const up = iso2.toUpperCase()
  return String.fromCodePoint(base + (up.charCodeAt(0) - A), base + (up.charCodeAt(1) - A))
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MODERATOR: "bg-orange-100 text-orange-700",
  USER: "bg-gray-100 text-gray-600",
}

export default function AdminUserEditPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [emailVerified, setEmailVerified] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Current admin
  const [adminRole, setAdminRole] = useState<string>("")

  useEffect(() => {
    const admin = getCurrentUser()
    if (!admin) return
    setAdminRole(admin.role)

    fetch(`/api/admin/users/${userId}`, { headers: { "x-user-id": admin.id } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setToast({ type: "error", msg: data.error }); return }
        setUser(data)
        setName(data.name || "")
        setEmail(data.email)
        setRole(data.role)
        setType(data.type)
        setStatus(data.status)
        setEmailVerified(!!data.emailVerified)
      })
      .finally(() => setLoading(false))
  }, [userId])

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSave = async () => {
    const admin = getCurrentUser()
    if (!admin) return

    if (password && password !== confirmPassword) {
      showToast("error", "Passwords do not match")
      return
    }
    if (password && password.length < 6) {
      showToast("error", "Password must be at least 6 characters")
      return
    }

    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        name, email, role, type, status, emailVerified,
      }
      if (password) body.password = password

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": admin.id },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        showToast("error", data.error || "Failed to save")
        return
      }

      setUser(data)
      setPassword("")
      setConfirmPassword("")
      showToast("success", "User updated successfully")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-red-700">User not found</div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border",
          toast.type === "success"
            ? "bg-green-50 text-green-800 border-green-200"
            : "bg-red-50 text-red-800 border-red-200",
        )}>
          {toast.type === "success"
            ? <CheckCircle2 className="h-4 w-4 text-green-600" />
            : <AlertCircle className="h-4 w-4 text-red-600" />
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Users
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-bold text-primary">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-bold">{user.name || "—"}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded ml-2", ROLE_COLORS[user.role])}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Joined", value: format(new Date(user.createdAt), "dd MMM yyyy"),
            sub: formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }), icon: Calendar,
          },
          {
            label: "Last Login",
            value: user.lastLoginAt ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }) : "Never",
            icon: Clock,
          },
          { label: "Applications", value: user._count.applications, icon: FileText },
          { label: "Sessions", value: user._count.sessions, icon: Briefcase },
        ].map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-3 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="font-semibold text-sm truncate">{value}</p>
              {sub && <p className="text-xs text-gray-400">{sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm">Basic Info</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs text-gray-500">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-gray-500">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-medium">Email Verified</p>
              <p className="text-xs text-gray-400">
                {user.emailVerified
                  ? `Verified ${formatDistanceToNow(new Date(user.emailVerified), { addSuffix: true })}`
                  : "Not verified"
                }
              </p>
            </div>
            <Switch
              checked={emailVerified}
              onCheckedChange={setEmailVerified}
            />
          </div>
        </div>

        {/* Access control */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm">Access Control</h2>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER — regular user</SelectItem>
                <SelectItem value="MODERATOR">MODERATOR — can manage content</SelectItem>
                <SelectItem value="ADMIN" disabled={adminRole !== "ADMIN"}>
                  ADMIN — full access {adminRole !== "ADMIN" && "(requires ADMIN)"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Account Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CANDIDATE">CANDIDATE — job seeker</SelectItem>
                <SelectItem value="RECRUITER">RECRUITER — can post jobs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Account Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE — can log in normally</SelectItem>
                <SelectItem value="BANNED">BANNED — blocked from logging in</SelectItem>
                <SelectItem value="DELETED">DELETED — soft deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Password reset */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Key className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm">Reset Password</h2>
            <span className="text-xs text-gray-400 ml-1">(leave blank to keep current)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pw" className="text-xs text-gray-500">New Password</Label>
              <Input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw2" className="text-xs text-gray-500">Confirm Password</Label>
              <Input
                id="pw2"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between pt-2">
        <Link href="/admin/users">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* ── Activity & Devices ───────────────────────────────────────────── */}
      <ActivityPanel activity={user.activity} />
    </div>
  )
}

// ─── Activity & Devices panel ─────────────────────────────────────────────────
function ActivityPanel({ activity }: { activity: UserActivity | undefined }) {
  if (!activity) return null
  const { visitors, pageViews, lastSession } = activity
  const hasAny = visitors.length > 0 || pageViews.length > 0 || lastSession

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-gray-400" />
        <h2 className="font-semibold text-sm">Activity &amp; Devices</h2>
        <span className="text-[11px] text-gray-400">· last known sessions, IPs and pageviews</span>
      </div>

      {!hasAny && (
        <p className="text-xs text-gray-400 py-4">
          No tracked activity yet. Data appears after the user browses the site
          while logged in, or after they log in with an existing visitor cookie.
        </p>
      )}

      {/* Last session card */}
      {lastSession && (
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-2">Last login session</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <Clock className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-500">When</p>
                <p className="font-medium text-gray-800">
                  {formatDistanceToNow(new Date(lastSession.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              {(() => {
                const { label, icon: Icon } = describeUA(lastSession.userAgent)
                return (
                  <>
                    <Icon className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gray-500">Device</p>
                      <p className="font-medium text-gray-800 truncate">{label}</p>
                    </div>
                  </>
                )
              })()}
            </div>
            <div className="flex items-start gap-2">
              <Globe className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-500">IP</p>
                <p className="font-mono text-gray-800">{lastSession.ip || "—"}</p>
              </div>
            </div>
          </div>
          {lastSession.revokedAt && (
            <p className="text-[11px] text-red-600 mt-3">
              Session revoked {formatDistanceToNow(new Date(lastSession.revokedAt), { addSuffix: true })}
            </p>
          )}
        </div>
      )}

      {/* Visitor cookies (devices) */}
      {visitors.length > 0 && (
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-2">
            Devices & referrers ({visitors.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {visitors.map((v) => {
              const { label: uaLabel, icon: UAIcon } = describeUA(v.userAgent)
              const flag = flagEmoji(v.country)
              return (
                <div
                  key={v.id}
                  className="border border-gray-200 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <UAIcon className="h-4 w-4 text-gray-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{uaLabel}</p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          …{v.id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-500 shrink-0">
                      {formatDistanceToNow(new Date(v.lastSeen), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {v.country ? (
                        <>
                          {flag && <span className="text-sm leading-none">{flag}</span>}
                          <span className="font-medium">{v.country}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">unknown</span>
                      )}
                      {v.ip && <span className="text-gray-400 font-mono ml-1">({v.ip})</span>}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                      {v.firstReferrer ? hostOf(v.firstReferrer) : <span className="italic text-gray-400">direct</span>}
                    </span>
                    <span className="text-gray-500">
                      {v.pageViews} {v.pageViews === 1 ? "view" : "views"}
                    </span>
                  </div>
                  {v.firstPath && (
                    <p className="text-[11px] text-gray-500 truncate">
                      Landed on <span className="font-mono text-gray-700">{prettyPath(v.firstPath)}</span>
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent page views */}
      {pageViews.length > 0 && (
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-2">
            Recent activity ({pageViews.length})
          </p>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
            {pageViews.map((pv) => (
              <div key={pv.id} className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-gray-50">
                <span className="text-gray-400 shrink-0 w-16">
                  {format(new Date(pv.createdAt), "dd MMM HH:mm")}
                </span>
                <span className="text-gray-800 font-mono truncate flex-1">{pv.path}</span>
                {pv.referrer ? (
                  <span className="text-gray-400 shrink-0 text-[11px] inline-flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {hostOf(pv.referrer)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
