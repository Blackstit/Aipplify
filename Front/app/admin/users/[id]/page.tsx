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
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"

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
    </div>
  )
}
