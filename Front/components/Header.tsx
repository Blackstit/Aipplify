"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  Bookmark, 
  FileText, 
  Crown,
  User,
  Plus,
} from "lucide-react"
import { getCurrentUser, type User as UserType } from "@/lib/session"
import { UserMenu } from "./UserMenu"
import { SavedJobsBadge } from "./SavedJobsBadge"

export function Header() {
  const [user, setUser] = useState<UserType | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUser())
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      setUser(getCurrentUser())
    }
    window.addEventListener("storage", handleStorageChange)
    
    // Custom event for same-tab login/logout
    window.addEventListener("user-changed", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("user-changed", handleStorageChange)
    }
  }, [])

  if (!mounted) {
    return (
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-6 w-6 bg-gradient-primary rounded"></div>
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Aipplify
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gradient-primary rounded"></div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Aipplify
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
                Jobs
              </Link>
              <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
                Blog
              </Link>
              <Link href="/for-recruiters" className="text-sm font-medium hover:text-primary transition-colors">
                For Recruiters
              </Link>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.type === "CANDIDATE" && (
                  <>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <Sparkles className="h-5 w-5" />
                    </Button>
                    <SavedJobsBadge />
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <FileText className="h-5 w-5" />
                    </Button>
                    <Button className="hidden md:flex">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade
                    </Button>
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
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Sparkles className="h-5 w-5" />
                </Button>
                <SavedJobsBadge />
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <FileText className="h-5 w-5" />
                </Button>
                <Button className="hidden md:flex">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
                <Link href="/auth">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
