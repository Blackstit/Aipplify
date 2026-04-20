import Link from "next/link"
import { HeaderUserArea } from "./HeaderUserArea"

/**
 * Server-rendered header. Menu и логотип всегда в HTML
 * (видно поисковикам и при отключённом JS).
 * Правая часть (auth/user) — клиентская, но рендерится в гостевом виде на сервере
 * и оживает после гидрации — без «исчезающего» меню.
 */
export function Header() {
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
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
                Jobs
              </Link>
              <Link href="/companies" className="text-sm font-medium hover:text-primary transition-colors">
                Companies
              </Link>
              <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
                Blog
              </Link>
              <Link href="/for-recruiters" className="text-sm font-medium hover:text-primary transition-colors">
                For Recruiters
              </Link>
            </nav>
          </div>

          <HeaderUserArea />
        </div>
      </div>
    </header>
  )
}
