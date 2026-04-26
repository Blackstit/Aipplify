"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import {
  LayoutDashboard, Users, Briefcase, Settings, ShieldCheck, LogOut,
  ChevronRight, Menu, Inbox, BookOpen, FileText, Sparkles,
  FolderOpen, LayoutTemplate, ChevronDown, CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Nav definition ─────────────────────────────────────────────────────────────
type NavLeaf = {
  href: string; label: string; icon: React.ElementType
  exact?: boolean; badge?: "newContact"
}
type NavGroup = {
  group: true; href: string; label: string; icon: React.ElementType
  children: NavLeaf[]
}
type NavItem = NavLeaf | NavGroup

const NAV: NavItem[] = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users",    label: "Users",     icon: Users },
  { href: "/admin/jobs",     label: "Jobs",      icon: Briefcase },
  {
    group: true,
    href: "/admin/blog",
    label: "Blog",
    icon: BookOpen,
    children: [
      { href: "/admin/blog",          label: "Articles",        icon: FileText,       exact: true },
      { href: "/admin/blog/studio",   label: "Content Studio",  icon: LayoutTemplate  },
      { href: "/admin/blog/generate", label: "AI Generate",     icon: Sparkles        },
      { href: "/admin/blog/categories",label: "Categories",     icon: FolderOpen      },
    ],
  },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/contact",  label: "Contact",  icon: Inbox,    badge: "newContact" as const },
  { href: "/admin/settings", label: "Settings", icon: Settings  },
]

// ── Component ──────────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady]               = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [adminName, setAdminName]       = useState("")
  const [newContactCount, setNewContactCount] = useState(0)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      router.replace("/auth"); return
    }
    setAdminName(user.name || user.email)
    setReady(true)
  }, [router])

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    const load = async () => {
      const user = getCurrentUser()
      if (!user) return
      try {
        const r = await fetch("/api/admin/contact-inquiries?limit=1&status=NEW", {
          headers: { "x-user-id": user.id },
        })
        if (!r.ok || cancelled) return
        const j = await r.json()
        setNewContactCount(typeof j.newCount === "number" ? j.newCount : 0)
      } catch { /* ignore */ }
    }
    load()
    const id = setInterval(load, 60_000)
    window.addEventListener("focus", load)
    return () => { cancelled = true; clearInterval(id); window.removeEventListener("focus", load) }
  }, [ready, pathname])

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const isLeafActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const isGroupActive = (item: NavGroup) =>
    pathname.startsWith(item.href)

  function SidebarInner() {
    const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
      const s = new Set<string>()
      NAV.forEach((item) => {
        if ("group" in item && isGroupActive(item)) s.add(item.href)
      })
      return s
    })

    const toggle = (href: string) => {
      setOpenGroups((prev) => {
        const next = new Set(prev)
        next.has(href) ? next.delete(href) : next.add(href)
        return next
      })
    }

    return (
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-gray-200">
          <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
          <div>
            <p className="font-bold text-sm leading-tight">Admin Panel</p>
            <p className="text-xs text-gray-500 truncate max-w-[140px]">{adminName}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            if ("group" in item) {
              const groupActive = isGroupActive(item)
              const open = openGroups.has(item.href)
              const Icon = item.icon
              return (
                <div key={item.href}>
                  {/* Group header — clickable to collapse */}
                  <button
                    onClick={() => toggle(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      groupActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
                  </button>

                  {/* Children */}
                  {open && (
                    <div className="ml-3 mt-0.5 pl-3 border-l border-gray-200 space-y-0.5">
                      {item.children.map((child) => {
                        const active = isLeafActive(child.href, child.exact)
                        const CIcon = child.icon
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800",
                            )}
                          >
                            <CIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="flex-1">{child.label}</span>
                            {active && <ChevronRight className="h-3 w-3" />}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Leaf item
            const leaf = item as NavLeaf
            const active = isLeafActive(leaf.href, leaf.exact)
            const Icon = leaf.icon
            const showBadge = leaf.badge === "newContact" && newContactCount > 0
            return (
              <Link
                key={leaf.href}
                href={leaf.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{leaf.label}</span>
                {showBadge && (
                  <span className="inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums">
                    {newContactCount > 99 ? "99+" : newContactCount}
                  </span>
                )}
                {active && <ChevronRight className="h-3.5 w-3.5" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-4 border-t border-gray-200 pt-3">
          <Link href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <LogOut className="h-4 w-4 shrink-0" />
            Back to site
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 shrink-0 fixed h-full z-20">
        <SidebarInner />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 bg-white border-r border-gray-200 shadow-xl">
            <SidebarInner />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md hover:bg-gray-100">
            <Menu className="h-5 w-5" />
          </button>
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Admin Panel</span>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
