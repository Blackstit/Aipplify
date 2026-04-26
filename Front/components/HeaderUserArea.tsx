"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  FileText,
  Crown,
  User as UserIcon,
  Plus,
} from "lucide-react"
import { getCurrentUser, type User as UserType } from "@/lib/session"
import { UserMenu } from "./UserMenu"
import { SavedJobsBadge } from "./SavedJobsBadge"

export function HeaderUserArea() {
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
    const handle = () => setUser(getCurrentUser())
    window.addEventListener("storage", handle)
    window.addEventListener("user-changed", handle)
    return () => {
      window.removeEventListener("storage", handle)
      window.removeEventListener("user-changed", handle)
    }
  }, [])

  if (user) {
    return (
      <div className="flex items-center gap-4">
        {user.type === "CANDIDATE" && (
          <>
            <Link href="/matches">
              <Button variant="ghost" size="icon" className="hidden md:flex" title="My Match Checks">
                <Sparkles className="h-5 w-5" />
              </Button>
            </Link>
            <SavedJobsBadge />
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <FileText className="h-5 w-5" />
            </Button>
            <Link href="/pricing">
              <Button className="hidden md:flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          </>
        )}
        {user.type === "RECRUITER" && (
          <Link href="/recruiter/jobs/new">
            <Button className="hidden md:flex bg-gradient-primary hover:bg-gradient-primary-hover text-white">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </Link>
        )}
        <UserMenu />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/auth">
        <Button variant="ghost" size="icon" className="hidden md:flex" title="Match Checks — sign in">
          <Sparkles className="h-5 w-5" />
        </Button>
      </Link>
      <SavedJobsBadge />
      <Button variant="ghost" size="icon" className="hidden md:flex">
        <FileText className="h-5 w-5" />
      </Button>
      <Link href="/pricing">
        <Button className="hidden md:flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
          <Crown className="h-4 w-4 mr-2" />
          Upgrade
        </Button>
      </Link>
      <Link href="/auth" aria-label="Sign in">
        <Button variant="ghost" size="icon">
          <UserIcon className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  )
}
