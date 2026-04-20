"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { getCurrentUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Inbox, Loader2, Mail, MessageSquare, Send, Trash2, User as UserIcon,
  Clock, CheckCheck, Archive, RefreshCcw, Copy, ExternalLink,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

type Inquiry = {
  id: string
  name: string
  email: string | null
  contactMethod: string | null
  contactValue: string | null
  subject: string | null
  message: string
  source: "CONTACT_PAGE" | "RECRUITER_FORM" | "RECRUITER_BANNER" | "OTHER"
  status: "NEW" | "READ" | "RESPONDED" | "CLOSED"
  pageUrl: string | null
  ipAddress: string | null
  createdAt: string
  updatedAt: string
  adminNote: string | null
}

const SOURCE_LABEL: Record<Inquiry["source"], string> = {
  CONTACT_PAGE: "Contact page",
  RECRUITER_FORM: "Recruiter form",
  RECRUITER_BANNER: "Manager banner",
  OTHER: "Other",
}

const STATUS_ORDER: Inquiry["status"][] = ["NEW", "READ", "RESPONDED", "CLOSED"]

const STATUS_STYLES: Record<Inquiry["status"], { badge: string; card: string; dot: string }> = {
  NEW: {
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    card: "border-rose-200/70 ring-1 ring-rose-200/50 bg-gradient-to-br from-rose-50/60 via-white to-white",
    dot: "bg-rose-500",
  },
  READ: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    card: "border-amber-200/60 bg-white",
    dot: "bg-amber-500",
  },
  RESPONDED: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    card: "border-emerald-200/60 bg-white",
    dot: "bg-emerald-500",
  },
  CLOSED: {
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    card: "border-gray-200 bg-white/70 opacity-90",
    dot: "bg-gray-400",
  },
}

function buildContactUrl(method: string | null, value: string | null): string | null {
  if (!method || !value) return null
  const m = method.toLowerCase()
  const v = value.trim()
  if (m === "email") return `mailto:${v}`
  if (m === "telegram") {
    const user = v.replace(/^@/, "").replace(/^https?:\/\/t\.me\//i, "")
    return `https://t.me/${user}`
  }
  if (m === "whatsapp") {
    const digits = v.replace(/[^\d+]/g, "")
    return `https://wa.me/${digits.replace(/^\+/, "")}`
  }
  if (m === "phone") return `tel:${v}`
  return null
}

function CardItem({
  item,
  onChangeStatus,
  onDelete,
  isAdmin,
}: {
  item: Inquiry
  onChangeStatus: (id: string, status: Inquiry["status"]) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isAdmin: boolean
}) {
  const [busy, setBusy] = useState<null | Inquiry["status"] | "delete">(null)
  const [copied, setCopied] = useState(false)
  const styles = STATUS_STYLES[item.status]
  const url = buildContactUrl(item.contactMethod, item.contactValue)

  const change = async (s: Inquiry["status"]) => {
    setBusy(s)
    await onChangeStatus(item.id, s)
    setBusy(null)
  }
  const del = async () => {
    if (!confirm("Delete this inquiry? This cannot be undone.")) return
    setBusy("delete")
    await onDelete(item.id)
    setBusy(null)
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md",
        styles.card,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <UserIcon className="h-5 w-5 text-gray-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 truncate">{item.name}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded-full border px-2 py-0.5",
                  styles.badge,
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                {item.status}
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                {SOURCE_LABEL[item.source]}
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {item.subject && (
        <p className="text-sm font-medium text-gray-900 mb-2">{item.subject}</p>
      )}
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
        {item.message}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-600">
        {item.email && (
          <span className="inline-flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{item.email}</span>
            <button
              type="button"
              onClick={() => copy(item.email!)}
              className="text-gray-400 hover:text-primary"
              title="Copy"
            >
              <Copy className="h-3 w-3" />
            </button>
          </span>
        )}
        {item.contactMethod && item.contactValue && (
          <span className="inline-flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1 capitalize">
            <MessageSquare className="h-3 w-3" />
            <span className="font-medium">{item.contactMethod}:</span>
            <span className="truncate max-w-[180px]">{item.contactValue}</span>
            <button
              type="button"
              onClick={() => copy(item.contactValue!)}
              className="text-gray-400 hover:text-primary"
              title="Copy"
            >
              <Copy className="h-3 w-3" />
            </button>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary"
                title="Open"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </span>
        )}
        {copied && <span className="text-[11px] text-emerald-600 font-medium">copied!</span>}
        {item.pageUrl && (
          <a
            href={item.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-primary truncate max-w-[200px]"
            title={item.pageUrl}
          >
            <ExternalLink className="h-3 w-3" />
            source page
          </a>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200/70 flex flex-wrap gap-2">
        {item.status === "NEW" && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => change("READ")}
          >
            {busy === "READ" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
            Mark read
          </Button>
        )}
        {item.status !== "RESPONDED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => change("RESPONDED")}
          >
            {busy === "RESPONDED" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Responded
          </Button>
        )}
        {item.status !== "CLOSED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => change("CLOSED")}
          >
            {busy === "CLOSED" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Archive className="h-3.5 w-3.5" />}
            Close
          </Button>
        )}
        {item.status !== "NEW" && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy !== null}
            onClick={() => change("NEW")}
            className="text-gray-500"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reopen
          </Button>
        )}
        {isAdmin && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy !== null}
            onClick={del}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 ml-auto"
          >
            {busy === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}

export default function AdminContactPage() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [newCount, setNewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"" | Inquiry["status"]>("")
  const [sourceFilter, setSourceFilter] = useState<"" | Inquiry["source"]>("")
  const [search, setSearch] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const u = getCurrentUser()
    if (u) {
      setUserId(u.id)
      setIsAdmin(u.role === "ADMIN")
    }
  }, [])

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const qs = new URLSearchParams()
    if (statusFilter) qs.set("status", statusFilter)
    if (sourceFilter) qs.set("source", sourceFilter)
    if (search.trim()) qs.set("search", search.trim())
    qs.set("limit", "100")
    try {
      const r = await fetch(`/api/admin/contact-inquiries?${qs.toString()}`, {
        headers: { "x-user-id": userId },
      })
      if (!r.ok) {
        setError("Failed to load")
        setItems([])
      } else {
        const j = await r.json()
        setItems(j.items || [])
        setNewCount(j.newCount || 0)
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }, [userId, statusFilter, sourceFilter, search])

  useEffect(() => {
    load()
  }, [load])

  const changeStatus = useCallback(
    async (id: string, status: Inquiry["status"]) => {
      if (!userId) return
      const prev = items
      setItems((list) =>
        list.map((i) => (i.id === id ? { ...i, status } : i)),
      )
      try {
        const r = await fetch(`/api/admin/contact-inquiries/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-user-id": userId },
          body: JSON.stringify({ status }),
        })
        if (!r.ok) {
          setItems(prev)
        } else {
          await load()
        }
      } catch {
        setItems(prev)
      }
    },
    [userId, items, load],
  )

  const deleteItem = useCallback(
    async (id: string) => {
      if (!userId) return
      const prev = items
      setItems((list) => list.filter((i) => i.id !== id))
      try {
        const r = await fetch(`/api/admin/contact-inquiries/${id}`, {
          method: "DELETE",
          headers: { "x-user-id": userId },
        })
        if (!r.ok) setItems(prev)
      } catch {
        setItems(prev)
      }
    },
    [userId, items],
  )

  const groupedByStatus = useMemo(() => {
    const map: Record<Inquiry["status"], Inquiry[]> = {
      NEW: [], READ: [], RESPONDED: [], CLOSED: [],
    }
    for (const i of items) map[i.status].push(i)
    return map
  }, [items])

  const totalByStatus = useMemo(() => {
    const base: Record<Inquiry["status"], number> = { NEW: 0, READ: 0, RESPONDED: 0, CLOSED: 0 }
    for (const i of items) base[i.status] += 1
    return base
  }, [items])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" />
            Contact inbox
            {newCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-5.5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold">
                {newCount > 99 ? "99+" : newCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Messages submitted via contact forms across the site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search name, email, message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | Inquiry["status"])}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="READ">Read</option>
          <option value="RESPONDED">Responded</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as "" | Inquiry["source"])}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All sources</option>
          <option value="CONTACT_PAGE">Contact page</option>
          <option value="RECRUITER_FORM">Recruiter form</option>
          <option value="RECRUITER_BANNER">Manager banner</option>
          <option value="OTHER">Other</option>
        </select>
        <div className="ml-auto text-xs text-gray-500 flex flex-wrap gap-3">
          {STATUS_ORDER.map((s) => (
            <span key={s} className="inline-flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-full", STATUS_STYLES[s].dot)} />
              {s.toLowerCase()}: <b>{totalByStatus[s]}</b>
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 rounded-xl border border-dashed border-gray-300 bg-white">
          <Inbox className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No messages yet</h3>
          <p className="text-sm text-gray-500">
            Submissions from contact forms will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {STATUS_ORDER.map((s) => {
            const list = groupedByStatus[s]
            if (!list.length) return null
            return (
              <section key={s}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_STYLES[s].dot)} />
                  {s.toLowerCase()}
                  <span className="text-gray-300">·</span>
                  <span>{list.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {list.map((item) => (
                    <CardItem
                      key={item.id}
                      item={item}
                      onChangeStatus={changeStatus}
                      onDelete={deleteItem}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
