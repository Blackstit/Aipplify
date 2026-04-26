"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  User,
  Bookmark,
  Filter,
  LogOut,
  Plus,
  Briefcase,
  Building2,
  FileText,
  Settings,
  Sparkles,
  Crown,
} from "lucide-react"
import { getCurrentUser, clearCurrentUser, type User as UserType } from "@/lib/session"

function useProfileCount(userId: string | undefined) {
  const [count, setCount] = useState<number>(0)
  useEffect(() => {
    if (!userId) return
    fetch(`/api/profiles?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => setCount(d.profiles?.length ?? 0))
      .catch(() => {})
  }, [userId])
  return count
}

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const profileCount = useProfileCount(user?.id)

  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUser())
  }, [])

  const handleLogout = () => {
    clearCurrentUser()
    setUser(null)
    setIsOpen(false)
    // Dispatch event to update Header
    window.dispatchEvent(new Event("user-changed"))
    router.push("/")
  }

  if (!mounted || !user) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user.name || user.email.split("@")[0]}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <Link href="/pricing" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                  <span className="ml-auto">→</span>
                </Button>
              </Link>
            </div>

            {/* Profile */}
            <div className="py-2">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Profile</span>
              </Link>
            </div>

            {/* Recruiter Menu */}
            {user.type === "RECRUITER" ? (
              <>
                <div className="border-t border-gray-200 py-2">
                  <Link
                    href="/recruiter/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Briefcase className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Dashboard</span>
                  </Link>
                  <Link
                    href="/recruiter/jobs"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">My Jobs</span>
                  </Link>
                  <Link
                    href="/recruiter/jobs/new"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Create Job</span>
                  </Link>
                  <Link
                    href="/recruiter/companies"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Companies</span>
                  </Link>
                  <Link
                    href="/recruiter/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Candidate Menu */}
                <div className="border-t border-gray-200 py-2">
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href="/profiles"
                        onClick={() => setIsOpen(false)}
                        className="text-sm text-gray-700 hover:text-gray-900"
                      >
                        Profiles
                      </Link>
                      <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                        {profileCount}
                      </span>
                    </div>
                    <Link
                      href="/profiles/create"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <Plus className="h-3 w-3" />
                      Create profile
                    </Link>
                  </div>
                </div>

                {/* Navigation */}
                <div className="border-t border-gray-200 py-2">
                  <Link
                    href="/matches"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-700">Match Checks</span>
                  </Link>
                  <Link
                    href="/saved-jobs"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Bookmark className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Saved Jobs</span>
                  </Link>
                  <Link
                    href="/filters"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Your Filters</span>
                  </Link>
                </div>
              </>
            )}

            {/* Logout */}
            <div className="border-t border-gray-200 py-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
