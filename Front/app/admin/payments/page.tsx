"use client"

import { useEffect, useState, useCallback } from "react"
import { getCurrentUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"
import { Plus, X, RefreshCcw, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"

interface Payment {
  id: string
  userId: string
  plan: string
  period: string
  durationDays: number
  amount: number
  currency: string
  orderId: string
  status: string
  paidAt: string | null
  grantedByAdmin: boolean
  adminNote: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string } | null
}

interface SummaryItem {
  status: string
  _count: number
  _sum: { amount: number | null }
}

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  PAYING: "bg-blue-100 text-blue-700",
  EXPIRED: "bg-gray-100 text-gray-500",
  UNDERPAID: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-700",
}

const LIMIT = 20

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState<SummaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [offset, setOffset] = useState(0)

  const [grantOpen, setGrantOpen] = useState(false)
  const [grantUserId, setGrantUserId] = useState("")
  const [grantPlan, setGrantPlan] = useState("STARTER")
  const [grantDays, setGrantDays] = useState("30")
  const [grantNote, setGrantNote] = useState("")
  const [granting, setGranting] = useState(false)
  const [grantError, setGrantError] = useState("")

  const [revoking, setRevoking] = useState<string | null>(null)

  const load = useCallback(async () => {
    const user = getCurrentUser()
    if (!user) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(offset) })
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      const res = await fetch(`/api/admin/payments?${params}`, { headers: { "x-user-id": user.id } })
      const data = await res.json()
      setPayments(data.payments ?? [])
      setTotal(data.total ?? 0)
      setSummary(data.summary ?? [])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, offset])

  useEffect(() => { load() }, [load])

  const handleGrant = async () => {
    if (!grantUserId.trim()) { setGrantError("User ID is required"); return }
    const user = getCurrentUser()
    if (!user) return
    setGranting(true)
    setGrantError("")
    try {
      const res = await fetch("/api/admin/subscriptions/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({
          userId: grantUserId.trim(),
          plan: grantPlan,
          durationDays: Number(grantDays),
          note: grantNote.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to grant")
      setGrantOpen(false)
      setGrantUserId("")
      setGrantNote("")
      load()
    } catch (err) {
      setGrantError(err instanceof Error ? err.message : "Error")
    } finally {
      setGranting(false)
    }
  }

  const handleRevoke = async (userId: string, userName: string) => {
    if (!confirm(`Revoke Pro subscription for ${userName}?`)) return
    const user = getCurrentUser()
    if (!user) return
    setRevoking(userId)
    try {
      await fetch("/api/admin/subscriptions/grant", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({ userId }),
      })
      load()
    } finally {
      setRevoking(null)
    }
  }

  const totalRevenue = summary
    .filter((s) => s.status === "PAID")
    .reduce((acc, s) => acc + (s._sum.amount ?? 0), 0)
  const paidCount = summary.find((s) => s.status === "PAID")?._count ?? 0
  const pendingCount = summary.find((s) => s.status === "PENDING")?._count ?? 0

  const pages = Math.ceil(total / LIMIT)
  const page = Math.floor(offset / LIMIT) + 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCcw className="h-3.5 w-3.5" />Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setGrantOpen(true)}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4" />Grant Access
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Revenue (USDT)</p>
          <p className="text-3xl font-extrabold text-gray-900">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{paidCount} paid orders</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Awaiting Payment</p>
          <p className="text-3xl font-extrabold text-yellow-600">{pendingCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">pending invoices</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">By Status</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {summary.map((s) => (
              <span
                key={s.status}
                className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600")}
              >
                {s.status} · {s._count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit flex-wrap">
        {["ALL", "PAID", "PENDING", "PAYING", "EXPIRED", "UNDERPAID", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setOffset(0) }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              statusFilter === s ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-sm">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["User", "Plan / Period", "Amount", "Status", "Date", "Order ID", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate max-w-[160px]">{p.user?.name || "—"}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[160px]">{p.user?.email}</div>
                      {p.grantedByAdmin && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 rounded px-1.5 py-0.5 mt-0.5">
                          <ShieldCheck className="h-2.5 w-2.5" />Admin Grant
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{p.plan}</div>
                      <div className="text-xs text-gray-400">{p.period} · {p.durationDays}d</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{p.currency === "ADMIN" ? "FREE" : `$${p.amount}`}</div>
                      <div className="text-xs text-gray-400">{p.currency}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600")}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(p.createdAt), "d MMM yyyy")}
                      {p.paidAt && (
                        <div className="text-green-600 text-[10px]">
                          Paid {formatDistanceToNow(new Date(p.paidAt), { addSuffix: true })}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[10px] text-gray-400 font-mono break-all">
                        {p.orderId.length > 22 ? p.orderId.slice(0, 22) + "…" : p.orderId}
                      </code>
                      {p.adminNote && (
                        <div className="text-[10px] text-gray-400 mt-0.5 max-w-[140px] truncate" title={p.adminNote}>
                          {p.adminNote}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.user && (p.status === "PAID" || p.grantedByAdmin) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                          disabled={revoking === p.userId}
                          onClick={() => handleRevoke(p.userId, p.user?.name || p.user?.email || p.userId)}
                        >
                          {revoking === p.userId ? "…" : "Revoke"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {page} of {pages} · {total} total</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setOffset(offset - LIMIT)} disabled={offset === 0}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setOffset(offset + LIMIT)} disabled={offset + LIMIT >= total}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Grant access modal */}
      {grantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Grant Pro Access</h2>
              <button onClick={() => setGrantOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                  User ID <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="cuid of the user (copy from Users table)..."
                  value={grantUserId}
                  onChange={(e) => setGrantUserId(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-1">Find the user ID in /admin/users → click user row</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Plan</label>
                  <select
                    value={grantPlan}
                    onChange={(e) => setGrantPlan(e.target.value)}
                    className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="STARTER">STARTER</option>
                    <option value="PROFESSIONAL">PROFESSIONAL</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Days</label>
                  <Input
                    type="number"
                    value={grantDays}
                    onChange={(e) => setGrantDays(e.target.value)}
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                  Admin note (optional)
                </label>
                <Input
                  placeholder="e.g. Beta tester, influencer deal, refund credit..."
                  value={grantNote}
                  onChange={(e) => setGrantNote(e.target.value)}
                />
              </div>

              {grantError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{grantError}</p>}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setGrantOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                  onClick={handleGrant}
                  disabled={granting}
                >
                  {granting ? "Granting…" : `Grant ${grantDays}d Pro`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
