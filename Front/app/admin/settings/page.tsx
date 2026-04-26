"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Loader2, Eye, Users, KeyRound, Check, EyeOff, Link2, Link2Off, RefreshCw } from "lucide-react"
import { invalidatePublicJobMetricsCache } from "@/components/JobCard"
import { cn } from "@/lib/utils"

type Settings = {
  showPublicJobViewCounts: boolean
  showPublicWatchingCount: boolean
}

type LiTarget = "person" | "org" | "both"

type LinkedInState = {
  connected: boolean
  personName?: string
  orgName?: string
  hasOrg: boolean
  postTarget: LiTarget
  autoPost: boolean
}

const LI_ICON = (
  <svg className="h-4 w-4 text-[#0A66C2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

export default function AdminSettingsPage() {
  const [data, setData] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  const [orKeyMasked, setOrKeyMasked] = useState("")
  const [orKeyInput, setOrKeyInput] = useState("")
  const [orKeyVisible, setOrKeyVisible] = useState(false)
  const [orKeySaving, setOrKeySaving] = useState(false)
  const [orKeySaved, setOrKeySaved] = useState(false)

  const [li, setLi] = useState<LinkedInState>({ connected: false, hasOrg: false, postTarget: "person", autoPost: false })
  const [liSaving, setLiSaving] = useState(false)
  const [liMsg, setLiMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    setIsAdmin(getCurrentUser()?.role === "ADMIN")
    const connected = searchParams.get("linkedin_connected")
    const orgName = searchParams.get("org")
    const liError = searchParams.get("linkedin_error")
    if (connected) {
      const extra = orgName ? ` Страница: ${orgName}` : " (личный аккаунт)"
      setLiMsg({ text: `LinkedIn подключён.${extra}`, ok: true })
    }
    if (liError) setLiMsg({ text: `Ошибка LinkedIn: ${liError}`, ok: false })
  }, [searchParams])

  const load = async () => {
    const user = getCurrentUser()
    if (!user) return
    setLoading(true)
    setError("")
    try {
      const [siteR, secretsR] = await Promise.all([
        fetch("/api/admin/site-settings", { headers: { "x-user-id": user.id } }),
        fetch("/api/admin/secrets", { headers: { "x-user-id": user.id } }),
      ])
      const siteJ = await siteR.json()
      if (!siteR.ok) throw new Error(siteJ.error || "Failed")
      setData(siteJ)
      const s = await secretsR.json()
      setOrKeyMasked(s.openrouterKey || "")
      setLi({
        connected: s.linkedinConnected,
        personName: s.linkedinPersonName,
        orgName: s.linkedinOrgName,
        hasOrg: s.linkedinHasOrg,
        postTarget: s.linkedinPostTarget ?? (s.linkedinHasOrg ? "org" : "person"),
        autoPost: s.linkedinAutoPost,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  const saveOrKey = async () => {
    if (!orKeyInput.trim()) return
    const user = getCurrentUser()
    if (!user) return
    setOrKeySaving(true)
    const r = await fetch("/api/admin/secrets", {
      method: "PATCH",
      headers: { "x-user-id": user.id, "content-type": "application/json" },
      body: JSON.stringify({ openrouterKey: orKeyInput.trim() }),
    })
    const j = await r.json()
    setOrKeyMasked(j.openrouterKey || "")
    setOrKeyInput("")
    setOrKeyVisible(false)
    setOrKeySaved(true)
    setTimeout(() => setOrKeySaved(false), 3000)
    setOrKeySaving(false)
  }

  const patchLinkedIn = async (patch: Partial<{
    linkedinAutoPost: boolean
    linkedinPostTarget: LiTarget
    disconnectLinkedIn: boolean
  }>) => {
    const user = getCurrentUser()
    if (!user) return
    setLiSaving(true)
    const r = await fetch("/api/admin/secrets", {
      method: "PATCH",
      headers: { "x-user-id": user.id, "content-type": "application/json" },
      body: JSON.stringify(patch),
    })
    const j = await r.json()
    setLi({
      connected: j.linkedinConnected,
      personName: j.linkedinPersonName,
      orgName: j.linkedinOrgName,
      hasOrg: j.linkedinHasOrg,
      postTarget: j.linkedinPostTarget ?? (j.linkedinHasOrg ? "org" : "person"),
      autoPost: j.linkedinAutoPost,
    })
    setLiSaving(false)
  }

  useEffect(() => { load() }, [])

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

  const user = getCurrentUser()

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

      {/* Site toggles */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-semibold">Show job view &amp; apply counters to visitors</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              When off, the pills on job cards and the counters on the job page are hidden for guests.
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
              <span className="text-sm font-semibold">"Watching now" on job pages</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              When off, the live "people viewing this job" line is hidden for guests (still shown to staff).
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

      {/* OpenRouter API Key */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold">OpenRouter API Key</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Required for AI article generation. Get your key at{" "}
            <span className="font-mono text-gray-700">openrouter.ai/keys</span>
          </p>
          {orKeyMasked && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <span className="font-mono">{orKeyMasked}</span>
              {orKeySaved && (
                <span className="flex items-center gap-1 text-green-600 ml-auto font-medium">
                  <Check className="h-3.5 w-3.5" /> Saved
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={orKeyVisible ? "text" : "password"}
                value={orKeyInput}
                onChange={(e) => setOrKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveOrKey()}
                placeholder={orKeyMasked ? "Enter new key to replace…" : "sk-or-v1-…"}
                className="h-9 text-sm pr-9"
                disabled={!isAdmin}
              />
              <button
                type="button"
                onClick={() => setOrKeyVisible(!orKeyVisible)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeOff className="h-4 w-4" />
              </button>
            </div>
            <Button size="sm" onClick={saveOrKey} disabled={!orKeyInput.trim() || orKeySaving || !isAdmin} className="gap-1.5 shrink-0">
              {orKeySaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save
            </Button>
          </div>
          {!isAdmin && <p className="text-xs text-amber-600">Only administrators can update the API key.</p>}
        </div>
      </div>

      {/* LinkedIn */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 space-y-4">

          {/* Header */}
          <div className="flex items-center gap-2">
            {LI_ICON}
            <span className="text-sm font-semibold">LinkedIn Auto-publish</span>
            <span className={cn(
              "ml-auto text-xs font-medium flex items-center gap-1 px-2 py-0.5 rounded-full",
              li.connected ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full inline-block", li.connected ? "bg-green-500" : "bg-gray-400")} />
              {li.connected ? "Подключён" : "Не подключён"}
            </span>
          </div>

          {/* Feedback message */}
          {liMsg && (
            <p className={cn("text-xs px-3 py-2 rounded-lg", liMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
              {liMsg.text}
            </p>
          )}

          {li.connected ? (
            <div className="space-y-4">

              {/* Account info */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1.5 text-xs text-gray-600">
                {li.personName && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Аккаунт</span>
                    <span className="font-medium text-gray-800">{li.personName}</span>
                  </div>
                )}
                {li.orgName ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Страница компании</span>
                    <span className="font-medium text-gray-800">{li.orgName}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Страница компании</span>
                    <span className="text-amber-600 font-medium">не подключена</span>
                  </div>
                )}
              </div>

              {/* WHERE to publish */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">Куда публиковать</p>
                <div className={cn("grid gap-2", li.hasOrg ? "grid-cols-3" : "grid-cols-1")}>
                  {(["person", ...(li.hasOrg ? ["org", "both"] : [])] as LiTarget[]).map((t) => {
                    const labels: Record<LiTarget, { title: string; sub: string }> = {
                      person: { title: "Личный профиль", sub: li.personName || "—" },
                      org:    { title: "Страница",       sub: li.orgName || "—" },
                      both:   { title: "Оба",            sub: "профиль + страница" },
                    }
                    const active = li.postTarget === t
                    return (
                      <button
                        key={t}
                        disabled={!isAdmin || liSaving}
                        onClick={() => {
                          if (!isAdmin || liSaving || active) return
                          setLi((s) => ({ ...s, postTarget: t }))
                          void patchLinkedIn({ linkedinPostTarget: t })
                        }}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-xs text-left transition-colors",
                          active
                            ? "border-[#0A66C2] bg-blue-50 text-[#0A66C2] font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        )}
                      >
                        <div className="font-medium mb-0.5">{labels[t].title}</div>
                        <div className="text-[11px] text-gray-400 truncate">{labels[t].sub}</div>
                      </button>
                    )
                  })}
                </div>
                {!li.hasOrg && (
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Страница компании появится после одобрения <strong>Community Management API</strong> и повторного подключения.
                  </p>
                )}
              </div>

              {/* WHETHER to publish */}
              <div className="flex items-center justify-between py-0.5">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Авто-публикация</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {li.autoPost
                      ? `Каждая новая статья уходит в: ${li.postTarget === "both" ? "профиль + страница" : li.postTarget === "org" ? (li.orgName || "страница") : (li.personName || "личный профиль")}`
                      : "Выключено — статьи не публикуются в LinkedIn"
                    }
                  </p>
                </div>
                <div className={cn((!isAdmin || liSaving) && "opacity-50 pointer-events-none")}>
                  <Switch
                    checked={li.autoPost}
                    onCheckedChange={(v) => {
                      setLi((s) => ({ ...s, autoPost: v }))
                      void patchLinkedIn({ linkedinAutoPost: v })
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-gray-600"
                  disabled={!isAdmin || liSaving}
                  onClick={() => {
                    if (user) window.location.href = `/api/admin/linkedin/auth?x-user-id=${user.id}`
                  }}
                >
                  {liSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Переподключить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                  disabled={!isAdmin || liSaving}
                  onClick={() => void patchLinkedIn({ disconnectLinkedIn: true })}
                >
                  <Link2Off className="h-3.5 w-3.5" />
                  Отключить
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                После подключения каждая опубликованная статья будет автоматически постится в LinkedIn.
                Убедись что в LinkedIn Developer App добавлен Redirect URL:
              </p>
              <code className="block text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 break-all">
                https://aipplify.com/api/admin/linkedin/callback
              </code>
              <Button
                size="sm"
                className="bg-[#0A66C2] hover:bg-[#004182] text-white gap-1.5"
                disabled={!isAdmin}
                onClick={() => {
                  if (user) window.location.href = `/api/admin/linkedin/auth?x-user-id=${user.id}`
                }}
              >
                <Link2 className="h-3.5 w-3.5" />
                Подключить LinkedIn
              </Button>
              {!isAdmin && <p className="text-xs text-amber-600">Только администраторы могут подключать LinkedIn.</p>}
            </div>
          )}
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={() => load()} disabled={saving}>
        Reload
      </Button>
    </div>
  )
}
